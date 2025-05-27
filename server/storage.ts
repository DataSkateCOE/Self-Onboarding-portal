import { 
  type User, 
  type InsertUser,
  type Partner,
  type InsertPartner,
  type Document,
  type InsertDocument,
  type Approval,
  type InsertApproval,
  type Certificate,
  type InsertCertificate
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Partner methods
  getAllPartners(): Promise<Partner[]>;
  getPartner(id: number): Promise<Partner | undefined>;
  getPartnerByUserId(userId: number): Promise<Partner | undefined>;
  createPartner(partner: InsertPartner): Promise<Partner>;
  updatePartner(id: number, partner: Partial<InsertPartner>): Promise<Partner>;
  deletePartner(id: number): Promise<void>;
  
  // Document methods
  getAllDocuments(): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  getDocumentsByPartnerId(partnerId: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  deleteDocument(id: number): Promise<void>;
  
  // Approval methods
  getAllApprovals(): Promise<Approval[]>;
  getApproval(id: number): Promise<Approval | undefined>;
  getPendingApprovals(): Promise<Approval[]>;
  createApproval(approval: InsertApproval): Promise<Approval>;
  updateApproval(id: number, approval: Partial<InsertApproval>): Promise<Approval>;
  
  // Certificate methods
  getAllCertificates(): Promise<Certificate[]>;
  getCertificate(id: number): Promise<Certificate | undefined>;
  getCertificatesByUserId(userId: number): Promise<Certificate[]>;
  createCertificate(certificate: InsertCertificate): Promise<Certificate>;
  deleteCertificate(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private partners: Map<number, Partner>;
  private documents: Map<number, Document>;
  private approvals: Map<number, Approval>;
  private certificates: Map<number, Certificate>;
  
  private userIdCounter: number;
  private partnerIdCounter: number;
  private documentIdCounter: number;
  private approvalIdCounter: number;
  private certificateIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.partners = new Map();
    this.documents = new Map();
    this.approvals = new Map();
    this.certificates = new Map();
    
    this.userIdCounter = 1;
    this.partnerIdCounter = 1;
    this.documentIdCounter = 1;
    this.approvalIdCounter = 1;
    this.certificateIdCounter = 1;
    
    // Initialize with some default data
    this.initializeDefaultData();
  }
  
  private initializeDefaultData() {
    // Create default admin user
    this.createUser({
      username: "admin",
      password: "admin123",
      fullName: "Admin User",
      email: "admin@example.com",
      role: "admin",
    });
    
    // Create default partner user
    this.createUser({
      username: "partner",
      password: "partner123",
      fullName: "Partner User",
      email: "partner@example.com",
      role: "partner",
      companyName: "Acme Corporation",
    });
    
    // Create a sample partner
    this.createPartner({
      userId: 2,
      companyName: "Acme Corporation",
      contactName: "John Smith",
      contactEmail: "john@acmecorp.com",
      contactPhone: "555-123-4567",
      address: "123 Main St",
      city: "Anytown",
      state: "CA",
      zipCode: "12345",
      country: "USA",
      partnerType: "B2B_EDI",
      status: "PENDING_APPROVAL",
      currentStep: 3,
      totalSteps: 4,
      submittedAt: new Date().toISOString(),
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const users = Array.from(this.users.values());
    return users.find(user => user.username === username);
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Partner methods
  async getAllPartners(): Promise<Partner[]> {
    return Array.from(this.partners.values());
  }
  
  async getPartner(id: number): Promise<Partner | undefined> {
    return this.partners.get(id);
  }
  
  async getPartnerByUserId(userId: number): Promise<Partner | undefined> {
    const partners = Array.from(this.partners.values());
    return partners.find(partner => partner.userId === userId);
  }
  
  async createPartner(insertPartner: InsertPartner): Promise<Partner> {
    const id = this.partnerIdCounter++;
    const partner: Partner = { ...insertPartner, id };
    this.partners.set(id, partner);
    return partner;
  }
  
  async updatePartner(id: number, partialPartner: Partial<InsertPartner>): Promise<Partner> {
    const partner = this.partners.get(id);
    if (!partner) {
      throw new Error(`Partner with ID ${id} not found`);
    }
    
    const updatedPartner = { ...partner, ...partialPartner };
    this.partners.set(id, updatedPartner);
    
    return updatedPartner;
  }
  
  async deletePartner(id: number): Promise<void> {
    // Delete related documents and approvals first
    const documents = await this.getDocumentsByPartnerId(id);
    for (const doc of documents) {
      await this.deleteDocument(doc.id);
    }
    
    const approvals = Array.from(this.approvals.values())
      .filter(approval => approval.partnerId === id);
    for (const approval of approvals) {
      this.approvals.delete(approval.id);
    }
    
    this.partners.delete(id);
  }
  
  // Document methods
  async getAllDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values());
  }
  
  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }
  
  async getDocumentsByPartnerId(partnerId: number): Promise<Document[]> {
    const documents = Array.from(this.documents.values());
    return documents.filter(doc => doc.partnerId === partnerId);
  }
  
  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.documentIdCounter++;
    const now = new Date();
    const document: Document = { 
      ...insertDocument, 
      id,
      uploadedAt: insertDocument.uploadedAt || now.toISOString(),
    };
    this.documents.set(id, document);
    return document;
  }
  
  async deleteDocument(id: number): Promise<void> {
    this.documents.delete(id);
  }
  
  // Approval methods
  async getAllApprovals(): Promise<Approval[]> {
    return Array.from(this.approvals.values());
  }
  
  async getApproval(id: number): Promise<Approval | undefined> {
    return this.approvals.get(id);
  }
  
  async getPendingApprovals(): Promise<Approval[]> {
    const approvals = Array.from(this.approvals.values());
    return approvals.filter(approval => approval.status === "PENDING");
  }
  
  async createApproval(insertApproval: InsertApproval): Promise<Approval> {
    const id = this.approvalIdCounter++;
    const now = new Date().toISOString();
    const approval: Approval = { 
      ...insertApproval, 
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.approvals.set(id, approval);
    return approval;
  }
  
  async updateApproval(id: number, partialApproval: Partial<InsertApproval>): Promise<Approval> {
    const approval = this.approvals.get(id);
    if (!approval) {
      throw new Error(`Approval with ID ${id} not found`);
    }
    
    const updatedApproval = { 
      ...approval, 
      ...partialApproval,
      updatedAt: new Date().toISOString(),
    };
    this.approvals.set(id, updatedApproval);
    
    return updatedApproval;
  }

  // Certificate methods
  async getAllCertificates(): Promise<Certificate[]> {
    return Array.from(this.certificates.values());
  }
  
  async getCertificate(id: number): Promise<Certificate | undefined> {
    return this.certificates.get(id);
  }
  
  async getCertificatesByUserId(userId: number): Promise<Certificate[]> {
    return Array.from(this.certificates.values()).filter(
      certificate => certificate.userId === userId
    );
  }
  
  async createCertificate(insertCertificate: InsertCertificate): Promise<Certificate> {
    const id = this.certificateIdCounter++;
    const now = new Date();
    
    const certificate: Certificate = {
      ...insertCertificate,
      id,
      uploadedAt: now
    };
    
    this.certificates.set(id, certificate);
    return certificate;
  }
  
  async deleteCertificate(id: number): Promise<void> {
    if (!this.certificates.has(id)) {
      throw new Error(`Certificate with id ${id} not found`);
    }
    
    this.certificates.delete(id);
  }
}

// Import DatabaseStorage
import { DatabaseStorage } from "./database-storage";

// Export an instance of DatabaseStorage to be used throughout the application
export const storage = new DatabaseStorage();
