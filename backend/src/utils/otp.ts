import { prisma } from "../lib/prisma.js";

const CODE_TTL_MINUTES = 5;

function generateSixDigitCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function createVerificationCode(identifier: string): Promise<string> {
  const code = generateSixDigitCode();
  const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000);

  await prisma.verificationCode.create({
    data: { identifier, code, expiresAt },
  });

  // TODO: wire to real email/SMS delivery once a provider is chosen.
  // Logged here only so the flow is usable during development.
  console.log(`[OTP] Verification code for ${identifier}: ${code} (expires in ${CODE_TTL_MINUTES}m)`);

  return code;
}

export async function consumeVerificationCode(identifier: string, code: string): Promise<boolean> {
  const record = await prisma.verificationCode.findFirst({
    where: { identifier, code, consumed: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });

  if (!record) return false;

  await prisma.verificationCode.update({
    where: { id: record.id },
    data: { consumed: true },
  });

  return true;
}
