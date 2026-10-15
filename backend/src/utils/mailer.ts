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
      const target = toEmail.toLowerCase().trim();
      const timeTag = new Date().toLocaleTimeString("en-GB", { timeZone: "Asia/Colombo", hour: "2-digit", minute: "2-digit", second: "2-digit" });

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
            "X-Entity-Ref-ID": `${Date.now()}-${target}`,
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
          const lastError = await res.text();
          console.warn(`[MAILER] Resend API response for ${target}: ${lastError}`);
          return { success: false, error: lastError };
        }
      } catch (err: any) {
      console.error(`[MAILER] Resend API exception:`, err);
      return { success: false, error: err.message };
    }
  }

  console.log(`[MAILER] No RESEND_API_KEY in environment. Code for ${toEmail}: ${code}`);
  return { success: false, error: "No RESEND_API_KEY configured." };
}

export async function sendStaffWelcomeEmail(params: {
  name: string;
  email: string;
  role: string;
  temporaryPassword: string;
  isReset?: boolean;
}): Promise<{ success: boolean; error?: string }> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL || "Balasuriya Group Security <security@balasuriyagroup.tech>";

  if (!resendApiKey) return { success: false, error: "No RESEND_API_KEY" };

  const target = params.email.toLowerCase().trim();
  const timeTag = new Date().toLocaleTimeString("en-GB", { timeZone: "Asia/Colombo", hour: "2-digit", minute: "2-digit" });
  const roleName = params.role.replace(/_/g, " ");
  const portalUrl = "https://www.balasuriyagroup.tech/login";

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 16px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
              <tr>
                <td style="background-color: #0B1E3F; padding: 32px 40px; text-align: center; border-bottom: 3px solid #D4AF37;">
                  <div style="color: #D4AF37; font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 8px;">
                    Official Staff Portal
                  </div>
                  <div style="color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: 0.5px; font-family: 'Times New Roman', Georgia, serif;">
                    BALASURIYA GROUP
                  </div>
                  <div style="color: #94a3b8; font-size: 12px; margin-top: 4px;">
                    Executive Identity &amp; Staff Provisioning
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px 40px 32px 40px;">
                  <h2 style="color: #0B1E3F; font-size: 19px; font-weight: 700; margin-top: 0; margin-bottom: 16px;">
                    ${params.isReset ? "Staff Account Password Reset" : "Welcome to Balasuriya Group"}
                  </h2>
                  <p style="color: #334155; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
                    Dear <strong>${params.name}</strong>,<br/>
                    ${params.isReset
                      ? "Your Balasuriya Group staff account password has been reset by the Administrator. Please find your credentials below:"
                      : "Your official staff account has been provisioned on the Balasuriya Group Corporate Management Portal. Below are your login credentials:"}
                  </p>
                  
                  <div style="background-color: #f1f5f9; border-left: 4px solid #0B1E3F; padding: 16px 20px; border-radius: 6px; margin-bottom: 28px;">
                    <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 13px; color: #1e293b;">
                      <tr>
                        <td style="font-weight: 600; width: 140px; color: #64748b;">Assigned Role:</td>
                        <td style="font-weight: 700; color: #0B1E3F;">${roleName}</td>
                      </tr>
                      <tr>
                        <td style="font-weight: 600; color: #64748b;">Official Email:</td>
                        <td style="font-family: monospace; font-weight: 600;">${target}</td>
                      </tr>
                      <tr>
                        <td style="font-weight: 600; color: #64748b;">Temporary Password:</td>
                        <td style="font-family: monospace; font-weight: 700; color: #0B1E3F; font-size: 15px; letter-spacing: 1px;">${params.temporaryPassword}</td>
                      </tr>
                    </table>
                  </div>

                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding-bottom: 28px;">
                        <a href="${portalUrl}" target="_blank" style="background-color: #0B1E3F; color: #ffffff; padding: 14px 36px; text-decoration: none; font-weight: 700; font-size: 14px; border-radius: 8px; display: inline-block; box-shadow: 0 4px 12px rgba(11, 30, 63, 0.25);">
                          Sign In to Staff Portal
                        </a>
                      </td>
                    </tr>
                  </table>

                  <div style="background-color: #FEF3C7; border: 1px solid #FDE68A; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px;">
                    <p style="color: #92400E; font-size: 12px; line-height: 1.5; margin: 0;">
                      <strong>Security Action Required:</strong> Please sign in using the temporary password above, then open your Profile / Security settings to choose your personal password.
                    </p>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 11px; line-height: 1.6;">
                  <strong>Balasuriya Group Corporate Headquarters</strong><br/>
                  Colombo, Sri Lanka &bull; <a href="https://www.balasuriyagroup.tech" style="color: #64748b; text-decoration: none;">www.balasuriyagroup.tech</a><br/>
                  &copy; ${new Date().getFullYear()} Balasuriya Group. Confidential Corporate Communication.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const textPayload = `BALASURIYA GROUP — OFFICIAL STAFF PORTAL\n\nDear ${params.name},\n\nYour official staff account has been provisioned.\n\nAssigned Role: ${roleName}\nOfficial Email: ${target}\nTemporary Password: ${params.temporaryPassword}\nLogin Portal: ${portalUrl}\n\nPlease sign in and change your temporary password immediately.\n\nBalasuriya Group Corporate Headquarters — Colombo, Sri Lanka`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail.includes("<") ? fromEmail : `Balasuriya Group Security <${fromEmail}>`,
        to: [target],
        reply_to: "security@balasuriyagroup.tech",
        subject: params.isReset
          ? `Balasuriya Group — Staff Portal Password Reset [${timeTag}]`
          : `Welcome to Balasuriya Group — Official Staff Account Provisioned [${timeTag}]`,
        headers: {
          "X-Entity-Ref-ID": `${Date.now()}-${target}`,
        },
        html: emailHtml,
        text: textPayload,
      }),
    });
    return { success: res.ok };
  } catch (err: any) {
    console.error("[sendStaffWelcomeEmail] error:", err);
    return { success: false, error: err.message };
  }
}
