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
  heroBadge: text("hero_badge"),
  heroTitle: text("hero_title").notNull(),
  heroTitleHighlight: text("hero_title_highlight"),
  heroDescription: text("hero_description").notNull(),
  heroButtonPrimary: text("hero_button_primary").default("Explore Our Platforms"),
  heroButtonSecondary: text("hero_button_secondary").default("Learn More"),
  heroBackgroundGradientFrom: text("hero_background_gradient_from").default("#0f172a"),
  heroBackgroundGradientVia: text("hero_background_gradient_via").default("#1e3a8a"),
  heroBackgroundGradientTo: text("hero_background_gradient_to").default("#312e81"),
  heroBlobColor1: text("hero_blob_color1").default("#3b82f6"),
  heroBlobColor2: text("hero_blob_color2").default("#a855f7"),
  heroBlobColor3: text("hero_blob_color3").default("#6366f1"),
  heroBackgroundImage: text("hero_background_image"),
  heroBackgroundImageOpacity: integer("hero_background_image_opacity").default(50),
  heroSideImage: text("hero_side_image"),
  aboutSectionLabel: text("about_section_label").default("Why Choose Us"),
  aboutTitle: text("about_title").notNull(),
  aboutDescription: text("about_description").notNull(),
  aboutCardsLayout: text("about_cards_layout").default("3-col"),
  platformsSectionLabel: text("platforms_section_label").default("Our Solutions"),
  platformsTitle: text("platforms_title"),
  platformsDescription: text("platforms_description"),
  contactSectionLabel: text("contact_section_label").default("Let's Connect"),
  contactTitle: text("contact_title"),
  contactDescription: text("contact_description"),
  contactButtonText: text("contact_button_text").default("Contact Us"),
  contactEmail: text("contact_email"),
  siteTitle: text("site_title"),
  maintenanceMode: boolean("maintenance_mode").default(false),
  footerBlurb: text("footer_blurb"),
  showPlatforms: boolean("show_platforms").default(true),
  showAbout: boolean("show_about").default(true),
  showContact: boolean("show_contact").default(true),
});

export const aboutFeatureCards = pgTable("about_feature_cards", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull().default(1),
  title: text("title").notNull(),
  description: text("description").notNull(),
  iconName: text("icon_name").notNull(),
  gradientFrom: text("gradient_from").notNull().default("#3b82f6"),
  gradientTo: text("gradient_to").notNull().default("#06b6d4"),
  borderColor: text("border_color").notNull().default("#dbeafe"),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
});

export const heroBadges = pgTable("hero_badges", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull().default(1),
  text: text("text").notNull(),
  iconName: text("icon_name").notNull(),
  iconColor: text("icon_color").notNull().default("#fbbf24"),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
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

export const insertAboutFeatureCardSchema = createInsertSchema(aboutFeatureCards).omit({
  id: true,
});

export const insertHeroBadgeSchema = createInsertSchema(heroBadges).omit({
  id: true,
});

export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;
export type InsertPlatform = z.infer<typeof insertPlatformSchema>;
export type Platform = typeof platforms.$inferSelect;
export type InsertAboutFeatureCard = z.infer<typeof insertAboutFeatureCardSchema>;
export type AboutFeatureCard = typeof aboutFeatureCards.$inferSelect;
export type InsertHeroBadge = z.infer<typeof insertHeroBadgeSchema>;
export type HeroBadge = typeof heroBadges.$inferSelect;

export const mediaFiles = pgTable("media_files", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  data: text("data").notNull(),
  altText: text("alt_text"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMediaFileSchema = createInsertSchema(mediaFiles).omit({
  id: true,
  createdAt: true,
});

export type InsertMediaFile = z.infer<typeof insertMediaFileSchema>;
export type MediaFile = typeof mediaFiles.$inferSelect;

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
