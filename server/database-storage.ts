import { db } from "./db";
import { users, partners, documents, approvals, certificates } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import type { IStorage } from "./storage";
import type {
  User,
  InsertUser,
  Partner,
  InsertPartner,
  Document,
  InsertDocument,
  Approval,
  InsertApproval,
  Certificate,
  InsertCertificate,
} from "@shared/schema";

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Partner methods
  async getAllPartners(): Promise<Partner[]> {
    return await db.select().from(partners);
  }

  async getPartner(id: number): Promise<Partner | undefined> {
    const [partner] = await db.select().from(partners).where(eq(partners.id, id));
    return partner || undefined;
  }

  async getPartnerByUserId(userId: number): Promise<Partner | undefined> {
    const [partner] = await db.select().from(partners).where(eq(partners.userId, userId));
    return partner || undefined;
  }

  async createPartner(insertPartner: InsertPartner): Promise<Partner> {
    const [partner] = await db.insert(partners).values(insertPartner).returning();
    return partner;
  }

  async updatePartner(id: number, partialPartner: Partial<InsertPartner>): Promise<Partner> {
    const [updatedPartner] = await db
      .update(partners)
      .set(partialPartner)
      .where(eq(partners.id, id))
      .returning();
    return updatedPartner;
  }

  async deletePartner(id: number): Promise<void> {
    await db.delete(partners).where(eq(partners.id, id));
  }

  // Document methods
  async getAllDocuments(): Promise<Document[]> {
    return await db.select().from(documents);
  }

  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document || undefined;
  }

  async getDocumentsByPartnerId(partnerId: number): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(eq(documents.partnerId, partnerId));
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const [document] = await db.insert(documents).values(insertDocument).returning();
    return document;
  }

  async deleteDocument(id: number): Promise<void> {
    await db.delete(documents).where(eq(documents.id, id));
  }

  // Approval methods
  async getAllApprovals(): Promise<Approval[]> {
    return await db.select().from(approvals);
  }

  async getApproval(id: number): Promise<Approval | undefined> {
    const [approval] = await db.select().from(approvals).where(eq(approvals.id, id));
    return approval || undefined;
  }

  async getPendingApprovals(): Promise<Approval[]> {
    return await db
      .select()
      .from(approvals)
      .where(eq(approvals.status, "PENDING"));
  }

  async createApproval(insertApproval: InsertApproval): Promise<Approval> {
    const [approval] = await db.insert(approvals).values(insertApproval).returning();
    return approval;
  }

  async updateApproval(id: number, partialApproval: Partial<InsertApproval>): Promise<Approval> {
    const [updatedApproval] = await db
      .update(approvals)
      .set(partialApproval)
      .where(eq(approvals.id, id))
      .returning();
    return updatedApproval;
  }
  
  // Certificate methods
  async getAllCertificates(): Promise<Certificate[]> {
    return await db.select().from(certificates);
  }
  
  async getCertificate(id: number): Promise<Certificate | undefined> {
    const [certificate] = await db.select().from(certificates).where(eq(certificates.id, id));
    return certificate;
  }
  
  async getCertificatesByUserId(userId: number): Promise<Certificate[]> {
    return await db.select().from(certificates).where(eq(certificates.userId, userId));
  }
  
  async createCertificate(insertCertificate: InsertCertificate): Promise<Certificate> {
    const [certificate] = await db
      .insert(certificates)
      .values(insertCertificate)
      .returning();
    
    return certificate;
  }
  
  async deleteCertificate(id: number): Promise<void> {
    await db.delete(certificates).where(eq(certificates.id, id));
  }
}