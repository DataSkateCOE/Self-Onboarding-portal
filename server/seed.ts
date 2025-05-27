// Seed script to populate the database with initial data
import { db } from "./db";
import { users, partners, documents, approvals } from "@shared/schema";

async function seedDatabase() {
  console.log("Starting database seeding...");

  try {
    // Create admin user
    const [adminUser] = await db
      .insert(users)
      .values({
        username: "admin",
        password: "admin123", // In production, this should be hashed
        fullName: "Admin User",
        email: "admin@example.com",
        role: "admin",
        companyName: null,
      })
      .returning();

    console.log("Admin user created:", adminUser);

    // Create partner user
    const [partnerUser] = await db
      .insert(users)
      .values({
        username: "partner",
        password: "partner123", // In production, this should be hashed
        fullName: "Partner User",
        email: "partner@example.com",
        role: "partner",
        companyName: "Acme Corporation",
      })
      .returning();

    console.log("Partner user created:", partnerUser);

    // Create a partner record
    const [partner] = await db
      .insert(partners)
      .values({
        companyName: "Acme Corporation",
        userId: partnerUser.id,
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
        submittedAt: new Date(),
        approvedAt: null,
        rejectedAt: null,
        notes: "This is a sample partner",
      })
      .returning();

    console.log("Partner created:", partner);

    // Create a sample document
    const [document] = await db
      .insert(documents)
      .values({
        partnerId: partner.id,
        fileName: "sample_contract.pdf",
        fileType: "application/pdf",
        fileSize: 1024 * 1024,
        documentType: "Contract",
        storagePath: "/uploads/sample_contract.pdf",
        uploadedAt: new Date(),
      })
      .returning();

    console.log("Document created:", document);

    // Create a sample approval request
    const [approval] = await db
      .insert(approvals)
      .values({
        partnerId: partner.id,
        status: "PENDING",
        approverId: adminUser.id,
        comments: "Pending review by admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    console.log("Approval created:", approval);

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seedDatabase();