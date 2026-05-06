# 04 — Contact Form + Resend Email

> Read [`HANDOFF.md`](../../HANDOFF.md) §1–§3 first.

## Goal

Replace the homepage's `mailto:` "Send Message" button with a real form that:
- Collects Name, Company, Email, Interest type, Message
- Persists to a new `contact_submissions` table
- Sends a notification email to `info@llt.llc` (with `Reply-To` = submitter)
- Sends a confirmation email to the submitter
- Rate-limits on IP

The signal "we have an interest-type dropdown" is what makes this read like a holding company rather than a single-product shop.

`resend` is already in `package.json`. Run `npm install` if you haven't.

## Tasks

### 4.1 Schema — `contact_submissions` table

Add to `shared/schema.ts`:

```ts
export const contactSubmissions = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  company: text("company"),
  email: text("email").notNull(),
  interestType: text("interest_type").notNull(), // platforms | consulting | investment | careers | other
  message: text("message").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  notificationSent: boolean("notification_sent").default(false),
  confirmationSent: boolean("confirmation_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions).omit({
  id: true,
  notificationSent: true,
  confirmationSent: true,
  createdAt: true,
});

export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
```

Then `npm run db:push`.

The frontend form schema (separate, for UI validation):

```ts
const contactFormSchema = z.object({
  name: z.string().min(1, "Required").max(120),
  company: z.string().max(120).optional().or(z.literal("")),
  email: z.string().email("Valid email required").max(254),
  interestType: z.enum(["platforms", "consulting", "investment", "careers", "other"]),
  message: z.string().min(10, "At least 10 characters").max(4000),
});
```

### 4.2 Email service — `server/email.ts`

New file. Wraps Resend.

