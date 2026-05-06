// Resend email service. Wraps the Resend SDK and exposes typed senders.
// Sends never throw — they return false on failure so callers can persist
// delivery state without unwinding the request flow.

import { Resend } from "resend";
import type { ContactSubmission } from "@shared/schema";

const FROM = process.env.RESEND_FROM_EMAIL || "Lamplight Technology <hello@llt.llc>";
const NOTIFICATION_TO = process.env.CONTACT_NOTIFICATION_EMAIL || "info@llt.llc";

let cachedClient: Resend | null = null;
let warned = false;

function client(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    if (!warned) {
      console.warn(
        "[email] RESEND_API_KEY is not set — emails will be skipped. Set the env var to enable delivery.",
      );
      warned = true;
    }
    return null;
  }
  if (!cachedClient) cachedClient = new Resend(key);
  return cachedClient;
}

const INTEREST_LABELS: Record<string, string> = {
  platforms: "Platforms",
  consulting: "Consulting & AI Adoption",
  investment: "Investment or Partnership",
  careers: "Careers",
  other: "Other",
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function brandHeader(): string {
  return `
    <div style="background:linear-gradient(135deg,#0f172a 0%,#1e3a8a 50%,#312e81 100%);padding:24px 28px;color:#ffffff;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;">
      <div style="font-size:18px;font-weight:700;letter-spacing:0.02em;">Lamplight Technology</div>
      <div style="font-size:13px;color:#bfdbfe;margin-top:2px;">Built with purpose. Operated with integrity.</div>
    </div>`;
}

function emailShell(innerHtml: string): string {
  return `<!doctype html>
<html><body style="margin:0;background:#f1f5f9;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#0f172a;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);margin-top:24px;margin-bottom:24px;">
    ${brandHeader()}
    <div style="padding:28px;font-size:15px;line-height:1.55;">
      ${innerHtml}
    </div>
    <div style="padding:16px 28px;background:#f8fafc;color:#64748b;font-size:12px;border-top:1px solid #e2e8f0;">
      Lamplight Technology · llt.llc
    </div>
  </div>
</body></html>`;
}

export async function sendContactNotification(
  submission: ContactSubmission,
): Promise<boolean> {
  const r = client();
  if (!r) return false;

  const interestLabel = INTEREST_LABELS[submission.interestType] || submission.interestType;
  const subject = `New contact form: ${submission.name} — ${interestLabel}`;

  const safeName = escapeHtml(submission.name);
  const safeCompany = submission.company ? escapeHtml(submission.company) : "—";
  const safeEmail = escapeHtml(submission.email);
  const safeInterest = escapeHtml(interestLabel);
  const safeMessage = escapeHtml(submission.message).replace(/\n/g, "<br/>");
  const safeIp = escapeHtml(submission.ipAddress ?? "unknown");
  const safeUa = escapeHtml(submission.userAgent ?? "unknown");

  const html = emailShell(`
    <h2 style="margin:0 0 16px;font-size:20px;color:#0f172a;">New contact form submission</h2>
    <table style="border-collapse:collapse;width:100%;font-size:14px;">
      <tr><td style="padding:6px 0;color:#475569;width:140px;">Name</td><td style="padding:6px 0;font-weight:600;">${safeName}</td></tr>
      <tr><td style="padding:6px 0;color:#475569;">Company</td><td style="padding:6px 0;">${safeCompany}</td></tr>
      <tr><td style="padding:6px 0;color:#475569;">Email</td><td style="padding:6px 0;"><a href="mailto:${safeEmail}" style="color:#2563eb;">${safeEmail}</a></td></tr>
      <tr><td style="padding:6px 0;color:#475569;">Interest</td><td style="padding:6px 0;">${safeInterest}</td></tr>
    </table>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;"/>
    <div style="color:#475569;font-size:13px;margin-bottom:6px;">Message</div>
    <div style="white-space:pre-wrap;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px;font-size:14px;">${safeMessage}</div>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;"/>
    <div style="font-size:12px;color:#94a3b8;">IP: ${safeIp} · UA: ${safeUa}</div>
  `);

  const text = [
    `New contact form submission`,
    ``,
    `Name:     ${submission.name}`,
    `Company:  ${submission.company ?? "—"}`,
    `Email:    ${submission.email}`,
    `Interest: ${interestLabel}`,
    ``,
    `Message:`,
    submission.message,
    ``,
    `--`,
    `IP: ${submission.ipAddress ?? "unknown"}`,
    `UA: ${submission.userAgent ?? "unknown"}`,
  ].join("\n");

  try {
    const { error } = await r.emails.send({
      from: FROM,
      to: NOTIFICATION_TO,
      replyTo: submission.email,
      subject,
      html,
      text,
    });
    if (error) {
      console.error("[email] notification send error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] notification threw:", err);
    return false;
  }
}

export async function sendContactConfirmation(
  submission: ContactSubmission,
): Promise<boolean> {
  const r = client();
  if (!r) return false;

  const subject = `Thanks for reaching out to Lamplight`;
  const safeName = escapeHtml(submission.name.split(/\s+/)[0] || submission.name);

  const html = emailShell(`
    <h2 style="margin:0 0 16px;font-size:20px;color:#0f172a;">Thanks, ${safeName}.</h2>
    <p style="margin:0 0 14px;">We received your message and a real human at Lamplight will get back to you within 1–2 business days.</p>
    <p style="margin:0 0 14px;">If something is time-sensitive, you can reach us directly at <a href="mailto:info@llt.llc" style="color:#2563eb;">info@llt.llc</a>.</p>
    <p style="margin:18px 0 0;color:#475569;">— The Lamplight team</p>
  `);

  const text = [
    `Thanks, ${submission.name.split(/\s+/)[0] || submission.name}.`,
    ``,
    `We received your message and a real human at Lamplight will get back to you within 1–2 business days.`,
    ``,
    `If something is time-sensitive, you can reach us directly at info@llt.llc.`,
    ``,
    `— The Lamplight team`,
  ].join("\n");

  try {
    const { error } = await r.emails.send({
      from: FROM,
      to: submission.email,
      subject,
      html,
      text,
    });
    if (error) {
      console.error("[email] confirmation send error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] confirmation threw:", err);
    return false;
  }
}
