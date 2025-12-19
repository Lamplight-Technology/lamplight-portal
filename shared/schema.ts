import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  logo: text("logo"),
  logoHeight: integer("logo_height").default(40),
  showNameWithLogo: boolean("show_name_with_logo").default(false),
  titleFontFamily: text("title_font_family").default("Inter"),
  titleFontSize: integer("title_font_size").default(24),
  titleFontWeight: text("title_font_weight").default("700"),
  titleColor: text("title_color").default("#0f172a"),
  sloganText: text("slogan_text"),
  sloganFontFamily: text("slogan_font_family").default("Inter"),
  sloganFontSize: integer("slogan_font_size").default(14),
  sloganFontWeight: text("slogan_font_weight").default("400"),
  sloganColor: text("slogan_color").default("#64748b"),
  headerPaddingY: integer("header_padding_y").default(16),
  heroTitle: text("hero_title").notNull(),
  heroDescription: text("hero_description").notNull(),
  aboutTitle: text("about_title").notNull(),
  aboutDescription: text("about_description").notNull(),
  contactEmail: text("contact_email"),
  siteTitle: text("site_title"),
  maintenanceMode: boolean("maintenance_mode").default(false),
  footerBlurb: text("footer_blurb"),
  showPlatforms: boolean("show_platforms").default(true),
  showAbout: boolean("show_about").default(true),
  showContact: boolean("show_contact").default(true),
});

export const platforms = pgTable("platforms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  link: text("link").notNull(),
  logo: text("logo"),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
});

export const insertPlatformSchema = createInsertSchema(platforms).omit({
  id: true,
});

export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;
export type InsertPlatform = z.infer<typeof insertPlatformSchema>;
export type Platform = typeof platforms.$inferSelect;

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  auth0Sub: text("auth0_sub"),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
});

export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;

export const legalDocuments = pgTable("legal_documents", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'privacy', 'terms', 'cookies', 'support'
  title: text("title").notNull(),
  content: text("content").notNull(),
  isActive: boolean("is_active").default(true),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertLegalDocumentSchema = createInsertSchema(legalDocuments).omit({
  id: true,
  lastUpdated: true,
});

export type InsertLegalDocument = z.infer<typeof insertLegalDocumentSchema>;
export type LegalDocument = typeof legalDocuments.$inferSelect;
