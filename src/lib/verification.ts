import crypto from "crypto";

// Secret for signing verification tokens
const VERIFY_SECRET = process.env.AUTH_SECRET || "falko_otp_secret_key_2026";

export function signVerificationToken(payload: {
  email: string;
  phone: string;
  code: string;
  expiresAt: number;
}): string {
  const data = JSON.stringify(payload);
  const signature = crypto.createHmac("sha256", VERIFY_SECRET).update(data).digest("hex");
  return Buffer.from(JSON.stringify({ data, signature })).toString("base64");
}

export function verifyVerificationToken(token: string): {
  valid: boolean;
  payload?: { email: string; phone: string; code: string; expiresAt: number };
} {
  try {
    const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
    const { data, signature } = decoded;
    const expectedSignature = crypto.createHmac("sha256", VERIFY_SECRET).update(data).digest("hex");
    if (signature !== expectedSignature) {
      return { valid: false };
    }
    const payload = JSON.parse(data);
    if (Date.now() > payload.expiresAt) {
      return { valid: false };
    }
    return { valid: true, payload };
  } catch {
    return { valid: false };
  }
}
