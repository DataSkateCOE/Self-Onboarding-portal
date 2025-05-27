import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { upload, uploadMemory } from "./middlewares/upload";
import {
  insertPartnerSchema,
  insertDocumentSchema,
  insertApprovalSchema,
  insertCertificateSchema,
  partnerTypes,
  onboardingStatuses
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Azure callback endpoint - IMPORTANT
  app.get("/callback", (req, res) => {
    // This endpoint is needed for Azure AD authentication to work
    // It will be hit after successful authentication
    console.log("Azure AD callback received", req.query);
    res.redirect("/");
  });

  // API Routes
  // User Authentication
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);

      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // In a real app, you would create a JWT token or session here
      return res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Azure configuration endpoint
  app.get("/api/azure-config", (req, res) => {
    try {
      // Get the protocol and host from the request
      const protocol = req.protocol;
      const host = req.get('host');
      const baseUrl = `${protocol}://${host}`;
      
      // Use the correct configuration from the Azure portal
      // Hardcoding for immediate testing since environment variables are not updating
      const clientId = "4b0c180d-5156-49bd-b04e-3b60a35eed80"; // Application (client) ID
      const tenantId = "a11bcc1d-8378-4456-9586-266a7e4159a5"; // Directory (tenant) ID
      
      console.log("Using updated Azure configuration values");
      
      // Return Azure AD configuration 
      res.json({
        clientId: clientId,
        tenantId: tenantId,
        // The redirect URI will be set on the client side - we don't need to send it
      });
      
      console.log("Serving Azure config:", { clientId, tenantId });
    } catch (error) {
      console.error("Azure config error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Azure AD authentication
  app.post("/api/auth/azure", async (req, res) => {
    try {
      const { accountId, username, name } = req.body;
      
      // Check if user already exists by username
      let user = await storage.getUserByUsername(username);
      
      if (!user) {
        // Create a new user from Azure AD data
        // Using field names that match our database columns
        user = await storage.createUser({
          username,
          fullName: name || username, // This will be mapped to fullname
          email: username,
          password: `azure_${accountId}`, // This is just a placeholder, not used for login
          role: "partner", // Default role for Azure users
          companyName: null, // This will be mapped to companyname
        });
        
        console.log(`Created new user from Azure AD: ${username}`);
      }
      
      // In a real app, you would create a JWT token or session here
      return res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      console.error("Azure authentication error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/me", async (req, res) => {
    try {
      // First try to get the admin user
      let user = await storage.getUserByUsername("admin");
      
      // If admin user doesn't exist, try to get the test user we created
      if (!user) {
        user = await storage.getUserByUsername("testuser");
      }
      
      // If we have a user, return it
      if (user) {
        return res.json({ ...user, password: undefined });
      }
      
      // Otherwise, create a new admin user
      const newUser = await storage.createUser({
        username: "admin",
        fullName: "Admin User",
        email: "admin@example.com",
        password: "admin123", // In production, use a secure password
        role: "admin",
        companyName: "Admin Company",
      });
      
      return res.json({ ...newUser, password: undefined });
    } catch (error) {
      console.error("Get me error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Logout endpoint
  app.post("/api/logout", (req, res) => {
    try {
      // In a real app, this would clear the user's session or invalidate their token
      // For this demo, we'll simply return a success message
      console.log("User logged out");
      res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Partners
  app.get("/api/partners", async (req, res) => {
    try {
      // If userId query param is provided, get partner by userId
      if (req.query.userId) {
        const userId = parseInt(req.query.userId as string);
        const partner = await storage.getPartnerByUserId(userId);
        
        if (partner) {
          return res.json([partner]); // Return as array for consistent API response
        }
        return res.json([]);
      }
      
      // Otherwise get all partners
      const partners = await storage.getAllPartners();
      res.json(partners);
    } catch (error) {
      console.error("Get partners error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/partners/:id", async (req, res) => {
    try {
      const partner = await storage.getPartner(parseInt(req.params.id));
      if (!partner) {
        return res.status(404).json({ message: "Partner not found" });
      }
      res.json(partner);
    } catch (error) {
      console.error("Get partner error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/partner/me", async (req, res) => {
    try {
      // In a real app, this would get the partner by the authenticated user's ID
      // For demo purposes, we'll return the first partner
      const partners = await storage.getAllPartners();
      if (partners.length > 0) {
        return res.json(partners[0]);
      }
      return res.status(404).json({ message: "Partner not found" });
    } catch (error) {
      console.error("Get partner/me error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/partners", async (req, res) => {
    try {
      // Validate the request body with partial schema to allow interfaceConfig
      const partialSchema = insertPartnerSchema.extend({
        interfaceConfig: z.any().optional(),
      });
      
      const validatedData = partialSchema.parse(req.body);
      const userId = 1;
      
      // Map interfaceConfig fields to partner columns (from interfaceConfig.interface)
      const interfaceConfig = validatedData.interfaceConfig || {};
      const interfaceFields = interfaceConfig.interface || {};
      const partnerData = {
        ...validatedData,
        protocol: interfaceFields.protocol,
        auth_type: interfaceFields.auth_type,
        direction: interfaceFields.direction,
        username: interfaceFields.username,
        password: interfaceFields.password,
        http_header_name: interfaceFields.http_header_name,
        api_key_value: interfaceFields.api_key_value,
        identity_key_id: interfaceFields.identity_key_id,
        host: interfaceFields.host,
        port: interfaceFields.port,
        character_encoding: interfaceFields.character_encoding,
        source_path: interfaceFields.source_path,
        support_format_type: interfaceFields.support_format_type,
        file_name_pattern: interfaceFields.file_name_pattern,
        archival_path: interfaceFields.archival_path,
        additional_settings: interfaceFields.additional_settings,
        userId,
        status: "PENDING_APPROVAL"
      };
      console.log("[POST /api/partners] Inserting partnerData:", JSON.stringify(partnerData, null, 2));
      const partner = await storage.createPartner(partnerData);
      console.log("[POST /api/partners] Inserted partner:", JSON.stringify(partner, null, 2));
      
      // Automatically create an approval record for this partner
      await storage.createApproval({
        partnerId: partner.id,
        approverId: 1, // Default to admin user as the approver
        status: "PENDING",
        comments: "Pending review by admin",
      });
      
      res.status(201).json(partner);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Create partner error:", error);
      res.status(500).json({ 
        message: "Internal server error", 
        details: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  app.patch("/api/partners/:id", async (req, res) => {
    try {
      const partnerId = parseInt(req.params.id);
      const partner = await storage.getPartner(partnerId);
      
      if (!partner) {
        return res.status(404).json({ message: "Partner not found" });
      }
      
      // Validate the request body against a schema that allows partial updates
      const validatedData = insertPartnerSchema.partial().parse(req.body);
      
      // Update the partner
      const updatedPartner = await storage.updatePartner(partnerId, validatedData);
      
      res.json(updatedPartner);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Update partner error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Documents
  app.get("/api/documents", async (req, res) => {
    try {
      const documents = await storage.getAllDocuments();
      res.json(documents);
    } catch (error) {
      console.error("Get documents error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/partners/:partnerId/documents", async (req, res) => {
    try {
      const partnerId = parseInt(req.params.partnerId);
      const documents = await storage.getDocumentsByPartnerId(partnerId);
      res.json(documents);
    } catch (error) {
      console.error("Get partner documents error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/partners/:partnerId/documents", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const partnerId = parseInt(req.params.partnerId);
      const partner = await storage.getPartner(partnerId);
      
      if (!partner) {
        return res.status(404).json({ message: "Partner not found" });
      }
      
      // Create the document
      const document = await storage.createDocument({
        partnerId,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        documentType: req.body.documentType || "certificate",
        storagePath: req.file.path,
      });
      
      res.status(201).json(document);
    } catch (error) {
      console.error("Upload document error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const document = await storage.getDocument(documentId);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Delete the file from the filesystem
      try {
        fs.unlinkSync(document.storagePath);
      } catch (err) {
        console.error("Error deleting file:", err);
      }
      
      // Delete the document record
      await storage.deleteDocument(documentId);
      
      res.status(204).send();
    } catch (error) {
      console.error("Delete document error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Approvals
  app.get("/api/approvals", async (req, res) => {
    try {
      const approvals = await storage.getAllApprovals();
      res.json(approvals);
    } catch (error) {
      console.error("Get approvals error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get approvals completed in the current month
  app.get("/api/approvals/completed-this-month", async (req, res) => {
    try {
      const allApprovals = await storage.getAllApprovals();
      
      // Filter approvals that are APPROVED and have been updated this month
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const completedThisMonth = allApprovals.filter(approval => {
        return approval.status === "APPROVED" && 
               approval.updatedAt >= firstDayOfMonth;
      });
      
      // Enhance the approvals with partner details
      const enhancedApprovals = await Promise.all(
        completedThisMonth.map(async (approval) => {
          try {
            const partner = await storage.getPartner(approval.partnerId);
            
            // Get documents for this partner
            const documents = await storage.getDocumentsByPartnerId(approval.partnerId);
            
            // Merge the partner data with the approval
            return {
              ...approval,
              // Include partner details
              companyName: partner?.companyName || 'Unknown',
              contactName: partner?.contactName || 'Unknown',
              contactEmail: partner?.contactEmail || 'Unknown',
              contactPhone: partner?.contactPhone || 'Unknown',
              partnerType: partner?.partnerType || 'GENERIC',
              status: partner?.status || 'APPROVED',
              approvedAt: partner?.approvedAt,
              // Include documents
              documents: documents || [],
              // Add a property to indicate this is an enhanced approval
              isEnhanced: true
            };
          } catch (err) {
            console.error(`Error enhancing approval ${approval.id}:`, err);
            return approval;
          }
        })
      );
      
      res.json(enhancedApprovals);
    } catch (error) {
      console.error("Get completed approvals error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/approvals/pending", async (req, res) => {
    try {
      const pendingApprovals = await storage.getPendingApprovals();
      // Enhance the approvals with partner details
      const enhancedApprovals = await Promise.all(
        pendingApprovals.map(async (approval) => {
          try {
            const partner = await storage.getPartner(approval.partnerId);
            // Get documents for this partner
            const documents = await storage.getDocumentsByPartnerId(approval.partnerId);
            // Merge the partner data with the approval
            return {
              ...approval,
              companyName: partner?.companyName || 'Unknown',
              contactName: partner?.contactName || 'Unknown',
              contactEmail: partner?.contactEmail || 'Unknown',
              contactPhone: partner?.contactPhone || 'Unknown',
              partnerType: partner?.partnerType || 'GENERIC',
              status: partner?.status || 'PENDING_APPROVAL',
              submittedAt: partner?.submittedAt,
              interfaceConfig: partner ? {
                interface: {
                  protocol: partner.protocol,
                  authType: partner.auth_type,
                  direction: partner.direction,
                  username: partner.username,
                  password: partner.password,
                  httpHeaderName: partner.http_header_name,
                  apiKeyValue: partner.api_key_value,
                  identityKeyId: partner.identity_key_id,
                  host: partner.host,
                  port: partner.port,
                  characterEncoding: partner.character_encoding,
                  sourcePath: partner.source_path,
                  supportFormatType: partner.support_format_type,
                  fileNamePattern: partner.file_name_pattern,
                  archivalPath: partner.archival_path,
                  additionalSettings: partner.additional_settings,
                }
              } : undefined,
              documents: documents || [],
              isEnhanced: true
            };
          } catch (err) {
            console.error(`Error enhancing approval ${approval.id}:`, err);
            return approval;
          }
        })
      );
      res.json(enhancedApprovals);
    } catch (error) {
      console.error("Get pending approvals error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/approvals/:partnerId", async (req, res) => {
    try {
      const partnerId = parseInt(req.params.partnerId);
      console.log(`Processing approval for partner ID: ${partnerId}`);
      
      const partner = await storage.getPartner(partnerId);
      
      if (!partner) {
        console.log(`Partner with ID ${partnerId} not found`);
        return res.status(404).json({ message: "Partner not found" });
      }
      
      console.log(`Found partner: ${partner.companyName} (ID: ${partner.id})`);
      
      // Get existing approval or create a new one
      let approval;
      const existingApprovals = await storage.getAllApprovals();
      const existingApproval = existingApprovals.find(a => a.partnerId === partnerId);
      
      if (existingApproval) {
        console.log(`Updating existing approval ID: ${existingApproval.id}`);
        // Update existing approval
        approval = await storage.updateApproval(existingApproval.id, {
          status: req.body.status,
          comments: req.body.comments,
          approverId: 1, // Default to admin user as the approver
        });
      } else {
        console.log(`Creating new approval for partner ID: ${partnerId}`);
        // Create new approval
        approval = await storage.createApproval({
          partnerId,
          status: req.body.status,
          comments: req.body.comments || "",
          approverId: 1, // Default to admin user as the approver
        });
      }
      
      // Update partner status based on approval
      let partnerUpdate = {};
      if (req.body.status === "APPROVED") {
        partnerUpdate = {
          status: "APPROVED" as typeof onboardingStatuses[number],
          approvedAt: new Date(),
        };
      } else if (req.body.status === "REJECTED") {
        partnerUpdate = {
          status: "REJECTED" as typeof onboardingStatuses[number],
          rejectedAt: new Date(),
        };
      }
      
      if (Object.keys(partnerUpdate).length > 0) {
        console.log(`Updating partner status to: ${req.body.status}`);
        await storage.updatePartner(partnerId, partnerUpdate);
      }
      
      res.status(200).json(approval);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Approval error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Note: Azure configuration endpoint is already defined above
  
  // Statistics for the dashboard
  app.get("/api/stats", async (req, res) => {
    try {
      const partners = await storage.getAllPartners();
      const approvals = await storage.getAllApprovals();
      
      // Calculate approvals completed this month
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const completedThisMonth = approvals.filter(approval => {
        return approval.status === "APPROVED" && 
               approval.updatedAt >= firstDayOfMonth;
      });
      
      const stats = {
        totalPartners: partners.length,
        pendingApprovals: partners.filter(p => p.status === "PENDING_APPROVAL").length,
        approvedPartners: partners.filter(p => p.status === "APPROVED").length,
        completedThisMonth: completedThisMonth.length
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Get stats error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Certificate routes
  // Test Supabase connection
app.get("/api/test-supabase", async (req, res) => {
  try {
    console.log("Testing Supabase connection...");
    const { testBucketConnection } = await import('./storage-client');
    
    const result = await testBucketConnection();
    
    if (result) {
      return res.json({ success: true, message: "Supabase connection successful!" });
    } else {
      return res.status(500).json({ success: false, message: "Supabase connection failed." });
    }
  } catch (error) {
    console.error("Error in Supabase connection test:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Supabase connection test error", 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

app.get("/api/certificates", async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      
      // If userId is provided, get certificates for that user
      if (userId) {
        const certificates = await storage.getCertificatesByUserId(userId);
        return res.json(certificates);
      }
      
      // Otherwise, get all certificates
      const certificates = await storage.getAllCertificates();
      res.json(certificates);
    } catch (error) {
      console.error("Get certificates error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/certificates/:id", async (req, res) => {
    try {
      const certificate = await storage.getCertificate(parseInt(req.params.id));
      
      if (!certificate) {
        return res.status(404).json({ message: "Certificate not found" });
      }
      
      res.json(certificate);
    } catch (error) {
      console.error("Get certificate error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/certificates", uploadMemory.single("file"), async (req, res) => {
    console.log("======= CERTIFICATE UPLOAD ENDPOINT START =======");
    console.log("Headers:", JSON.stringify(req.headers, null, 2));
    console.log("Body fields:", JSON.stringify(req.body, null, 2));
    
    try {
      if (!req.file) {
        console.error("No file uploaded in request");
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      console.log("File information received:", {
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        encoding: req.file.encoding,
        fieldname: req.file.fieldname,
        buffer: {
          present: !!req.file.buffer,
          length: req.file.buffer ? req.file.buffer.length : 0,
          isBuffer: req.file.buffer ? Buffer.isBuffer(req.file.buffer) : false
        }
      });
      
      // Import the uploadCertificate function
      console.log("Importing uploadCertificate function...");
      const { uploadCertificate } = await import('./storage-client');
      
      try {
        // Check if buffer exists
        if (!req.file.buffer) {
          console.error("File buffer is missing in the request");
          throw new Error("File buffer is missing");
        }
        
        console.log("Calling Supabase upload function...");
        // Upload the file to Supabase Storage
        const { url, path } = await uploadCertificate(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype
        );
        
        console.log("Supabase upload successful:", { url, path });
        
        // In a real app, you would get this from the user session
        const userId = req.body.userId || 1; // Default to admin user
        console.log(`Using userId: ${userId}`);
        
        console.log("Creating certificate record in database...");
        // Create the certificate in the database with the Supabase storage URL
        const certificate = await storage.createCertificate({
          userId,
          fileName: req.file.originalname,
          fileType: req.file.mimetype,
          fileSize: req.file.size,
          documentType: req.body.documentType || "certificate",
          alias: req.body.alias || null,
          description: req.body.description || null,
          storagePath: path,
          storageUrl: url
        });
        
        console.log("Certificate record created:", certificate);
        console.log("======= CERTIFICATE UPLOAD ENDPOINT SUCCESS =======");
        
        res.status(201).json(certificate);
      } catch (uploadError: any) {
        console.error("======= UPLOAD TO SUPABASE FAILED =======");
        console.error("Error in Supabase upload:", uploadError);
        console.error("Error details:", {
          message: uploadError.message,
          name: uploadError.name,
          code: uploadError.code,
          stack: uploadError.stack,
        });
        
        return res.status(400).json({ 
          message: "Certificate upload failed", 
          details: uploadError.message || "Unknown error during file upload to storage",
          error: {
            code: uploadError.code,
            name: uploadError.name
          }
        });
      }
    } catch (error: any) {
      console.error("======= CERTIFICATE UPLOAD ENDPOINT ERROR =======");
      console.error("Unhandled error in certificate upload endpoint:", error);
      console.error("Error details:", {
        message: error.message,
        name: error.name,
        code: error.code,
        stack: error.stack,
      });
      
      res.status(500).json({ 
        message: "Internal server error", 
        details: error instanceof Error ? error.message : "Unknown error",
        error: {
          code: error.code,
          name: error.name
        }
      });
    }
  });
  
  app.delete("/api/certificates/:id", async (req, res) => {
    try {
      const certificateId = parseInt(req.params.id);
      const certificate = await storage.getCertificate(certificateId);
      
      if (!certificate) {
        return res.status(404).json({ message: "Certificate not found" });
      }
      
      // Delete the file from Supabase storage if we have a storage path
      if (certificate.storagePath) {
        try {
          const { deleteCertificate } = await import('./storage-client');
          await deleteCertificate(certificate.storagePath);
        } catch (err) {
          console.error("Error deleting certificate file from storage:", err);
        }
      }
      
      // Delete the certificate record from the database
      await storage.deleteCertificate(certificateId);
      
      res.status(204).send();
    } catch (error) {
      console.error("Delete certificate error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
