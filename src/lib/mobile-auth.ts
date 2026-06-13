import crypto from "node:crypto";

/**
 * Minimal HMAC-signed token for the mobile app (a compact JWT-like format:
 * base64url(payload).base64url(HMAC-SHA256)). We deliberately avoid adding a
 * JWT dependency — the web app uses NextAuth cookies, and the mobile clients
 * just need a stateless bearer token signed with the same server secret.
 *
 * The token carries the user id and an expiry. It is verified on every
 * request via the Bearer fallback in `getSession()`.
 */

const SECRET =
  process.env.NEXTAUTH_SECRET || process.env.MOBILE_JWT_SECRET || "";

const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

type MobileTokenPayload = {
  sub: string; // user id
  exp: number; // expiry (epoch ms)
};

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

function sign(data: string): string {
  return crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
}

/** Issues a signed mobile token for a user id. */
export function signMobileToken(userId: string, ttlMs = TOKEN_TTL_MS): string {
  if (!SECRET) throw new Error("NEXTAUTH_SECRET is not configured");
  const payload: MobileTokenPayload = {
    sub: userId,
    exp: Date.now() + ttlMs,
  };
  const body = b64url(JSON.stringify(payload));
  const sig = sign(body);
  return `${body}.${sig}`;
}

/**
 * Verifies a mobile token. Returns the user id when valid (signature matches
 * and not expired), otherwise null. Uses a constant-time comparison.
 */
export function verifyMobileToken(token: string): string | null {
  if (!SECRET || !token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  const expected = sign(body);
  // timingSafeEqual throws on length mismatch — guard first.
  if (
    sig.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  ) {
    return null;
  }
  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    ) as MobileTokenPayload;
    if (!payload?.sub || typeof payload.exp !== "number") return null;
    if (Date.now() > payload.exp) return null;
    return payload.sub;
  } catch {
    return null;
  }
}
