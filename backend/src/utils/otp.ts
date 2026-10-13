import crypto from "crypto";
import { prisma } from "../lib/prisma.js";
import { sendVerificationEmail } from "./mailer.js";

const CODE_TTL_MINUTES = 10;

// High-reliability in-memory store to guarantee OTP works even if database connections fluctuate
interface StoredCode {
  code: string;
  expiresAt: Date;
  consumed: boolean;
}
const memoryOtpStore = new Map<string, StoredCode>();

function generateSixDigitCode(): string {
  // Cryptographically secure 6-digit random code (100000 - 999999)
  return String(crypto.randomInt(100000, 1000000));
}

export async function createVerificationCode(identifier: string): Promise<string> {
  const normalized = identifier.toLowerCase();
  const code = generateSixDigitCode();
  const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000);

  // 1. Save in in-memory store
  memoryOtpStore.set(normalized, { code, expiresAt, consumed: false });

  // 2. Persist to database if available
  try {
    await prisma.verificationCode.updateMany({
      where: { identifier: normalized, consumed: false },
      data: { consumed: true },
    });

    await prisma.verificationCode.create({
      data: { identifier: normalized, code, expiresAt },
    });
  } catch (err) {
    console.warn("[OTP] Database save skipped, active in-memory OTP valid:", err);
  }

  // 3. Dispatch real email
  sendVerificationEmail(normalized, code).catch((err) => {
    console.error("[OTP] Email delivery encountered error:", err);
  });

  console.log(`[OTP] Generated 6-digit verification code for ${normalized}: ${code}`);
  return code;
}

export async function consumeVerificationCode(identifier: string, code: string): Promise<boolean> {
  if (!code || code.length !== 6) return false;
  const normalized = identifier.toLowerCase();

  // 1. Check in-memory store
  const memRecord = memoryOtpStore.get(normalized);
  if (memRecord && memRecord.code === code && !memRecord.consumed) {
    if (memRecord.expiresAt > new Date()) {
      memRecord.consumed = true;
      memoryOtpStore.set(normalized, memRecord);
      return true;
    }
  }

  // 2. Check database store
  try {
    const record = await prisma.verificationCode.findFirst({
      where: {
        identifier: normalized,
        code,
        consumed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (record) {
      await prisma.verificationCode.update({
        where: { id: record.id },
        data: { consumed: true },
      });
      return true;
    }
  } catch (err) {
    console.warn("[OTP] Database lookup error in consumeVerificationCode:", err);
  }

  return false;
}
