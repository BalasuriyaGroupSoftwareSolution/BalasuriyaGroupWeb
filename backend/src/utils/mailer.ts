/**
 * Mailer service for Balasuriya Group platform.
 * Supports Resend, Brevo, or falls back to development logging.
 */

export async function sendVerificationEmail(toEmail: string, code: string): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const brevoApiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.FROM_EMAIL || "security@balasuriyagroup.tech";

  // 1. Try Resend if configured
  if (resendApiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `Balasuriya Group Security <${fromEmail}>`,
          to: [toEmail],
          subject: `Balasuriya Group Security Code: ${code}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
              <h2 style="color: #0B1E3F;">Balasuriya Group Security Verification</h2>
              <p>Your one-time 6-digit verification code for password reset or identity confirmation is:</p>
              <div style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #1E3A6E; padding: 16px; background-color: #F4F6F9; border-radius: 8px; text-align: center; margin: 20px 0;">
                ${code}
              </div>
              <p style="color: #64748b; font-size: 13px;">This code will expire in 5 minutes. If you did not request this code, please ignore this email or contact corporate security.</p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="font-size: 11px; color: #94a3b8;">Balasuriya Group Corporate Headquarters — Colombo, Sri Lanka</p>
            </div>
          `,
        }),
      });

      if (res.ok) {
        console.log(`[MAILER] Successfully dispatched verification email via Resend to ${toEmail}`);
        return true;
      }
      const errText = await res.text();
      console.warn(`[MAILER] Resend API responded with error: ${errText}`);
    } catch (err) {
      console.error(`[MAILER] Failed to call Resend API:`, err);
    }
  }

  // 2. Try Brevo if configured
  if (brevoApiKey) {
    try {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": brevoApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: { name: "Balasuriya Group", email: fromEmail },
          to: [{ email: toEmail }],
          subject: `Balasuriya Group Security Code: ${code}`,
          htmlContent: `<h2>Your Balasuriya Group Code is: <strong>${code}</strong></h2><p>Expires in 5 minutes.</p>`,
        }),
      });
      if (res.ok) {
        console.log(`[MAILER] Successfully dispatched verification email via Brevo to ${toEmail}`);
        return true;
      }
    } catch (err) {
      console.error(`[MAILER] Failed to call Brevo API:`, err);
    }
  }

  // 3. Fallback / Development logging
  console.log(`[MAILER] No external SMTP / Resend API key configured. OTP code for ${toEmail}: ${code}`);
  return false;
}
