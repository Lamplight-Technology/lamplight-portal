import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCompanySchema, insertPlatformSchema, insertLegalDocumentSchema, insertAboutFeatureCardSchema, insertHeroBadgeSchema, insertMediaFileSchema, insertContactSubmissionSchema } from "@shared/schema";
import { sendContactNotification, sendContactConfirmation } from "./email";
import { z } from "zod";
import OpenAI from "openai";
import * as cheerio from "cheerio";
import { promises as dns } from "dns";
import { requireAuth as requiresAuth, requireAdmin as requiresAdmin } from "./auth";

const isPrivateOrLocalIP = (ip: string): boolean => {
  if (ip === 'localhost') return true;
  
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(ip)) {
    const parts = ip.split('.').map(Number);
    if (parts.some(p => p > 255)) return false;
    
    if (
      parts[0] === 10 ||
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
      (parts[0] === 192 && parts[1] === 168) ||
      parts[0] === 127 ||
      parts[0] === 0 ||
      (parts[0] === 169 && parts[1] === 254)
    ) {
      return true;
    }
  }
  
  const ipv6Patterns = [
    /^::1$/,
    /^fe80:/i,
    /^fc00:/i,
    /^fd[0-9a-f]{2}:/i,
    /^::ffff:(?:10\.|172\.(?:1[6-9]|2\d|3[01])\.|192\.168\.|127\.)/i
  ];
  
  if (ipv6Patterns.some(pattern => pattern.test(ip))) {
    return true;
  }
  
  return false;
};

