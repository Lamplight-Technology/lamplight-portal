import {
  companies,
  platforms,
  adminUsers,
  legalDocuments,
  aboutFeatureCards,
  heroBadges,
  type Company,
  type Platform,
  type AdminUser,
  type LegalDocument,
  type AboutFeatureCard,
  type HeroBadge,
  type InsertCompany,
  type InsertPlatform,
  type InsertAdminUser,
  type InsertLegalDocument,
  type InsertAboutFeatureCard,
  type InsertHeroBadge,
} from "@shared/schema";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Admin user methods
  getAdminUserByEmail(email: string): Promise<AdminUser | undefined>;
  getAdminUserByAuth0Sub(auth0Sub: string): Promise<AdminUser | undefined>;
  createAdminUser(user: InsertAdminUser): Promise<AdminUser>;
  getAllAdminUsers(): Promise<AdminUser[]>;
  
  // Company methods
  getCompany(): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company | undefined>;
  
  // Platform methods
  getAllPlatforms(includeInactive?: boolean): Promise<Platform[]>;
  getPlatform(id: number): Promise<Platform | undefined>;
  createPlatform(platform: InsertPlatform): Promise<Platform>;
  updatePlatform(id: number, platform: Partial<InsertPlatform>): Promise<Platform | undefined>;
  deletePlatform(id: number): Promise<boolean>;
  
  // Legal document methods
  getAllLegalDocuments(): Promise<LegalDocument[]>;
  getLegalDocument(type: string): Promise<LegalDocument | undefined>;
  createLegalDocument(document: InsertLegalDocument): Promise<LegalDocument>;
  updateLegalDocument(id: number, document: Partial<InsertLegalDocument>): Promise<LegalDocument | undefined>;
  deleteLegalDocument(id: number): Promise<boolean>;

  // About feature card methods
  getAboutFeatureCards(companyId: number): Promise<AboutFeatureCard[]>;
  createAboutFeatureCard(card: InsertAboutFeatureCard): Promise<AboutFeatureCard>;
  updateAboutFeatureCard(id: number, card: Partial<InsertAboutFeatureCard>): Promise<AboutFeatureCard | undefined>;
  deleteAboutFeatureCard(id: number): Promise<boolean>;

  // Hero badge methods
  getHeroBadges(companyId: number): Promise<HeroBadge[]>;
  createHeroBadge(badge: InsertHeroBadge): Promise<HeroBadge>;
  updateHeroBadge(id: number, badge: Partial<InsertHeroBadge>): Promise<HeroBadge | undefined>;
  deleteHeroBadge(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private adminUsers: Map<number, AdminUser>;
  private companies: Map<number, Company>;
  private platforms: Map<number, Platform>;
  private legalDocuments: Map<number, LegalDocument>;
  private aboutFeatureCards: Map<number, AboutFeatureCard>;
  private heroBadges: Map<number, HeroBadge>;
  private currentAdminUserId: number;
  private currentCompanyId: number;
  private currentPlatformId: number;
  private currentLegalDocumentId: number;
  private currentAboutFeatureCardId: number;
  private currentHeroBadgeId: number;

  constructor() {
    this.adminUsers = new Map();
    this.companies = new Map();
    this.platforms = new Map();
    this.legalDocuments = new Map();
    this.aboutFeatureCards = new Map();
    this.heroBadges = new Map();
    this.currentAdminUserId = 1;
    this.currentCompanyId = 1;
    this.currentPlatformId = 1;
    this.currentLegalDocumentId = 1;
    this.currentAboutFeatureCardId = 1;
    this.currentHeroBadgeId = 1;

    // Initialize with default company data
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default company
    const defaultCompany: Company = {
      id: 1,
      name: "Lamplight Technology",
      logo: null,
      logoHeight: 40,
      showNameWithLogo: false,
      titleFontFamily: "Inter",
      titleFontSize: 24,
      titleFontWeight: "700",
      titleColor: "#0f172a",
      sloganText: null,
      sloganFontFamily: "Inter",
      sloganFontSize: 14,
      sloganFontWeight: "400",
      sloganColor: "#64748b",
      headerPaddingY: 16,
      heroBadge: "Next-Generation SaaS Solutions",
      heroTitle: "Empowering Business Through",
      heroTitleHighlight: "Software Innovation",
      heroDescription: "Lamplight Technology is a leading holding company specializing in cutting-edge SaaS platforms that transform how businesses operate, scale, and succeed in the digital economy.",
      heroButtonPrimary: "Explore Our Platforms",
      heroButtonSecondary: "Learn More",
      heroBackgroundGradientFrom: "#0f172a",
      heroBackgroundGradientVia: "#1e3a8a",
      heroBackgroundGradientTo: "#312e81",
      heroBlobColor1: "#3b82f6",
      heroBlobColor2: "#a855f7",
      heroBlobColor3: "#6366f1",
      aboutTitle: "Building the Future of Software",
      aboutDescription: "With a portfolio of innovative SaaS platforms, Lamplight Technology drives digital transformation across industries. Our mission is to create powerful, scalable solutions that enable businesses to thrive in an increasingly connected world.",
      platformsTitle: "Our SaaS Platforms",
      platformsDescription: "Discover our platforms and services",
      contactTitle: "Get in Touch",
      contactDescription: "Ready to transform your business with our SaaS platforms? Our team is here to help you get started.",
      contactButtonText: "Contact Us",
      contactEmail: "contact@lamplighttech.com",
      siteTitle: "Lamplight Technology",
      maintenanceMode: false,
      footerBlurb: "Specializing in cutting-edge SaaS platforms that transform how businesses operate, scale, and succeed in the digital economy.",
      showPlatforms: true,
      showAbout: true,
      showContact: true,
    };
    this.companies.set(1, defaultCompany);
    this.currentCompanyId = 2;

    // Create default platforms
    const defaultPlatforms: Platform[] = [
      {
        id: 1,
        name: "CollabFlow",
        description: "Advanced project management and team collaboration platform designed for modern enterprises.",
        category: "Project Management",
        link: "https://collabflow.lamplighttech.com",
        logo: "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
        isActive: true,
        sortOrder: 1,
      },
      {
        id: 2,
        name: "FinanceIQ",
        description: "Intelligent financial analytics and reporting platform for data-driven business decisions.",
        category: "Financial Analytics",
        link: "https://financeiq.lamplighttech.com",
        logo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
        isActive: true,
        sortOrder: 2,
      },
      {
        id: 3,
        name: "ServiceDesk Pro",
        description: "Comprehensive customer service and support management platform with AI-powered insights.",
        category: "Customer Service",
        link: "https://servicedeskpro.lamplighttech.com",
        logo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
        isActive: true,
        sortOrder: 3,
      },
      {
        id: 4,
        name: "MarketFlow",
        description: "All-in-one marketing automation platform with advanced campaign management and analytics.",
        category: "Marketing Automation",
        link: "https://marketflow.lamplighttech.com",
        logo: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
        isActive: true,
        sortOrder: 4,
      },
      {
        id: 5,
        name: "TalentHub",
        description: "Modern HR management platform with employee engagement and performance tracking tools.",
        category: "Human Resources",
        link: "https://talenthub.lamplighttech.com",
        logo: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
        isActive: true,
        sortOrder: 5,
      },
      {
        id: 6,
        name: "RetailEngine",
        description: "Complete e-commerce and retail management solution with inventory and sales optimization.",
        category: "E-Commerce",
        link: "https://retailengine.lamplighttech.com",
        logo: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
        isActive: true,
        sortOrder: 6,
      },
    ];

    defaultPlatforms.forEach(platform => {
      this.platforms.set(platform.id, platform);
    });
    this.currentPlatformId = 7;

    // Create default about feature cards
    const defaultAboutFeatureCards: AboutFeatureCard[] = [
      {
        id: 1,
        companyId: 1,
        title: "Growth Focused",
        description: "Accelerating business growth through innovative technology solutions",
        iconName: "ChartLine",
        gradientFrom: "#3b82f6",
        gradientTo: "#06b6d4",
        borderColor: "#dbeafe",
        sortOrder: 1,
        isActive: true,
      },
      {
        id: 2,
        companyId: 1,
        title: "Enterprise Security",
        description: "Bank-level security and compliance across all our platforms",
        iconName: "Shield",
        gradientFrom: "#10b981",
        gradientTo: "#34d399",
        borderColor: "#d1fae5",
        sortOrder: 2,
        isActive: true,
      },
      {
        id: 3,
        companyId: 1,
        title: "Customer Success",
        description: "Dedicated support and success teams for every platform",
        iconName: "Users",
        gradientFrom: "#a855f7",
        gradientTo: "#ec4899",
        borderColor: "#fae8ff",
        sortOrder: 3,
        isActive: true,
      },
    ];

    defaultAboutFeatureCards.forEach(card => {
      this.aboutFeatureCards.set(card.id, card);
    });
    this.currentAboutFeatureCardId = 4;

    // Create default hero badges
    const defaultHeroBadges: HeroBadge[] = [
      {
        id: 1,
        companyId: 1,
        text: "Fast & Reliable",
        iconName: "Zap",
        iconColor: "#fbbf24",
        sortOrder: 1,
        isActive: true,
      },
      {
        id: 2,
        companyId: 1,
        text: "Enterprise Security",
        iconName: "Shield",
        iconColor: "#34d399",
        sortOrder: 2,
        isActive: true,
      },
      {
        id: 3,
        companyId: 1,
        text: "AI-Powered",
        iconName: "Sparkles",
        iconColor: "#a78bfa",
        sortOrder: 3,
        isActive: true,
      },
    ];

    defaultHeroBadges.forEach(badge => {
      this.heroBadges.set(badge.id, badge);
    });
    this.currentHeroBadgeId = 4;

    // Create default legal documents
    const defaultLegalDocuments: LegalDocument[] = [
      {
        id: 1,
        type: 'privacy',
        title: 'Privacy Policy',
        content: this.getDefaultPrivacyPolicy(),
        isActive: true,
        lastUpdated: new Date(),
      },
      {
        id: 2,
        type: 'terms',
        title: 'Terms of Service',
        content: this.getDefaultTermsOfService(),
        isActive: true,
        lastUpdated: new Date(),
      },
      {
        id: 3,
        type: 'cookies',
        title: 'Cookie Policy',
        content: this.getDefaultCookiePolicy(),
        isActive: true,
        lastUpdated: new Date(),
      },
      {
        id: 4,
        type: 'support',
        title: 'Support Policy',
        content: this.getDefaultSupportPolicy(),
        isActive: true,
        lastUpdated: new Date(),
      },
    ];

    defaultLegalDocuments.forEach(doc => {
      this.legalDocuments.set(doc.id, doc);
    });
    this.currentLegalDocumentId = 5;
  }

  private getDefaultPrivacyPolicy(): string {
    return `# Privacy Policy

**Effective Date:** ${new Date().toLocaleDateString()}

## Introduction

Lamplight Technology Holdings LLC ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.

## Information We Collect

### Personal Information
- Name and contact information
- Email address and phone number
- Company information
- Usage data and analytics

### Automatically Collected Information
- IP address and browser information
- Cookies and tracking technologies
- Device and usage statistics

## How We Use Your Information

We use the information we collect to:
- Provide and maintain our services
- Communicate with you about our products
- Improve our website and services
- Comply with legal obligations

## Information Sharing

We do not sell, trade, or rent your personal information to third parties. We may share information in the following circumstances:
- With your consent
- To comply with legal requirements
- To protect our rights and safety

## Data Security

We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.

## Your Rights

You have the right to:
- Access your personal information
- Correct inaccurate information
- Request deletion of your information
- Opt-out of marketing communications

## Contact Us

If you have questions about this Privacy Policy, please contact us at:
- Email: privacy@lamplighttech.com
- Phone: +1 (555) 123-4567
- Address: Denver, Colorado

This Privacy Policy may be updated from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.`;
  }

  private getDefaultTermsOfService(): string {
    return `# Terms of Service

**Effective Date:** ${new Date().toLocaleDateString()}

## Agreement to Terms

By accessing and using the services provided by Lamplight Technology Holdings LLC ("Company," "we," "our," or "us"), you agree to be bound by these Terms of Service.

## Description of Services

Lamplight Technology Holdings LLC provides SaaS platforms and software solutions designed to help businesses operate, scale, and succeed in the digital economy.

## User Accounts

- You are responsible for maintaining the confidentiality of your account
- You must provide accurate and complete information
- You are responsible for all activities under your account

## Acceptable Use

You agree not to:
- Use our services for illegal purposes
- Attempt to gain unauthorized access to our systems
- Interfere with the proper functioning of our services
- Upload malicious code or content

## Intellectual Property

- Our services and content are protected by intellectual property laws
- You retain ownership of content you create using our services
- We grant you a limited license to use our services

## Payment Terms

- Fees are charged according to your selected plan
- Payments are due in advance
- We reserve the right to suspend services for non-payment

## Limitation of Liability

To the maximum extent permitted by law, Lamplight Technology Holdings LLC shall not be liable for any indirect, incidental, special, or consequential damages.

## Termination

We may terminate or suspend your account at any time for violation of these terms or for any other reason at our sole discretion.

## Governing Law

These terms are governed by the laws of Colorado, United States.

## Contact Information

For questions about these Terms of Service, contact us at:
- Email: legal@lamplighttech.com
- Phone: +1 (555) 123-4567
- Address: Denver, Colorado

These Terms of Service may be updated from time to time. Continued use of our services constitutes acceptance of any changes.`;
  }

  private getDefaultCookiePolicy(): string {
    return `# Cookie Policy

**Effective Date:** ${new Date().toLocaleDateString()}

## What Are Cookies

Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and analyzing how you use our site.

## Types of Cookies We Use

### Essential Cookies
These cookies are necessary for the website to function properly and cannot be disabled.

### Analytics Cookies
We use analytics cookies to understand how visitors interact with our website, helping us improve our services.

### Functional Cookies
These cookies enable enhanced functionality and personalization, such as remembering your preferences.

### Marketing Cookies
We may use marketing cookies to show you relevant advertisements and measure the effectiveness of our campaigns.

## Third-Party Cookies

We may use third-party services that place cookies on your device:
- Google Analytics for website analytics
- Social media platforms for sharing functionality
- Customer support tools

## Managing Cookies

You can control cookies through your browser settings:
- **Chrome:** Settings > Privacy and Security > Cookies
- **Firefox:** Settings > Privacy & Security > Cookies
- **Safari:** Preferences > Privacy > Cookies
- **Edge:** Settings > Privacy & Security > Cookies

## Cookie Consent

By continuing to use our website, you consent to our use of cookies as described in this policy.

## Updates to This Policy

We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated effective date.

## Contact Us

If you have questions about our use of cookies, please contact us at:
- Email: privacy@lamplighttech.com
- Phone: +1 (555) 123-4567

Lamplight Technology Holdings LLC
Denver, Colorado`;
  }

  private getDefaultSupportPolicy(): string {
    return `# Support Policy

**Effective Date:** ${new Date().toLocaleDateString()}

## Our Commitment

Lamplight Technology Holdings LLC is committed to providing excellent customer support for all our SaaS platforms and services.

## Support Channels

### Email Support
- General inquiries: support@lamplighttech.com
- Technical issues: technical@lamplighttech.com
- Billing questions: billing@lamplighttech.com

### Phone Support
- Phone: +1 (555) 123-4567
- Business hours: Monday-Friday, 9 AM - 6 PM MT

### Online Resources
- Knowledge base and documentation
- Video tutorials and guides
- Community forums

## Response Times

### Priority Levels

**Critical Issues (System Down)**
- Response time: Within 1 hour
- Resolution target: Within 4 hours

**High Priority (Major Functionality Impacted)**
- Response time: Within 4 hours
- Resolution target: Within 24 hours

**Medium Priority (Minor Issues)**
- Response time: Within 24 hours
- Resolution target: Within 72 hours

**Low Priority (General Questions)**
- Response time: Within 48 hours
- Resolution target: Within 5 business days

## Support Scope

### Included Support
- Platform functionality questions
- Technical troubleshooting
- Account and billing assistance
- Best practices guidance

### Not Included
- Custom development work
- Third-party integrations (beyond our platforms)
- Training beyond standard documentation

## Escalation Process

If you're not satisfied with the initial support response:
1. Request escalation to a senior support specialist
2. Contact our support manager at manager@lamplighttech.com
3. Reach out to our customer success team

## Support Hours

- **Standard Support:** Monday-Friday, 9 AM - 6 PM MT
- **Emergency Support:** 24/7 for critical system issues
- **Holiday Schedule:** Reduced hours on major holidays

## Getting Better Support

To help us assist you more effectively:
- Provide detailed descriptions of issues
- Include relevant screenshots or error messages
- Specify which platform or service you're using
- Include your account information

## Feedback

We value your feedback on our support services. Please let us know how we can improve by contacting feedback@lamplighttech.com.

## Contact Information

**Lamplight Technology Holdings LLC**
- Email: support@lamplighttech.com
- Phone: +1 (555) 123-4567
- Address: Denver, Colorado

This Support Policy may be updated to reflect changes in our services or support procedures.`;
  }

  // User methods
  // Admin user methods
  async getAdminUserByEmail(email: string): Promise<AdminUser | undefined> {
    return Array.from(this.adminUsers.values()).find(
      (user) => user.email === email,
    );
  }

  async getAdminUserByAuth0Sub(auth0Sub: string): Promise<AdminUser | undefined> {
    return Array.from(this.adminUsers.values()).find(
      (user) => user.auth0Sub === auth0Sub,
    );
  }

  async createAdminUser(insertAdminUser: InsertAdminUser): Promise<AdminUser> {
    const id = this.currentAdminUserId++;
    const adminUser: AdminUser = { 
      id,
      email: insertAdminUser.email,
      name: insertAdminUser.name ?? null,
      auth0Sub: insertAdminUser.auth0Sub ?? null,
      createdAt: new Date(),
    };
    this.adminUsers.set(id, adminUser);
    return adminUser;
  }

  async getAllAdminUsers(): Promise<AdminUser[]> {
    return Array.from(this.adminUsers.values());
  }

  // Company methods
  async getCompany(): Promise<Company | undefined> {
    return this.companies.get(1); // Single company setup
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const id = this.currentCompanyId++;
    const company: Company = { 
      ...insertCompany,
      logo: insertCompany.logo ?? null,
      logoHeight: insertCompany.logoHeight ?? 40,
      showNameWithLogo: insertCompany.showNameWithLogo ?? false,
      titleFontFamily: insertCompany.titleFontFamily ?? "Inter",
      titleFontSize: insertCompany.titleFontSize ?? 24,
      titleFontWeight: insertCompany.titleFontWeight ?? "700",
      titleColor: insertCompany.titleColor ?? "#0f172a",
      sloganText: insertCompany.sloganText ?? null,
      sloganFontFamily: insertCompany.sloganFontFamily ?? "Inter",
      sloganFontSize: insertCompany.sloganFontSize ?? 14,
      sloganFontWeight: insertCompany.sloganFontWeight ?? "400",
      sloganColor: insertCompany.sloganColor ?? "#64748b",
      headerPaddingY: insertCompany.headerPaddingY ?? 16,
      contactEmail: insertCompany.contactEmail ?? null,
      siteTitle: insertCompany.siteTitle ?? null,
      maintenanceMode: insertCompany.maintenanceMode ?? null,
      footerBlurb: insertCompany.footerBlurb ?? null,
      showPlatforms: insertCompany.showPlatforms ?? null,
      showAbout: insertCompany.showAbout ?? null,
      showContact: insertCompany.showContact ?? null,
      id 
    };
    this.companies.set(id, company);
    return company;
  }

  async updateCompany(id: number, updateData: Partial<InsertCompany>): Promise<Company | undefined> {
    const company = this.companies.get(id);
    if (!company) return undefined;
    
    const updatedCompany: Company = { 
      ...company, 
      ...Object.fromEntries(
        Object.entries(updateData).map(([key, value]) => [key, value ?? null])
      )
    };
    this.companies.set(id, updatedCompany);
    return updatedCompany;
  }

  // Platform methods
  async getAllPlatforms(includeInactive: boolean = false): Promise<Platform[]> {
    return Array.from(this.platforms.values())
      .filter(platform => includeInactive || platform.isActive)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  async getPlatform(id: number): Promise<Platform | undefined> {
    return this.platforms.get(id);
  }

  async createPlatform(insertPlatform: InsertPlatform): Promise<Platform> {
    const id = this.currentPlatformId++;
    const platform: Platform = { 
      ...insertPlatform,
      logo: insertPlatform.logo ?? null,
      isActive: insertPlatform.isActive ?? null,
      id,
      sortOrder: insertPlatform.sortOrder ?? id
    };
    this.platforms.set(id, platform);
    return platform;
  }

  async updatePlatform(id: number, updateData: Partial<InsertPlatform>): Promise<Platform | undefined> {
    const platform = this.platforms.get(id);
    if (!platform) return undefined;
    
    const updatedPlatform: Platform = { ...platform, ...updateData };
    this.platforms.set(id, updatedPlatform);
    return updatedPlatform;
  }

  async deletePlatform(id: number): Promise<boolean> {
    return this.platforms.delete(id);
  }

  // Legal document methods
  async getAllLegalDocuments(): Promise<LegalDocument[]> {
    return Array.from(this.legalDocuments.values())
      .filter(doc => doc.isActive)
      .sort((a, b) => a.type.localeCompare(b.type));
  }

  async getLegalDocument(type: string): Promise<LegalDocument | undefined> {
    return Array.from(this.legalDocuments.values()).find(doc => doc.type === type && doc.isActive);
  }

  async createLegalDocument(insertDocument: InsertLegalDocument): Promise<LegalDocument> {
    const id = this.currentLegalDocumentId++;
    const document: LegalDocument = {
      ...insertDocument,
      id,
      isActive: insertDocument.isActive ?? true,
      lastUpdated: new Date(),
    };
    this.legalDocuments.set(id, document);
    return document;
  }

  async updateLegalDocument(id: number, updateData: Partial<InsertLegalDocument>): Promise<LegalDocument | undefined> {
    const document = this.legalDocuments.get(id);
    if (!document) return undefined;
    
    const updatedDocument: LegalDocument = {
      ...document,
      ...updateData,
      lastUpdated: new Date(),
    };
    this.legalDocuments.set(id, updatedDocument);
    return updatedDocument;
  }

  async deleteLegalDocument(id: number): Promise<boolean> {
    return this.legalDocuments.delete(id);
  }

  // About Feature Card methods
  async getAboutFeatureCards(companyId: number): Promise<AboutFeatureCard[]> {
    return Array.from(this.aboutFeatureCards.values())
      .filter(card => card.companyId === companyId && card.isActive)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  async createAboutFeatureCard(insertCard: InsertAboutFeatureCard): Promise<AboutFeatureCard> {
    const id = this.currentAboutFeatureCardId++;
    const card: AboutFeatureCard = {
      ...insertCard,
      id,
      companyId: insertCard.companyId ?? 1,
      gradientFrom: insertCard.gradientFrom ?? "#3b82f6",
      gradientTo: insertCard.gradientTo ?? "#06b6d4",
      borderColor: insertCard.borderColor ?? "#dbeafe",
      sortOrder: insertCard.sortOrder ?? 0,
      isActive: insertCard.isActive ?? true,
    };
    this.aboutFeatureCards.set(id, card);
    return card;
  }

  async updateAboutFeatureCard(id: number, updates: Partial<InsertAboutFeatureCard>): Promise<AboutFeatureCard | undefined> {
    const card = this.aboutFeatureCards.get(id);
    if (!card) return undefined;
    const updated = { ...card, ...updates };
    this.aboutFeatureCards.set(id, updated);
    return updated;
  }

  async deleteAboutFeatureCard(id: number): Promise<boolean> {
    return this.aboutFeatureCards.delete(id);
  }

  // Hero Badge methods
  async getHeroBadges(companyId: number): Promise<HeroBadge[]> {
    return Array.from(this.heroBadges.values())
      .filter(badge => badge.companyId === companyId && badge.isActive)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  async createHeroBadge(insertBadge: InsertHeroBadge): Promise<HeroBadge> {
    const id = this.currentHeroBadgeId++;
    const badge: HeroBadge = {
      ...insertBadge,
      id,
      companyId: insertBadge.companyId ?? 1,
      iconColor: insertBadge.iconColor ?? "#fbbf24",
      sortOrder: insertBadge.sortOrder ?? 0,
      isActive: insertBadge.isActive ?? true,
    };
    this.heroBadges.set(id, badge);
    return badge;
  }

  async updateHeroBadge(id: number, updates: Partial<InsertHeroBadge>): Promise<HeroBadge | undefined> {
    const badge = this.heroBadges.get(id);
    if (!badge) return undefined;
    const updated = { ...badge, ...updates };
    this.heroBadges.set(id, updated);
    return updated;
  }

  async deleteHeroBadge(id: number): Promise<boolean> {
    return this.heroBadges.delete(id);
  }
}

export class DbStorage implements IStorage {
  private db;

  constructor() {
    const sql = neon(process.env.DATABASE_URL!);
    this.db = drizzle(sql);
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    // Check if default company exists
    const existingCompany = await this.db.select().from(companies).limit(1);
    
    if (existingCompany.length === 0) {
      // Create default company
      await this.db.insert(companies).values({
        name: "Lamplight Technology",
        logo: null,
        heroTitle: "Empowering Business Through Software Innovation",
        heroDescription: "Lamplight Technology is a leading holding company specializing in cutting-edge SaaS platforms that transform how businesses operate, scale, and succeed in the digital economy.",
        aboutTitle: "Building the Future of Software",
        aboutDescription: "With a portfolio of innovative SaaS platforms, Lamplight Technology drives digital transformation across industries. Our mission is to create powerful, scalable solutions that enable businesses to thrive in an increasingly connected world.",
        contactEmail: "contact@lamplighttech.com",
        siteTitle: "Lamplight Technology",
        maintenanceMode: false,
      });

      // Create default platforms
      const defaultPlatforms = [
        {
          name: "CollabFlow",
          description: "Advanced project management and team collaboration platform designed for modern enterprises.",
          category: "Project Management",
          link: "https://collabflow.lamplighttech.com",
          logo: "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
          isActive: true,
          sortOrder: 1,
        },
        {
          name: "FinanceIQ",
          description: "Intelligent financial analytics and reporting platform for data-driven business decisions.",
          category: "Financial Analytics",
          link: "https://financeiq.lamplighttech.com",
          logo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
          isActive: true,
          sortOrder: 2,
        },
        {
          name: "ServiceDesk Pro",
          description: "Comprehensive customer service and support management platform with AI-powered insights.",
          category: "Customer Service",
          link: "https://servicedeskpro.lamplighttech.com",
          logo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
          isActive: true,
          sortOrder: 3,
        },
        {
          name: "MarketFlow",
          description: "All-in-one marketing automation platform with advanced campaign management and analytics.",
          category: "Marketing Automation",
          link: "https://marketflow.lamplighttech.com",
          logo: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
          isActive: true,
          sortOrder: 4,
        },
        {
          name: "TalentHub",
          description: "Modern HR management platform with employee engagement and performance tracking tools.",
          category: "Human Resources",
          link: "https://talenthub.lamplighttech.com",
          logo: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
          isActive: true,
          sortOrder: 5,
        },
        {
          name: "RetailEngine",
          description: "Complete e-commerce and retail management solution with inventory and sales optimization.",
          category: "E-Commerce",
          link: "https://retailengine.lamplighttech.com",
          logo: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
          isActive: true,
          sortOrder: 6,
        },
      ];

      await this.db.insert(platforms).values(defaultPlatforms);

      // Create default legal documents
      const defaultLegalDocuments = [
        {
          type: 'privacy',
          title: 'Privacy Policy',
          content: this.getDefaultPrivacyPolicy(),
          isActive: true,
        },
        {
          type: 'terms',
          title: 'Terms of Service',
          content: this.getDefaultTermsOfService(),
          isActive: true,
        },
        {
          type: 'cookies',
          title: 'Cookie Policy',
          content: this.getDefaultCookiePolicy(),
          isActive: true,
        },
        {
          type: 'support',
          title: 'Support Policy',
          content: this.getDefaultSupportPolicy(),
          isActive: true,
        },
      ];

      await this.db.insert(legalDocuments).values(defaultLegalDocuments);
    }
  }

  private getDefaultPrivacyPolicy(): string {
    return `# Privacy Policy

**Effective Date:** ${new Date().toLocaleDateString()}

## Introduction

Lamplight Technology Holdings LLC ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.

## Information We Collect

### Personal Information
- Name and contact information
- Email address and phone number
- Company information
- Usage data and analytics

### Automatically Collected Information
- IP address and browser information
- Cookies and tracking technologies
- Device and usage statistics

## How We Use Your Information

We use the information we collect to:
- Provide and maintain our services
- Communicate with you about our products
- Improve our website and services
- Comply with legal obligations

## Information Sharing

We do not sell, trade, or rent your personal information to third parties. We may share information in the following circumstances:
- With your consent
- To comply with legal requirements
- To protect our rights and safety

## Data Security

We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.

## Your Rights

You have the right to:
- Access your personal information
- Correct inaccurate information
- Request deletion of your information
- Opt-out of marketing communications

## Contact Us

If you have questions about this Privacy Policy, please contact us at:
- Email: privacy@lamplighttech.com
- Phone: +1 (555) 123-4567
- Address: Denver, Colorado

This Privacy Policy may be updated from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.`;
  }

  private getDefaultTermsOfService(): string {
    return `# Terms of Service

**Effective Date:** ${new Date().toLocaleDateString()}

## Agreement to Terms

By accessing and using the services provided by Lamplight Technology Holdings LLC ("Company," "we," "our," or "us"), you agree to be bound by these Terms of Service.

## Description of Services

Lamplight Technology Holdings LLC provides SaaS platforms and software solutions designed to help businesses operate, scale, and succeed in the digital economy.

## User Accounts

- You are responsible for maintaining the confidentiality of your account
- You must provide accurate and complete information
- You are responsible for all activities under your account

## Acceptable Use

You agree not to:
- Use our services for illegal purposes
- Attempt to gain unauthorized access to our systems
- Interfere with the proper functioning of our services
- Upload malicious code or content

## Intellectual Property

- Our services and content are protected by intellectual property laws
- You retain ownership of content you create using our services
- We grant you a limited license to use our services

## Payment Terms

- Fees are charged according to your selected plan
- Payments are due in advance
- We reserve the right to suspend services for non-payment

## Limitation of Liability

To the maximum extent permitted by law, Lamplight Technology Holdings LLC shall not be liable for any indirect, incidental, special, or consequential damages.

## Termination

We may terminate or suspend your account at any time for violation of these terms or for any other reason at our sole discretion.

## Governing Law

These terms are governed by the laws of Colorado, United States.

## Contact Information

For questions about these Terms of Service, contact us at:
- Email: legal@lamplighttech.com
- Phone: +1 (555) 123-4567
- Address: Denver, Colorado

These Terms of Service may be updated from time to time. Continued use of our services constitutes acceptance of any changes.`;
  }

  private getDefaultCookiePolicy(): string {
    return `# Cookie Policy

**Effective Date:** ${new Date().toLocaleDateString()}

## What Are Cookies

Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and analyzing how you use our site.

## Types of Cookies We Use

### Essential Cookies
These cookies are necessary for the website to function properly and cannot be disabled.

### Analytics Cookies
We use analytics cookies to understand how visitors interact with our website, helping us improve our services.

### Functional Cookies
These cookies enable enhanced functionality and personalization, such as remembering your preferences.

### Marketing Cookies
We may use marketing cookies to show you relevant advertisements and measure the effectiveness of our campaigns.

## Third-Party Cookies

We may use third-party services that place cookies on your device:
- Google Analytics for website analytics
- Social media platforms for sharing functionality
- Customer support tools

## Managing Cookies

You can control cookies through your browser settings:
- **Chrome:** Settings > Privacy and Security > Cookies
- **Firefox:** Settings > Privacy & Security > Cookies
- **Safari:** Preferences > Privacy > Cookies
- **Edge:** Settings > Privacy & Security > Cookies

## Cookie Consent

By continuing to use our website, you consent to our use of cookies as described in this policy.

## Updates to This Policy

We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated effective date.

## Contact Us

If you have questions about our use of cookies, please contact us at:
- Email: privacy@lamplighttech.com
- Phone: +1 (555) 123-4567

Lamplight Technology Holdings LLC
Denver, Colorado`;
  }

  private getDefaultSupportPolicy(): string {
    return `# Support Policy

**Effective Date:** ${new Date().toLocaleDateString()}

## Our Commitment

Lamplight Technology Holdings LLC is committed to providing excellent customer support for all our SaaS platforms and services.

## Support Channels

### Email Support
- General inquiries: support@lamplighttech.com
- Technical issues: technical@lamplighttech.com
- Billing questions: billing@lamplighttech.com

### Phone Support
- Phone: +1 (555) 123-4567
- Business hours: Monday-Friday, 9 AM - 6 PM MT

### Online Resources
- Knowledge base and documentation
- Video tutorials and guides
- Community forums

## Response Times

### Priority Levels

**Critical Issues (System Down)**
- Response time: Within 1 hour
- Resolution target: Within 4 hours

**High Priority (Major Functionality Impacted)**
- Response time: Within 4 hours
- Resolution target: Within 24 hours

**Medium Priority (Minor Issues)**
- Response time: Within 24 hours
- Resolution target: Within 72 hours

**Low Priority (General Questions)**
- Response time: Within 48 hours
- Resolution target: Within 5 business days

## Support Scope

### Included Support
- Platform functionality questions
- Technical troubleshooting
- Account and billing assistance
- Best practices guidance

### Not Included
- Custom development work
- Third-party integrations (beyond our platforms)
- Training beyond standard documentation

## Escalation Process

If you're not satisfied with the initial support response:
1. Request escalation to a senior support specialist
2. Contact our support manager at manager@lamplighttech.com
3. Reach out to our customer success team

## Support Hours

- **Standard Support:** Monday-Friday, 9 AM - 6 PM MT
- **Emergency Support:** 24/7 for critical system issues
- **Holiday Schedule:** Reduced hours on major holidays

## Getting Better Support

To help us assist you more effectively:
- Provide detailed descriptions of issues
- Include relevant screenshots or error messages
- Specify which platform or service you're using
- Include your account information

## Feedback

We value your feedback on our support services. Please let us know how we can improve by contacting feedback@lamplighttech.com.

## Contact Information

**Lamplight Technology Holdings LLC**
- Email: support@lamplighttech.com
- Phone: +1 (555) 123-4567
- Address: Denver, Colorado

This Support Policy may be updated to reflect changes in our services or support procedures.`;
  }

  // User methods
  // Admin user methods
  async getAdminUserByEmail(email: string): Promise<AdminUser | undefined> {
    const result = await this.db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
    return result[0];
  }

  async getAdminUserByAuth0Sub(auth0Sub: string): Promise<AdminUser | undefined> {
    const result = await this.db.select().from(adminUsers).where(eq(adminUsers.auth0Sub, auth0Sub)).limit(1);
    return result[0];
  }

  async createAdminUser(insertAdminUser: InsertAdminUser): Promise<AdminUser> {
    const result = await this.db.insert(adminUsers).values(insertAdminUser).returning();
    return result[0];
  }

  async getAllAdminUsers(): Promise<AdminUser[]> {
    return await this.db.select().from(adminUsers);
  }

  // Company methods
  async getCompany(): Promise<Company | undefined> {
    const result = await this.db.select().from(companies).limit(1);
    return result[0];
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const result = await this.db.insert(companies).values(insertCompany).returning();
    return result[0];
  }

  async updateCompany(id: number, updateData: Partial<InsertCompany>): Promise<Company | undefined> {
    const result = await this.db
      .update(companies)
      .set(updateData)
      .where(eq(companies.id, id))
      .returning();
    return result[0];
  }

  // Platform methods
  async getAllPlatforms(includeInactive: boolean = false): Promise<Platform[]> {
    const query = this.db
      .select()
      .from(platforms);
    
    const result = includeInactive 
      ? await query.orderBy(platforms.sortOrder)
      : await query.where(eq(platforms.isActive, true)).orderBy(platforms.sortOrder);
    return result;
  }

  async getPlatform(id: number): Promise<Platform | undefined> {
    const result = await this.db.select().from(platforms).where(eq(platforms.id, id)).limit(1);
    return result[0];
  }

  async createPlatform(insertPlatform: InsertPlatform): Promise<Platform> {
    const result = await this.db.insert(platforms).values(insertPlatform).returning();
    return result[0];
  }

  async updatePlatform(id: number, updateData: Partial<InsertPlatform>): Promise<Platform | undefined> {
    const result = await this.db
      .update(platforms)
      .set(updateData)
      .where(eq(platforms.id, id))
      .returning();
    return result[0];
  }

  async deletePlatform(id: number): Promise<boolean> {
    const result = await this.db.delete(platforms).where(eq(platforms.id, id)).returning();
    return result.length > 0;
  }

  // Legal document methods
  async getAllLegalDocuments(): Promise<LegalDocument[]> {
    const result = await this.db
      .select()
      .from(legalDocuments)
      .where(eq(legalDocuments.isActive, true))
      .orderBy(legalDocuments.type);
    return result;
  }

  async getLegalDocument(type: string): Promise<LegalDocument | undefined> {
    const result = await this.db
      .select()
      .from(legalDocuments)
      .where(eq(legalDocuments.type, type))
      .limit(1);
    return result[0];
  }

  async createLegalDocument(insertDocument: InsertLegalDocument): Promise<LegalDocument> {
    const result = await this.db.insert(legalDocuments).values(insertDocument).returning();
    return result[0];
  }

  async updateLegalDocument(id: number, updateData: Partial<InsertLegalDocument>): Promise<LegalDocument | undefined> {
    const result = await this.db
      .update(legalDocuments)
      .set(updateData)
      .where(eq(legalDocuments.id, id))
      .returning();
    return result[0];
  }

  async deleteLegalDocument(id: number): Promise<boolean> {
    const result = await this.db.delete(legalDocuments).where(eq(legalDocuments.id, id)).returning();
    return result.length > 0;
  }

  // About Feature Card methods
  async getAboutFeatureCards(companyId: number): Promise<AboutFeatureCard[]> {
    const result = await this.db
      .select()
      .from(aboutFeatureCards)
      .where(eq(aboutFeatureCards.companyId, companyId))
      .orderBy(aboutFeatureCards.sortOrder);
    return result;
  }

  async createAboutFeatureCard(card: InsertAboutFeatureCard): Promise<AboutFeatureCard> {
    const result = await this.db.insert(aboutFeatureCards).values(card).returning();
    return result[0];
  }

  async updateAboutFeatureCard(id: number, updates: Partial<InsertAboutFeatureCard>): Promise<AboutFeatureCard | undefined> {
    const result = await this.db
      .update(aboutFeatureCards)
      .set(updates)
      .where(eq(aboutFeatureCards.id, id))
      .returning();
    return result[0];
  }

  async deleteAboutFeatureCard(id: number): Promise<boolean> {
    const result = await this.db.delete(aboutFeatureCards).where(eq(aboutFeatureCards.id, id)).returning();
    return result.length > 0;
  }

  // Hero Badge methods
  async getHeroBadges(companyId: number): Promise<HeroBadge[]> {
    const result = await this.db
      .select()
      .from(heroBadges)
      .where(eq(heroBadges.companyId, companyId))
      .orderBy(heroBadges.sortOrder);
    return result;
  }

  async createHeroBadge(badge: InsertHeroBadge): Promise<HeroBadge> {
    const result = await this.db.insert(heroBadges).values(badge).returning();
    return result[0];
  }

  async updateHeroBadge(id: number, updates: Partial<InsertHeroBadge>): Promise<HeroBadge | undefined> {
    const result = await this.db
      .update(heroBadges)
      .set(updates)
      .where(eq(heroBadges.id, id))
      .returning();
    return result[0];
  }

  async deleteHeroBadge(id: number): Promise<boolean> {
    const result = await this.db.delete(heroBadges).where(eq(heroBadges.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = process.env.DATABASE_URL ? new DbStorage() : new MemStorage();
