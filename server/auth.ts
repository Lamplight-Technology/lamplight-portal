import type { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import * as stytch from "stytch";
import { storage } from "./storage";

declare module "express-session" {
  interface SessionData {
    user?: {
      stytchUserId: string;
      email: string;
      name?: string | null;
    };
    postLoginRedirect?: string;
  }
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const stytchEnabled = !!(process.env.STYTCH_PROJECT_ID && process.env.STYTCH_SECRET);

export const stytchClient = stytchEnabled
  ? new stytch.Client({
      project_id: process.env.STYTCH_PROJECT_ID!,
      secret: process.env.STYTCH_SECRET!,
    })
  : null;

const sanitizeRedirect = (target: unknown): string => {
  if (typeof target !== "string") return "/";
  if (!target.startsWith("/") || target.startsWith("//")) return "/";
  return target;
};

export function setupAuth(app: Express, baseURL: string) {
  if (!stytchEnabled) {
    console.log("Stytch not configured (STYTCH_PROJECT_ID / STYTCH_SECRET missing); auth disabled.");
    app.use((req, _res, next) => {
      // Provide a no-op session shape so routes don't NPE.
      (req as any).session = (req as any).session ?? {};
      next();
    });
    return;
  }

  console.log(`Stytch configured with baseURL: ${baseURL}`);

  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET must be set when Stytch auth is enabled.");
  }

  const sessionStore = process.env.DATABASE_URL
    ? new (connectPgSimple(session))({
        conObject: { connectionString: process.env.DATABASE_URL },
        createTableIfMissing: true,
      })
    : undefined;

  app.set("trust proxy", 1);

  app.use(
    session({
      name: "lamplight_session",
      store: sessionStore,
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      rolling: true,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: ONE_DAY_MS,
      },
    }),
  );

  // POST /api/auth/send — email a magic link
  app.post("/api/auth/send", async (req: Request, res: Response) => {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "A valid email address is required." });
    }

    // Only allow allowlisted admins to receive a link.
    const adminUser = await storage.getAdminUserByEmail(email);
    if (!adminUser) {
      // Generic response so we don't leak which emails are admins.
      return res.json({ ok: true });
    }

    // Stash the post-login redirect in the session — Stytch URL validation
    // rejects callback URLs whose query params aren't in the dashboard allowlist,
    // so we keep the magic link URL clean and read the target back in /callback.
    req.session.postLoginRedirect = sanitizeRedirect(req.body?.redirect);
    const callbackURL = `${baseURL}/api/auth/callback`;

    try {
      await new Promise<void>((resolve, reject) =>
        req.session.save((err) => (err ? reject(err) : resolve())),
      );
      await stytchClient!.magicLinks.email.loginOrCreate({
        email,
        login_magic_link_url: callbackURL,
        signup_magic_link_url: callbackURL,
      });
      return res.json({ ok: true });
    } catch (err) {
      console.error("Stytch send magic link error:", err);
      return res.status(500).json({ message: "Failed to send magic link." });
    }
  });

  // GET /api/auth/callback — Stytch redirects here after the user clicks the link
  app.get("/api/auth/callback", async (req: Request, res: Response) => {
    const token = typeof req.query.token === "string" ? req.query.token : "";
    const tokenType = typeof req.query.stytch_token_type === "string" ? req.query.stytch_token_type : "magic_links";
    const redirectTarget = sanitizeRedirect(req.session.postLoginRedirect);

    if (!token) {
      return res.redirect("/?auth_error=missing_token");
    }
    if (tokenType !== "magic_links") {
      return res.redirect("/?auth_error=unsupported_token");
    }

    try {
      const result = await stytchClient!.magicLinks.authenticate({
        token,
        session_duration_minutes: 60 * 24,
      });

      const stytchUserId = result.user_id;
      const email = result.user.emails?.[0]?.email?.toLowerCase();

      if (!email) {
        return res.redirect("/?auth_error=no_email");
      }

      // Stitch the Stytch user_id back onto the admin row on first login.
      const adminUser = await storage.getAdminUserByEmail(email);
      if (adminUser && adminUser.stytchUserId !== stytchUserId) {
        await storage.setAdminUserStytchId(adminUser.id, stytchUserId);
      }

      req.session.user = {
        stytchUserId,
        email,
        name: adminUser?.name ?? null,
      };
      delete req.session.postLoginRedirect;

      return req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.redirect("/?auth_error=session_save");
        }
        return res.redirect(redirectTarget);
      });
    } catch (err) {
      console.error("Stytch authenticate error:", err);
      return res.redirect("/?auth_error=invalid_token");
    }
  });

  // GET /api/logout — destroy the session
  app.get("/api/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) console.error("Session destroy error:", err);
      res.clearCookie("lamplight_session");
      res.redirect("/");
    });
  });
}

export function requireAuth() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.session?.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };
}

export function requireAdmin() {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.session?.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const adminUser = await storage.getAdminUserByEmail(req.session.user.email);
      if (!adminUser) {
        return res.status(403).json({ message: "Admin access denied" });
      }
      next();
    } catch (error) {
      console.error("Error checking admin status:", error);
      return res.status(500).json({ message: "Error verifying admin access" });
    }
  };
}