const fetchPlaceholderImage = async (category: string, name?: string): Promise<string> => {
  try {
    // Try Unsplash API first for better contextual images
    const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
    
    if (UNSPLASH_ACCESS_KEY) {
      // Create search query from category and optionally name
      const searchTerms = [category];
      if (name) {
        searchTerms.push(name);
      }
      searchTerms.push('business', 'professional');
      
      const query = searchTerms.join(' ');
      
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=10&orientation=landscape`,
        {
          headers: {
            'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          // Get a random image from the results for variety
          const randomIndex = Math.floor(Math.random() * data.results.length);
          const photo = data.results[randomIndex];
          return `${photo.urls.regular}&w=400&h=200&fit=crop`;
        }
      }
    }
    
    // Fallback to curated images if Unsplash API fails or no key
    const categoryImages: Record<string, string> = {
      'project management': 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200',
      'financial analytics': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200',
      'finance': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200',
      'customer service': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200',
      'marketing automation': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200',
      'human resources': 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200',
      'e-commerce': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200',
      'technology': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200',
      'analytics': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200',
      'business': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200',
    };
    
    const categoryKey = category.toLowerCase();
    if (categoryImages[categoryKey]) {
      return categoryImages[categoryKey];
    }
    
    // Check for partial matches
    for (const [key, url] of Object.entries(categoryImages)) {
      if (categoryKey.includes(key) || key.includes(categoryKey)) {
        return url;
      }
    }
    
    // Final fallback to a professional business image
    return 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200';
    
  } catch (error) {
    console.error('Error fetching image:', error);
    // Return a safe fallback
    return 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200';
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.get("/api/user", (req: Request, res: Response) => {
    if (req.session?.user) {
      const { stytchUserId, email, name } = req.session.user;
      res.json({ user: { sub: stytchUserId, email, name } });
    } else {
      res.json({ user: null });
    }
  });

  // Check if current user is an admin
  app.get("/api/user/is-admin", async (req: Request, res: Response) => {
    const sessionUser = req.session?.user;
    if (!sessionUser) {
      return res.json({ isAdmin: false });
    }

    try {
      const adminUser = await storage.getAdminUserByEmail(sessionUser.email);
      res.json({ isAdmin: !!adminUser });
    } catch (error) {
      console.error("Error checking admin status:", error);
      res.status(500).json({ message: "Error checking admin status" });
    }
  });

  // Admin user management routes
  app.get("/api/admin-users", requiresAdmin(), async (req, res) => {
    try {
      const adminUsers = await storage.getAllAdminUsers();
      res.json(adminUsers);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      res.status(500).json({ message: "Failed to fetch admin users" });
    }
  });

  app.post("/api/admin-users", requiresAdmin(), async (req, res) => {
    try {
      const { email, name } = req.body;

      if (!email || typeof email !== 'string') {
        return res.status(400).json({ message: "Email is required" });
      }

      const existingAdmin = await storage.getAdminUserByEmail(email);
      if (existingAdmin) {
        return res.status(400).json({ message: "Admin user with this email already exists" });
      }

      const newAdmin = await storage.createAdminUser({ email, name });
      res.status(201).json(newAdmin);
    } catch (error) {
      console.error("Error creating admin user:", error);
      res.status(500).json({ message: "Failed to create admin user" });
    }
  });

  // Company routes (protected)
  app.get("/api/company", async (req, res) => {
    try {
      const company = await storage.getCompany();
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch company data" });
    }
  });

  app.put("/api/company/:id", requiresAdmin(), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertCompanySchema.partial().parse(req.body);
      
      const updatedCompany = await storage.updateCompany(id, updateData);
      if (!updatedCompany) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      res.json(updatedCompany);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update company" });
    }
  });

  // Platform routes
  app.get("/api/platforms", async (req, res) => {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const platforms = await storage.getAllPlatforms(includeInactive);
      res.json(platforms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch platforms" });
    }
  });

  app.get("/api/platforms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const platform = await storage.getPlatform(id);
      
      if (!platform) {
        return res.status(404).json({ message: "Platform not found" });
      }
      
      res.json(platform);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch platform" });
    }
  });

  app.post("/api/platforms", requiresAdmin(), async (req, res) => {
    try {
      const platformData = insertPlatformSchema.parse(req.body);
      const newPlatform = await storage.createPlatform(platformData);
      res.status(201).json(newPlatform);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create platform" });
    }
  });

  app.put("/api/platforms/:id", requiresAdmin(), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertPlatformSchema.partial().parse(req.body);
      
      const updatedPlatform = await storage.updatePlatform(id, updateData);
      if (!updatedPlatform) {
        return res.status(404).json({ message: "Platform not found" });
      }
      
      res.json(updatedPlatform);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update platform" });
    }
  });

  app.delete("/api/platforms/:id", requiresAdmin(), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deletePlatform(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Platform not found" });
      }
      
      res.json({ message: "Platform deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete platform" });
    }
  });

  app.post("/api/platforms/generate-logo", requiresAdmin(), async (req, res) => {
    try {
      const { category, name } = req.body;
      
      if (!category || typeof category !== 'string') {
        return res.status(400).json({ message: "Category is required" });
      }

      const logoUrl = await fetchPlaceholderImage(category, name);
      
      if (!logoUrl) {
        return res.status(500).json({ message: "Failed to generate logo image" });
      }

      res.json({ logo: logoUrl });
    } catch (error) {
      console.error("Generate logo error:", error);
      res.status(500).json({ message: "Failed to generate logo" });
    }
  });

  app.post("/api/platforms/extract-from-url", requiresAdmin(), async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ message: "URL is required" });
      }

      let parsedUrl;
      try {
        parsedUrl = new URL(url);
      } catch {
        return res.status(400).json({ message: "Invalid URL format" });
      }

      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return res.status(400).json({ message: "Only HTTP and HTTPS URLs are allowed" });
      }

      const hostname = parsedUrl.hostname;

      if (hostname === 'localhost' || hostname.endsWith('.local') || isPrivateOrLocalIP(hostname)) {
        return res.status(400).json({ message: "Private or local addresses are not allowed" });
      }

      let resolvedAddresses: string[] = [];
      try {
        const result = await dns.resolve(hostname);
        resolvedAddresses = result;
      } catch (dnsError) {
        try {
          const result = await dns.resolve4(hostname);
          resolvedAddresses = result;
        } catch {
          return res.status(400).json({ message: "Unable to resolve hostname" });
        }
      }

      for (const addr of resolvedAddresses) {
        if (isPrivateOrLocalIP(addr)) {
          return res.status(400).json({ message: `URL resolves to a private or local IP address: ${addr}` });
        }
      }

      const openai = new OpenAI({
        apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
        baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
      });

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      let currentUrl = url;
      let redirectCount = 0;
      const maxRedirects = 5;
      let fetchResponse: globalThis.Response;

      try {
        while (redirectCount < maxRedirects) {
          const response = await fetch(currentUrl, {
            signal: controller.signal,
            headers: {
              'User-Agent': 'LamplightTechnology-Bot/1.0'
            },
            redirect: 'manual'
          });

          if (response.status >= 300 && response.status < 400) {
            const location = response.headers.get('location');
            if (!location) {
              clearTimeout(timeout);
              return res.status(400).json({ message: "Redirect without location header" });
            }

            let redirectUrl;
            try {
              redirectUrl = new URL(location, currentUrl);
            } catch {
              clearTimeout(timeout);
              return res.status(400).json({ message: "Invalid redirect URL" });
            }

            if (!['http:', 'https:'].includes(redirectUrl.protocol)) {
              clearTimeout(timeout);
              return res.status(400).json({ message: "Redirect to non-HTTP(S) protocol not allowed" });
            }

            const redirectHostname = redirectUrl.hostname;
            if (redirectHostname === 'localhost' || redirectHostname.endsWith('.local') || isPrivateOrLocalIP(redirectHostname)) {
              clearTimeout(timeout);
              return res.status(400).json({ message: "Redirect to private or local address not allowed" });
            }

            if (redirectUrl.hostname === 'replit.com' && redirectUrl.pathname.includes('__replshield')) {
              clearTimeout(timeout);
              return res.status(400).json({ 
                message: "This site is protected by Replit's anti-abuse shield. Please try accessing it directly in a browser first, or use a different URL." 
              });
            }

            let redirectAddresses: string[] = [];
            try {
              const result = await dns.resolve(redirectHostname);
              redirectAddresses = result;
            } catch {
              try {
                const result = await dns.resolve4(redirectHostname);
                redirectAddresses = result;
              } catch {
                clearTimeout(timeout);
                return res.status(400).json({ message: "Unable to resolve redirect hostname" });
              }
            }

            for (const addr of redirectAddresses) {
              if (isPrivateOrLocalIP(addr)) {
                clearTimeout(timeout);
                return res.status(400).json({ message: `Redirect URL resolves to private or local IP: ${addr}` });
              }
            }

            currentUrl = redirectUrl.toString();
            redirectCount++;
            continue;
          }

          fetchResponse = response;
          break;
        }

        if (redirectCount >= maxRedirects) {
          clearTimeout(timeout);
          return res.status(400).json({ message: "Too many redirects" });
        }

        if (!fetchResponse!.ok) {
          clearTimeout(timeout);
          return res.status(400).json({ message: `Failed to fetch URL (HTTP ${fetchResponse!.status})` });
        }
      } catch (fetchError: any) {
        clearTimeout(timeout);
        if (fetchError.name === 'AbortError') {
          return res.status(408).json({ message: "Request timeout - URL took too long to respond" });
        }
        return res.status(400).json({ message: "Failed to fetch URL" });
      } finally {
        clearTimeout(timeout);
      }

      const contentType = fetchResponse!.headers.get('content-type') || '';
      if (!contentType.includes('text/html')) {
        return res.status(400).json({ message: "URL must point to an HTML page" });
      }

      const html = await fetchResponse!.text();
      const $ = cheerio.load(html);
      
      $('script').remove();
      $('style').remove();
      $('noscript').remove();
      
      const title = $('title').text() || $('h1').first().text();
      const metaDescription = $('meta[name="description"]').attr('content') || 
                             $('meta[property="og:description"]').attr('content') || '';
      const ogImage = $('meta[property="og:image"]').attr('content') || 
                     $('meta[name="twitter:image"]').attr('content') || '';
      
      const bodyText = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 3000);

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that extracts business information from website content. Extract the business name, a brief description (1-2 sentences), and categorize the business. Return the response as JSON."
          },
          {
            role: "user",
            content: `Analyze this website and extract business information:
            
URL: ${url}
Title: ${title}
Meta Description: ${metaDescription}
Content: ${bodyText}

Return a JSON object with:
- name: The business/platform name (concise)
- description: A brief 1-2 sentence description of what the business does
- category: A category label (e.g., "Project Management", "E-Commerce", "Marketing", "Analytics", etc.)

Be concise and professional.`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      if (!completion.choices || completion.choices.length === 0 || !completion.choices[0].message.content) {
        return res.status(500).json({ message: "AI service returned unexpected response" });
      }

      const extractedData = JSON.parse(completion.choices[0].message.content || "{}");
      
      let logoUrl = ogImage || '';
      
      if (!logoUrl) {
        const category = extractedData.category || 'technology business';
        logoUrl = await fetchPlaceholderImage(category);
      }

      const platformData = {
        name: extractedData.name || title,
        description: extractedData.description || metaDescription || "A business platform",
        category: extractedData.category || "Business Software",
        link: url,
        logo: logoUrl,
        isActive: true,
        sortOrder: 0,
      };

      res.json(platformData);
    } catch (error) {
      console.error("Extract from URL error:", error);
      res.status(500).json({ message: "Failed to extract data from URL" });
    }
  });

  // Legal documents routes
  app.get("/api/legal-documents", async (req, res) => {
    try {
      const documents = await storage.getAllLegalDocuments();
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch legal documents" });
    }
  });

  app.get("/api/legal-documents/:type", async (req, res) => {
    try {
      const type = req.params.type;
      const document = await storage.getLegalDocument(type);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.json(document);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch document" });
    }
  });

  app.post("/api/legal-documents", requiresAdmin(), async (req, res) => {
    try {
      const documentData = insertLegalDocumentSchema.parse(req.body);
      const newDocument = await storage.createLegalDocument(documentData);
      res.status(201).json(newDocument);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create document" });
    }
  });

  app.put("/api/legal-documents/:id", requiresAdmin(), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertLegalDocumentSchema.partial().parse(req.body);
      
      const updatedDocument = await storage.updateLegalDocument(id, updateData);
      if (!updatedDocument) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.json(updatedDocument);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update document" });
    }
  });

  app.delete("/api/legal-documents/:id", requiresAdmin(), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteLegalDocument(id);

      if (!deleted) {
        return res.status(404).json({ message: "Document not found" });
      }

      res.json({ message: "Document deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // About Feature Card endpoints
  app.get("/api/about-feature-cards", async (req, res) => {
    try {
      const company = await storage.getCompany();
      const companyId = company?.id || 1;
      const cards = await storage.getAboutFeatureCards(companyId);
      res.json(cards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch feature cards" });
    }
  });

  app.post("/api/about-feature-cards", requiresAdmin(), async (req, res) => {
    try {
      const validatedData = insertAboutFeatureCardSchema.parse(req.body);
      const card = await storage.createAboutFeatureCard(validatedData);
      res.status(201).json(card);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create feature card" });
    }
  });

  app.put("/api/about-feature-cards/:id", requiresAdmin(), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertAboutFeatureCardSchema.partial().parse(req.body);
      const card = await storage.updateAboutFeatureCard(id, validatedData);

      if (!card) {
        return res.status(404).json({ message: "Feature card not found" });
      }

      res.json(card);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update feature card" });
    }
  });

  app.delete("/api/about-feature-cards/:id", requiresAdmin(), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteAboutFeatureCard(id);

      if (!deleted) {
        return res.status(404).json({ message: "Feature card not found" });
      }

      res.json({ message: "Feature card deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete feature card" });
    }
  });

  // Hero Badge endpoints
  app.get("/api/hero-badges", async (req, res) => {
    try {
      const company = await storage.getCompany();
      const companyId = company?.id || 1;
      const badges = await storage.getHeroBadges(companyId);
      res.json(badges);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch hero badges" });
    }
  });

  app.post("/api/hero-badges", requiresAdmin(), async (req, res) => {
    try {
      const validatedData = insertHeroBadgeSchema.parse(req.body);
      const badge = await storage.createHeroBadge(validatedData);
      res.status(201).json(badge);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create hero badge" });
    }
  });

  app.put("/api/hero-badges/:id", requiresAdmin(), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertHeroBadgeSchema.partial().parse(req.body);
      const badge = await storage.updateHeroBadge(id, validatedData);

      if (!badge) {
        return res.status(404).json({ message: "Hero badge not found" });
      }

      res.json(badge);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update hero badge" });
    }
  });

  app.delete("/api/hero-badges/:id", requiresAdmin(), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteHeroBadge(id);

      if (!deleted) {
        return res.status(404).json({ message: "Hero badge not found" });
      }

      res.json({ message: "Hero badge deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete hero badge" });
    }
  });

  // ============ Media File Routes ============

  app.get("/api/media", requiresAdmin(), async (_req, res) => {
    try {
      const files = await storage.getAllMediaFiles();
      const filesWithoutData = files.map(({ data, ...rest }) => rest);
      res.json(filesWithoutData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch media files" });
    }
  });

  app.get("/api/media/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const file = await storage.getMediaFile(id);
      if (!file) {
        return res.status(404).json({ message: "Media file not found" });
      }
      const buffer = Buffer.from(file.data.split(",")[1] || file.data, "base64");
      res.setHeader("Content-Type", file.mimeType);
      res.setHeader("Cache-Control", "public, max-age=31536000");
      res.send(buffer);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch media file" });
    }
  });

  app.post("/api/media", requiresAdmin(), async (req, res) => {
    try {
      const { filename, mimeType, size, data, altText } = req.body;
      if (!filename || !mimeType || !size || !data) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      if (size > 10 * 1024 * 1024) {
        return res.status(400).json({ message: "File too large (max 10MB)" });
      }
      const file = await storage.createMediaFile({ filename, mimeType, size, data, altText: altText || null });
      const { data: _, ...fileWithoutData } = file;
      res.status(201).json(fileWithoutData);
    } catch (error) {
      res.status(500).json({ message: "Failed to upload media file" });
    }
  });

  app.delete("/api/media/:id", requiresAdmin(), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteMediaFile(id);
      if (!deleted) {
        return res.status(404).json({ message: "Media file not found" });
      }
      res.json({ message: "Media file deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete media file" });
    }
  });

  // Contact form: in-memory rate limit, 5 submissions per IP per hour.
  // Single-instance deployment — fine for now.
  const submissionLog = new Map<string, number[]>();
  function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const hourAgo = now - 60 * 60 * 1000;
    const recent = (submissionLog.get(ip) ?? []).filter(t => t > hourAgo);
    if (recent.length >= 5) {
      submissionLog.set(ip, recent);
      return true;
    }
    recent.push(now);
    submissionLog.set(ip, recent);
    return false;
  }

  app.post("/api/contact", async (req, res) => {
    try {
      const ip =
        (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
        req.socket.remoteAddress ||
        "unknown";
      if (isRateLimited(ip)) {
        return res
          .status(429)
          .json({ message: "Too many submissions. Please try again later." });
      }

      // Defense-in-depth: backend re-validates email format, interest enum,
      // and message length so the API can't be hit with anything the frontend
      // schema would have rejected.
      const data = insertContactSubmissionSchema
        .extend({
          email: z.string().email("Valid email required").max(254),
          interestType: z.enum([
            "platforms",
            "consulting",
            "investment",
            "careers",
            "other",
          ]),
          message: z.string().min(10).max(4000),
          name: z.string().min(1).max(120),
        })
        .parse({
          ...req.body,
          ipAddress: ip,
          userAgent: req.headers["user-agent"] ?? null,
        });

      const submission = await storage.createContactSubmission(data);

      // Fire-and-forget — don't block the response on email delivery.
      sendContactNotification(submission)
        .then(ok => { if (ok) return storage.markNotificationSent(submission.id); })
        .catch(console.error);
      sendContactConfirmation(submission)
        .then(ok => { if (ok) return storage.markConfirmationSent(submission.id); })
        .catch(console.error);

      res.status(200).json({ ok: true });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid form data", issues: err.issues });
      }
      console.error("Contact submission failed:", err);
      res
        .status(500)
        .json({ message: "Failed to submit. Please try emailing info@llt.llc directly." });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
