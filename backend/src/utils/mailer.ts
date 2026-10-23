/**
 * Email delivery through Resend (https://resend.com — free tier: 3,000 emails/month).
 * Every value that came from a user is HTML-escaped before it goes into an email.
 */
import { env } from "../config/env.js";

const INBOX = process.env.NOTIFY_EMAIL || "balasuriyagroup.info@gmail.com";

export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function fromAddress(label = "Balasuriya Group") {
  const configured = process.env.FROM_EMAIL || "security@balasuriyagroup.tech";
  return configured.includes("<") ? configured : `${label} <${configured}>`;
}

async function send(payload: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // No secrets in logs — only the fact that mail is not configured.
    console.warn(`[mailer] RESEND_API_KEY not set; email "${payload.subject}" to ${payload.to} was not sent.`);
    return { success: false, error: "Email is not configured." };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: fromAddress(),
        to: [payload.to],
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
        reply_to: payload.replyTo,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.warn(`[mailer] Resend rejected email to ${payload.to}: ${res.status} ${body.slice(0, 300)}`);
      return { success: false, error: `Resend ${res.status}` };
    }
    return { success: true };
  } catch (err: any) {
    console.error("[mailer] Resend request failed:", err?.message);
    return { success: false, error: err?.message };
  }
}

function layout(title: string, bodyHtml: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#fff;border-radius:14px;border:1px solid #e2e8f0;overflow:hidden;">
<tr><td style="background:#0B1E3F;padding:26px 32px;text-align:center;border-bottom:3px solid #D4AF37;">
<div style="color:#fff;font-size:22px;font-weight:800;font-family:Georgia,serif;">BALASURIYA GROUP</div>
<div style="color:#94a3b8;font-size:12px;margin-top:4px;">${escapeHtml(title)}</div></td></tr>
<tr><td style="padding:32px;color:#334155;font-size:14px;line-height:1.6;">${bodyHtml}</td></tr>
<tr><td style="background:#f8fafc;padding:18px 32px;text-align:center;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:11px;">
Balasuriya Group &bull; Colombo, Sri Lanka &bull; <a href="${env.siteUrl}" style="color:#64748b;">${env.siteUrl.replace(/^https?:\/\//, "")}</a></td></tr>
</table></td></tr></table></body></html>`;
}

function button(href: string, label: string) {
  return `<div style="text-align:center;margin:24px 0;"><a href="${escapeHtml(href)}" style="background:#0B1E3F;color:#fff;padding:13px 30px;text-decoration:none;font-weight:700;border-radius:8px;display:inline-block;">${escapeHtml(label)}</a></div>`;
}

export function sendOtpEmail(to: string, code: string) {
  return send({
    to,
    subject: `Your Balasuriya Group sign-in code: ${code}`,
    html: layout(
      "Sign-in code",
      `<p>Use this code to sign in. It expires in 10 minutes.</p>
       <div style="font-size:30px;font-weight:700;letter-spacing:8px;color:#1E3A6E;padding:14px;background:#F4F6F9;border-radius:8px;text-align:center;font-family:monospace;">${escapeHtml(code)}</div>
       <p style="color:#64748b;font-size:12px;">If you didn't ask for this, you can ignore this email.</p>`
    ),
    text: `Your Balasuriya Group sign-in code is ${code}. It expires in 10 minutes.`,
  });
}

export function sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
  return send({
    to,
    subject: "Reset your Balasuriya Group password",
    html: layout(
      "Password reset",
      `<p>Hello ${escapeHtml(name)},</p>
       <p>We received a request to reset the password for <strong>${escapeHtml(to)}</strong>. This link works once and expires in 30 minutes.</p>
       ${button(resetUrl, "Reset my password")}
       <p style="color:#64748b;font-size:12px;word-break:break-all;">Or paste this link into your browser:<br/>${escapeHtml(resetUrl)}</p>
       <p style="color:#64748b;font-size:12px;">If you didn't ask for this, ignore this email — your password won't change.</p>`
    ),
    text: `Reset your Balasuriya Group password (link valid 30 minutes, single use): ${resetUrl}`,
  });
}

export function sendStaffWelcomeEmail(params: {
  name: string;
  email: string;
  role: string;
  temporaryPassword: string;
  isReset?: boolean;
}) {
  const loginUrl = `${env.siteUrl}/login`;
  const roleName = params.role.replace(/_/g, " ");
  return send({
    to: params.email,
    subject: params.isReset
      ? "Balasuriya Group — your staff password was reset"
      : "Welcome to Balasuriya Group — your staff account",
    html: layout(
      "Staff portal",
      `<p>Dear <strong>${escapeHtml(params.name)}</strong>,</p>
       <p>${
         params.isReset
           ? "Your staff account password was reset by an administrator."
           : "A staff account has been created for you on the Balasuriya Group portal."
       }</p>
       <table cellpadding="6" style="background:#f1f5f9;border-left:4px solid #0B1E3F;border-radius:6px;font-size:13px;width:100%;">
         <tr><td style="color:#64748b;width:150px;">Role</td><td><strong>${escapeHtml(roleName)}</strong></td></tr>
         <tr><td style="color:#64748b;">Email</td><td style="font-family:monospace;">${escapeHtml(params.email)}</td></tr>
         <tr><td style="color:#64748b;">Temporary password</td><td style="font-family:monospace;font-size:15px;"><strong>${escapeHtml(params.temporaryPassword)}</strong></td></tr>
       </table>
       ${button(loginUrl, "Sign in to the staff portal")}
       <p style="background:#FEF3C7;border:1px solid #FDE68A;border-radius:8px;padding:10px 14px;color:#92400E;font-size:12px;">Please sign in and change this temporary password straight away (Profile → Security).</p>`
    ),
    text: `Balasuriya Group staff portal\nRole: ${roleName}\nEmail: ${params.email}\nTemporary password: ${params.temporaryPassword}\nSign in: ${loginUrl}\nPlease change your password after signing in.`,
  });
}

export function sendInquiryNotificationEmail(params: {
  division: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  referenceId?: string;
}) {
  const when = new Date().toLocaleString("en-GB", { timeZone: "Asia/Colombo" });
  return send({
    to: INBOX,
    replyTo: params.email,
    subject: `[${params.division}] ${params.subject} — ${params.name}`.slice(0, 200),
    html: layout(
      `${params.division} inquiry`,
      `<h2 style="margin:0 0 6px;color:#0B1E3F;font-size:17px;">${escapeHtml(params.subject)}</h2>
       <p style="color:#64748b;font-size:12px;margin:0 0 16px;">Ref ${escapeHtml(params.referenceId || "-")} &bull; ${escapeHtml(when)}</p>
       <p><strong>From:</strong> ${escapeHtml(params.name)} (${escapeHtml(params.email)})</p>
       ${params.phone ? `<p><strong>Phone:</strong> ${escapeHtml(params.phone)}</p>` : ""}
       <div style="background:#f8fafc;border-left:4px solid #0B1E3F;padding:14px;border-radius:4px;white-space:pre-wrap;">${escapeHtml(params.message)}</div>
       <p style="color:#64748b;font-size:12px;">Reply to this email to answer the customer directly. Full details are in the staff portal.</p>`
    ),
    text: `${params.subject}\nFrom: ${params.name} <${params.email}> ${params.phone ?? ""}\nRef: ${params.referenceId ?? "-"}\n\n${params.message}`,
  });
}
