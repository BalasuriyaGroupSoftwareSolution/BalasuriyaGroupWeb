import crypto from "crypto";
import { prisma } from "../lib/prisma.js";
import { sendOtpEmail } from "./mailer.js";

const CODE_TTL_MINUTES = 10;
const MAX_ACTIVE_CODES_PER_HOUR = 5;

function hashCode(identifier: string, code: string) {
  // Store only a hash, so a database leak doesn't expose live codes.
  return crypto.createHash("sha256").update(`${identifier}:${code}`).digest("hex");
}

/** Creates a 6-digit code in the database (serverless-safe) and emails it. Never logs the code. */
export async function createVerificationCode(identifier: string): Promise<void> {
  const normalized = identifier.toLowerCase().trim();

  const recent = await prisma.verificationCode.count({
    where: { identifier: normalized, createdAt: { gt: new Date(Date.now() - 60 * 60 * 1000) } },
  });
  if (recent >= MAX_ACTIVE_CODES_PER_HOUR) return; // silently throttle

  const code = String(crypto.randomInt(100000, 1000000));
  await prisma.verificationCode.updateMany({
    where: { identifier: normalized, consumed: false },
    data: { consumed: true },
  });
  await prisma.verificationCode.create({
    data: {
      identifier: normalized,
      code: hashCode(normalized, code),
      expiresAt: new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000),
    },
  });

  await sendOtpEmail(normalized, code);
}

export async function consumeVerificationCode(identifier: string, code: string): Promise<boolean> {
  if (!/^\d{6}$/.test(code)) return false;
  const normalized = identifier.toLowerCase().trim();

  // Atomic: only one request can flip consumed=false -> true.
  const result = await prisma.verificationCode.updateMany({
    where: {
      identifier: normalized,
      code: hashCode(normalized, code),
      consumed: false,
      expiresAt: { gt: new Date() },
    },
    data: { consumed: true },
  });
  return result.count > 0;
}
