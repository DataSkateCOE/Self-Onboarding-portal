import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("fullname").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("partner"),
  companyName: text("companyname"),
});

// Partner types enum
export const partnerTypes = ["B2B_EDI", "GENERIC"] as const;

// Onboarding status enum
export const onboardingStatuses = ["DRAFT", "SUBMITTED", "PENDING_APPROVAL", "APPROVED", "REJECTED"] as const;

// Partners table
export const partners = pgTable("partners", {
  id: serial("id").primaryKey(),
  userId: integer("userid").notNull().references(() => users.id),
  companyName: text("companyname").notNull(),
  contactName: text("contactname").notNull(),
  contactEmail: text("contactemail").notNull(),
  contactPhone: text("contactphone").notNull(),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("postalcode"),
  country: text("country"),
  industry: text("industry"),
  website: text("website"),
  partnerType: text("partnertype").$type<typeof partnerTypes[number]>().notNull(),
  status: text("status").$type<typeof onboardingStatuses[number]>().notNull().default("DRAFT"),
  submittedAt: timestamp("submittedat"),
  approvedAt: timestamp("approvedat"),
  rejectedAt: timestamp("rejectedat"),
  notes: text("notes"),
  createdAt: timestamp("createdat"),
  updatedAt: timestamp("updatedat"),
});

// Documents table
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  partnerId: integer("partnerid").notNull().references(() => partners.id),
  fileName: text("filename").notNull(),
  fileType: text("filetype").notNull(),
  fileSize: integer("filesize").notNull(),
  documentType: text("documenttype").notNull(),
  uploadedAt: timestamp("uploadedat").notNull().defaultNow(),
  storagePath: text("storagepath").notNull(),
});

// Approvals table
export const approvals = pgTable("approvals", {
  id: serial("id").primaryKey(),
  partnerId: integer("partnerid").notNull().references(() => partners.id),
  approverId: integer("approverid").references(() => users.id),
  status: text("status").$type<"PENDING" | "APPROVED" | "REJECTED">().notNull().default("PENDING"),
  comments: text("comments"),
  createdAt: timestamp("createdat").notNull().defaultNow(),
  updatedAt: timestamp("updatedat").notNull().defaultNow(),
});

// Certificates table (for user-owned certificates)
export const certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),
  userId: integer("userid").notNull().references(() => users.id),
  fileName: text("filename").notNull(),
  fileType: text("filetype").notNull(),
  fileSize: integer("filesize").notNull(),
  documentType: text("documenttype").notNull(),
  alias: text("alias"),
  description: text("description"),
  storagePath: text("storagepath").notNull(),
  storageUrl: text("storageurl"), // URL to access the file in Supabase storage
  uploadedAt: timestamp("uploadedat").notNull().defaultNow(),
});

// Sessions table (for authentication sessions)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: text("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// Insertion schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
  role: true,
  companyName: true,
});

export const insertPartnerSchema = createInsertSchema(partners).omit({
  id: true,
  submittedAt: true,
  approvedAt: true,
  rejectedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  uploadedAt: true,
});

export const insertApprovalSchema = createInsertSchema(approvals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCertificateSchema = createInsertSchema(certificates).omit({
  id: true,
  uploadedAt: true,
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  partners: many(partners),
  certificates: many(certificates),
}));

export const partnersRelations = relations(partners, ({ one, many }) => ({
  user: one(users, {
    fields: [partners.userId],
    references: [users.id],
  }),
  documents: many(documents),
  approvals: many(approvals),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  partner: one(partners, {
    fields: [documents.partnerId],
    references: [partners.id],
  }),
}));

export const approvalsRelations = relations(approvals, ({ one }) => ({
  partner: one(partners, {
    fields: [approvals.partnerId],
    references: [partners.id],
  }),
  approver: one(users, {
    fields: [approvals.approverId],
    references: [users.id],
  }),
}));

export const certificatesRelations = relations(certificates, ({ one }) => ({
  user: one(users, {
    fields: [certificates.userId],
    references: [users.id],
  }),
}));

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Partner = typeof partners.$inferSelect;
export type InsertPartner = z.infer<typeof insertPartnerSchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type Approval = typeof approvals.$inferSelect;
export type InsertApproval = z.infer<typeof insertApprovalSchema>;

export type Certificate = typeof certificates.$inferSelect;
export type InsertCertificate = z.infer<typeof insertCertificateSchema>;

// Form types
export const companyInfoSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  contactName: z.string().min(2, "Contact name is required"),
  contactEmail: z.string().email("Invalid email address"),
  contactPhone: z.string().min(10, "Phone number is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
});

export const securitySchema = z.object({
  selectedCertificateId: z.string().optional(),
  selectedCertificate: z.object({
    id: z.number(),
    fileName: z.string(),
    fileType: z.string(),
    fileSize: z.number(),
    documentType: z.string(),
    uploadedAt: z.date().or(z.string()),
    alias: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    storagePath: z.string(),
    storageUrl: z.string().optional().nullable(),
    userId: z.number()
  }).optional(),
});

export const interfaceSchema = z.object({
  protocol: z.string().optional(),
  authType: z.string().optional(),
  endpoints: z.array(z.object({
    name: z.string().optional(),
    url: z.string().optional(),
  })).optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  httpHeaderName: z.string().optional(),
  apiKeyValue: z.string().optional(),
  identityKeyId: z.string().optional(),
  host: z.string().optional(),
  port: z.string().optional(),
  characterEncoding: z.string().optional(),
  sourcePath: z.string().optional(),
  supportFormatType: z.string().optional(),
  fileNamePattern: z.string().optional(),
  archivalPath: z.string().optional(),
  additionalSettings: z.record(z.string()).optional(),
  direction: z.string().optional(),
}).superRefine((data, ctx) => {
  // Protocol-based validation
  if (["sftp", "ftp"].includes(data.protocol)) {
    if (!data.host) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Host is required", path: ["host"] });
    if (!data.port) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Port is required", path: ["port"] });
    if (!data.sourcePath) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Source path is required", path: ["sourcePath"] });
    if (!data.supportFormatType) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Support Format type is required", path: ["supportFormatType"] });
    if (!data.fileNamePattern) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "File name pattern is required", path: ["fileNamePattern"] });
    if (!data.archivalPath) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Archival path is required", path: ["archivalPath"] });
    // Auth type-based validation
    if (["basic", "basicIdentityKey"].includes(data.authType)) {
      if (!data.username) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Username is required", path: ["username"] });
      if (!data.password) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Password is required", path: ["password"] });
    }
    if (["identityKey", "basicIdentityKey"].includes(data.authType)) {
      if (!data.identityKeyId) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Identity Key is required", path: ["identityKeyId"] });
    }
  }
  if (data.protocol === "https") {
    // Only authType is required, but if API key is selected, require those fields
    if (data.authType === "basic") {
      if (!data.username) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Username is required", path: ["username"] });
      if (!data.password) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Password is required", path: ["password"] });
    }
    if (data.authType === "apiKey") {
      if (!data.httpHeaderName) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "HTTP header name is required", path: ["httpHeaderName"] });
      if (!data.apiKeyValue) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "API key is required", path: ["apiKeyValue"] });
    }
  }
  if (data.protocol === "as2") {
    if (!data.endpoints || data.endpoints.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "At least one endpoint is required", path: ["endpoints"] });
    }
  }
});

export const reviewSchema = z.object({
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

export type CompanyInfoFormData = z.infer<typeof companyInfoSchema>;
export type SecurityFormData = z.infer<typeof securitySchema>;
export type InterfaceFormData = z.infer<typeof interfaceSchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;
