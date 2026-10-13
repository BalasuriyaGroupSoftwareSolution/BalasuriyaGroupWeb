import crypto from "crypto";
import { prisma } from "../lib/prisma.js";
import { sendVerificationEmail } from "./mailer.js";

const CODE_TTL_MINUTES = 10;

function generateSixDigitCode(): string {
  // Cryptographically secure 6-digit random code (100000 - 999999)
  return String(crypto.randomInt(100000, 1000000));
}

export async function createVerificationCode(identifier: string): Promise<string> {
  const code = generateSixDigitCode();
  const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000);

  // Invalidate any prior active codes for this user to prevent race conditions
  try {
    await prisma.verificationCode.updateMany({
      where: { identifier, consumed: false },
      data: { consumed: true },
    });

    await prisma.verificationCode.create({
      data: { identifier, code, expiresAt },
    });
  } catch (err) {
    console.error("Prisma verification code recording error:", err);
  }

  // Dispatch via secure mailer service
  const emailSent = await sendVerificationEmail(identifier, code).catch((err) => {
    console.warn("Background email send error:", err);
    return false;
  });

  if (!emailSent) {
    console.warn(`[OTP] Note: No email provider configured yet. To receive emails in inbox, set RESEND_API_KEY in environment variables.`);
  }

  return code;
}

export async function consumeVerificationCode(identifier: string, code: string): Promise<boolean> {
  if (!code || code.length !== 6) return false;

  try {
    const record = await prisma.verificationCode.findFirst({
      where: {
        identifier,
        code,
        consumed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      return false;
    }

    // Single-use: immediately mark consumed
    await prisma.verificationCode.update({
      where: { id: record.id },
      data: { consumed: true },
    });

    return true;
  } catch (err) {
    console.error("consumeVerificationCode error:", err);
    return false;
  }
}
