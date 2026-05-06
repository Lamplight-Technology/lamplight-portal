import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { setupAuth } from "./auth";

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

const getBaseURL = (): string => {
  // Hostnames are case-insensitive (RFC 3986), but Stytch's redirect-URL
  // allowlist matches strictly — normalize to lowercase to avoid mismatches.
  const host = (raw: string) => raw.trim().toLowerCase();

  // 1. Check for custom domain first (production with custom domain)
  if (process.env.CUSTOM_DOMAIN) {
    return `https://${host(process.env.CUSTOM_DOMAIN)}`;
  }

  // 2. Railway public domain
  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    return `https://${host(process.env.RAILWAY_PUBLIC_DOMAIN)}`;
  }

  // 3. Check for REPLIT_DOMAINS (published Replit apps)
  if (process.env.REPLIT_DOMAINS) {
    const domains = process.env.REPLIT_DOMAINS.split(',').map(d => d.trim()).filter(Boolean);

    // Prefer .replit.app domains (official published app domain)
    const replitAppDomain = domains.find(d => d.endsWith('.replit.app'));
    if (replitAppDomain) {
      return `https://${host(replitAppDomain)}`;
    }

    // Fall back to first HTTPS-compatible domain
    const firstDomain = domains[0];
    if (firstDomain && firstDomain.includes('.')) {
      return `https://${host(firstDomain)}`;
    }
  }

  // 4. Check for Replit dev domain (Replit development/workspace)
  if (process.env.REPLIT_DEV_DOMAIN) {
    return `https://${host(process.env.REPLIT_DEV_DOMAIN)}`;
  }

  // 5. Legacy: Check if we're in production mode on Replit (older deployments)
  if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
    return `https://${host(process.env.REPL_SLUG)}.${host(process.env.REPL_OWNER)}.repl.co`;
  }

  // 6. Fallback for local development
  return 'http://localhost:5000';
};

setupAuth(app, getBaseURL());

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // Bind to 0.0.0.0 to work in all environments (Replit, Docker, cloud hosting, local)
  const port = 5000;
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
