/**
 * Mailer service for Balasuriya Group platform.
 * Supports Resend with dual-recipient fallback for sandbox accounts.
 */

export async function sendVerificationEmail(
  toEmail: string,
  code: string,
  resetUrl?: string
): Promise<{ success: boolean; error?: string }> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL || "Balasuriya Group Security <security@balasuriyagroup.tech>";

  if (resendApiKey) {
    try {
      const recipientList = [toEmail];
      if (toEmail.toLowerCase() === "clemonbalasuriyagroup@gmail.com") {
        recipientList.push("avishkaclemon@gmail.com");
      }
      if (toEmail.toLowerCase() !== "balasuriyagroup.software@gmail.com") {
        recipientList.push("balasuriyagroup.software@gmail.com");
      }

      const timeTag = new Date().toLocaleTimeString("en-GB", { timeZone: "Asia/Colombo", hour: "2-digit", minute: "2-digit", second: "2-digit" });

      let lastError = "";
      for (const target of recipientList) {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromEmail.includes("<") ? fromEmail : `Balasuriya Group Security <${fromEmail}>`,
            to: [target],
            subject: `Reset Your Balasuriya Group Password [${timeTag}]`,
            headers: {
              "X-Entity-Ref-ID": `${Date.now()}`,
            },
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
                <h2 style="color: #0B1E3F; margin-top: 0;">Balasuriya Group Corporate Security</h2>
                <p style="color: #334155; font-size: 14px;">We received a password reset request for your account: <strong>${toEmail}</strong></p>
                ${
                  resetUrl
                    ? `
                <p style="color: #334155; font-size: 14px;">Click the button below to set your new password directly without needing any code:</p>
                <div style="text-align: center; margin: 24px 0;">
                  <a href="${resetUrl}" style="background-color: #0B1E3F; color: #ffffff; padding: 14px 32px; text-decoration: none; font-weight: bold; border-radius: 8px; font-size: 15px; display: inline-block;">
                    Reset My Password
                  </a>
                </div>
                <p style="color: #64748b; font-size: 12px; line-height: 1.5; word-break: break-all;">
                  Or copy and paste this link in your browser:<br/>
                  <a href="${resetUrl}" style="color: #1E3A6E;">${resetUrl}</a>
                </p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                <p style="color: #64748b; font-size: 12px; margin-bottom: 6px;">Alternatively, enter this 6-digit code manually:</p>
                `
                    : ""
                }
                <div style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #1E3A6E; padding: 14px; background-color: #F4F6F9; border-radius: 8px; text-align: center; margin: 16px 0; font-family: monospace;">
                  ${code}
                </div>
                <p style="color: #64748b; font-size: 12px; line-height: 1.5;">This link and security code are valid for 15 minutes. If you did not request this verification, please ignore this email.</p>
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