**Env vars:**
- `RESEND_API_KEY` — required. If missing, log a warning and `return false` from each send (so dev doesn't crash without it).
- `RESEND_FROM_EMAIL` — default `Lamplight Technology <hello@llt.llc>`.
- `CONTACT_NOTIFICATION_EMAIL` — default `info@llt.llc`.

**Two exports:**

```ts
export async function sendContactNotification(submission: ContactSubmission): Promise<boolean>
export async function sendContactConfirmation(submission: ContactSubmission): Promise<boolean>
```

**Behavior:**
- Build both `html` and `text` bodies for each.
- Notification subject: `New contact form: {{name}} — {{interestType}}`. Body lists all fields readably. Set `replyTo` to the submitter's email.
- Confirmation subject: `Thanks for reaching out to Lamplight`. Warm, brief — one short paragraph + signature. Mention 1–2 business day response. Use Lamplight branding (a simple HTML header with the wordmark is fine; don't over-design).
- Wrap every send in try/catch. Failures must not throw — return `false`. Log via `console.error`.
- Pre-render the HTML/text inline in the function (no template engine needed for two emails).

Build the module so it can be reused for future emails (AnchorPoint receipts, partnership confirmations, etc.).

### 4.3 API route — `POST /api/contact`

In `server/routes.ts`, alongside other routes (no auth — public endpoint):

```ts
// In-memory rate limit: 5 per IP per hour. Single-instance deployment — fine.
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
    const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim()
      || req.socket.remoteAddress
      || "unknown";
    if (isRateLimited(ip)) {
      return res.status(429).json({ message: "Too many submissions. Please try again later." });
    }

    const data = insertContactSubmissionSchema.parse({
      ...req.body,
      ipAddress: ip,
      userAgent: req.headers["user-agent"] ?? null,
    });

    const submission = await storage.createContactSubmission(data);

    // Fire-and-forget — don't block the response on email delivery.
    sendContactNotification(submission)
      .then(ok => ok && storage.markNotificationSent(submission.id))
      .catch(console.error);
    sendContactConfirmation(submission)
      .then(ok => ok && storage.markConfirmationSent(submission.id))
      .catch(console.error);

    res.status(200).json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid form data", issues: err.issues });
    }
    console.error("Contact submission failed:", err);
    res.status(500).json({ message: "Failed to submit. Please try emailing info@llt.llc directly." });
  }
});
```

### 4.4 Storage methods

In `server/storage.ts`, add to the `IStorage` interface AND both impls (`MemStorage` and `DatabaseStorage`):

```ts
createContactSubmission(data: InsertContactSubmission): Promise<ContactSubmission>;
markNotificationSent(id: number): Promise<void>;
markConfirmationSent(id: number): Promise<void>;
listContactSubmissions(): Promise<ContactSubmission[]>;  // for future admin use
```

`createContactSubmission` inserts and returns the row. `markNotificationSent` / `markConfirmationSent` flip the boolean. `listContactSubmissions` returns all, ordered by `createdAt DESC`.

### 4.5 Frontend form — replace the contact section in `client/src/pages/home.tsx`

The existing contact section is centered "Reach out" + a single `mailto:` button. Replace with:

- Same dark gradient background, same section header (LET'S CONNECT / Reach out / `company.contactDescription`).
- Below the header: two-column grid on desktop (`md:grid-cols-2`), single column on mobile.
  - **Left column:** short reassurance text and the existing `info@llt.llc` mailto link as a fallback ("Prefer email? Reach us directly at…"). Optionally: a couple of bullet-style reassurances ("We respond within 1–2 business days · Real humans, not autoresponders · Your info isn't shared with anyone").
  - **Right column:** the form.
- Form fields:
  - **Name** — required, text
  - **Company / Organization** — optional, text
  - **Email** — required, email
  - **What are you interested in?** — required select with options:
    - Platforms
    - Consulting & AI Adoption
    - Investment or Partnership
    - Careers
    - Other
  - **Message** — required textarea, 4000 char limit, character count below it
- Submit button: "Send Message" — same gradient as the existing button. Disable while pending; small spinner inside the button.
- Use `react-hook-form` + `zodResolver(contactFormSchema)`. Use shadcn `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`, `Input`, `Textarea`, `Select`, `Button` — already in the project.
- TanStack Query mutation hitting `POST /api/contact`. On 200: replace the form with a success state ("Thanks — we'll be in touch within 1–2 business days. Check your inbox for a confirmation."). On 429: inline message "Too many submissions, please try again in a bit." On other failure: `useToast()` error toast and stay on the form with values preserved.

### 4.6 Env vars + Resend domain verification

Update `.env.example` (create if missing). New entries:

```
RESEND_API_KEY=re_xxx                                     # Required for email to send
RESEND_FROM_EMAIL="Lamplight Technology <hello@llt.llc>"  # Optional, has default
CONTACT_NOTIFICATION_EMAIL=info@llt.llc                   # Optional, has default
```

**Critical: Resend domain verification.** `llt.llc` must be a verified sending domain in Resend, or emails will silently bounce. Verification requires SPF, DKIM, and DMARC DNS records that Resend generates. **Surface this in your final report explicitly so Todd does it.**

## Acceptance

- [ ] `npm run db:push` confirms `contact_submissions` exists.
- [ ] Form renders with all 5 fields including the dropdown.
- [ ] Validation rejects: missing name/email/message, invalid email, message < 10 chars, missing or invalid `interestType`.
- [ ] Successful submission inserts a row in `contact_submissions`.
- [ ] Notification email arrives at `info@llt.llc` with `Reply-To` = submitter.
- [ ] Confirmation email arrives at the submitter address.
- [ ] Form shows the success state on 200; toast on error; rate-limit message on 429.
- [ ] Submitting 6× from the same IP within an hour returns 429 on the 6th.
- [ ] If `RESEND_API_KEY` is unset, the API still returns 200 (row persists) and logs a warning instead of crashing.
- [ ] Mobile (~375px) form layout is clean and the dropdown is usable.
- [ ] `npm run check` passes.

## Final report must flag

- Whether `RESEND_API_KEY` was found in env or needs Todd to add it.
- Whether `llt.llc` is verified in Resend, or DNS records still need to be added.
