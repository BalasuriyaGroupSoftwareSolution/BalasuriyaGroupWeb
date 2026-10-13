/**
 * Mailer service for Balasuriya Group platform.
 * Supports Resend with dual-recipient fallback for sandbox accounts.
 */

export async function sendVerificationEmail(
  toEmail: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL || "onboarding@resend.dev";

  if (resendApiKey) {
    try {
      // In Resend free sandbox (onboarding@resend.dev), emails can only be delivered
      // to the address that registered the Resend account.
      // We attempt both corporate and personal Clemon emails so delivery succeeds.
      const recipientList = [toEmail];
      if (toEmail.toLowerCase() === "clemonbalasuriyagroup@gmail.com") {
        recipientList.push("avishkaclemon@gmail.com");
      }
      if (toEmail.toLowerCase() !== "balasuriyagroup.software@gmail.com") {
        recipientList.push("balasuriyagroup.software@gmail.com");
      }

      let lastError = "";
      for (const target of recipientList) {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: `Balasuriya Group Security <${fromEmail}>`,
            to: [target],
            subject: `Balasuriya Group Security Verification Code: ${code}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
                <h2 style="color: #0B1E3F; margin-top: 0;">Balasuriya Group Corporate Security</h2>
                <p style="color: #334155; font-size: 14px;">Your single-use 6-digit verification code is:</p>
                <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1E3A6E; padding: 18px; background-color: #F4F6F9; border-radius: 8px; text-align: center; margin: 24px 0; font-family: monospace;">
                  ${code}
                </div>
                <p style="color: #64748b; font-size: 13px; line-height: 1.5;">This security code is strictly confidential, single-use, and valid for 10 minutes. If you did not request this verification, please contact corporate IT immediately.</p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                <p style="font-size: 11px; color: #94a3b8; margin-bottom: 0;">Balasuriya Group Corporate Headquarters — Colombo, Sri Lanka</p>
              </div>
            `,
          }),
        });

        if (res.ok) {
          console.log(`[MAILER] Successfully dispatched verification email to ${target}`);
          return { success: true };
        } else {
          lastError = await res.text();
          console.warn(`[MAILER] Resend API response for ${target}: ${lastError}`);
        }
      }

      return { success: false, error: lastError };
    } catch (err: any) {
      console.error(`[MAILER] Resend API exception:`, err);
      return { success: false, error: err.message };
    }
  }

  console.log(`[MAILER] No RESEND_API_KEY in environment. Code for ${toEmail}: ${code}`);
  return { success: false, error: "No RESEND_API_KEY configured." };
}
