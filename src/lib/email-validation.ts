/**
 * Email validation utilities used by both the signup form (client) and the
 * register API (server). Goes beyond `z.string().email()` with:
 *
 *  - RFC 5321 length cap (254 chars total, 64 chars local part)
 *  - Stricter regex than browser/HTML validation (rejects `a@b`, `..@`, etc.)
 *  - Disposable / temp-mail domain blocklist (~50 most common)
 *  - Typo detection for the top consumer providers (e.g. "gmial.com")
 *
 * Use `validateEmail(raw)` everywhere — returns a discriminated union so
 * callers can show targeted UX (e.g. "Did you mean gmail.com?").
 */

const EMAIL_REGEX =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/** Throwaway-mail providers we don't want signups from. Not exhaustive — just
 *  the high-volume ones. Add more as you see fit. */
const DISPOSABLE_DOMAINS = new Set([
  "10minutemail.com",
  "10minutemail.net",
  "tempmail.com",
  "tempmail.io",
  "tempmailo.com",
  "temp-mail.org",
  "tempinbox.com",
  "guerrillamail.com",
  "guerrillamail.info",
  "guerrillamail.net",
  "guerrillamail.org",
  "guerrillamail.biz",
  "guerrillamailblock.com",
  "sharklasers.com",
  "mailinator.com",
  "mailinator.net",
  "mailinator2.com",
  "spam4.me",
  "trashmail.com",
  "trashmail.de",
  "trashmail.net",
  "yopmail.com",
  "yopmail.net",
  "yopmail.fr",
  "throwawaymail.com",
  "fakeinbox.com",
  "getairmail.com",
  "getnada.com",
  "nada.email",
  "maildrop.cc",
  "moakt.com",
  "mailcatch.com",
  "mintemail.com",
  "dispostable.com",
  "discard.email",
  "discardmail.com",
  "instagibbs.com",
  "mvrht.net",
  "mytemp.email",
  "tempr.email",
  "tmpmail.org",
  "tmpmail.net",
  "spambox.us",
  "fakemail.fr",
  "binkmail.com",
  "burnermail.io",
  "anonbox.net",
]);

/** Top consumer providers — used for typo suggestions. */
const COMMON_PROVIDERS = [
  "gmail.com",
  "yahoo.com",
  "yahoo.co.in",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
  "proton.me",
  "protonmail.com",
  "rediffmail.com",
  "live.com",
];

/** Typical fat-finger typos a user makes — keys are wrong, value is right. */
const COMMON_TYPOS: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gnail.com": "gmail.com",
  "gmal.com": "gmail.com",
  "gmaill.com": "gmail.com",
  "gmsil.com": "gmail.com",
  "gmali.com": "gmail.com",
  "gemail.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.cmo": "gmail.com",
  "gmail.con": "gmail.com",
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "yhaoo.com": "yahoo.com",
  "yaho.co.in": "yahoo.co.in",
  "hotmial.com": "hotmail.com",
  "hotnail.com": "hotmail.com",
  "outlok.com": "outlook.com",
  "iclod.com": "icloud.com",
};

export type EmailValidationResult =
  | { ok: true; email: string }
  | {
      ok: false;
      reason:
        | "empty"
        | "too_long"
        | "invalid_format"
        | "disposable"
        | "typo";
      message: string;
      /** Suggested correction when reason === "typo". */
      suggestion?: string;
    };

export function validateEmail(input: unknown): EmailValidationResult {
  if (typeof input !== "string") {
    return { ok: false, reason: "empty", message: "Email is required" };
  }
  const email = input.trim().toLowerCase();
  if (!email) {
    return { ok: false, reason: "empty", message: "Email is required" };
  }
  if (email.length > 254) {
    return {
      ok: false,
      reason: "too_long",
      message: "Email is too long (max 254 characters)",
    };
  }
  // Local part can't exceed 64 chars per RFC 5321
  const [local, domain] = email.split("@");
  if (!local || !domain || local.length > 64) {
    return {
      ok: false,
      reason: "invalid_format",
      message: "Please enter a valid email address",
    };
  }
  if (!EMAIL_REGEX.test(email)) {
    return {
      ok: false,
      reason: "invalid_format",
      message: "Please enter a valid email address",
    };
  }
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      ok: false,
      reason: "disposable",
      message:
        "Please use a permanent email address — disposable mail services aren't allowed.",
    };
  }
  if (COMMON_TYPOS[domain]) {
    const suggested = `${local}@${COMMON_TYPOS[domain]}`;
    return {
      ok: false,
      reason: "typo",
      message: `Did you mean ${suggested}?`,
      suggestion: suggested,
    };
  }
  return { ok: true, email };
}

/** True when a domain looks legitimate (not disposable, format-valid).
 *  Used by the API as a quick yes/no without crafting a UI message. */
export function isAcceptableEmail(input: unknown): boolean {
  return validateEmail(input).ok;
}

/** For client-side autocomplete-ish suggestion of the canonical provider
 *  domain when the user types something close. Returns null if no clear
 *  suggestion can be made. */
export function suggestEmailFix(email: string): string | null {
  const at = email.lastIndexOf("@");
  if (at === -1 || at === email.length - 1) return null;
  const local = email.slice(0, at).toLowerCase();
  const domain = email.slice(at + 1).toLowerCase();
  if (COMMON_TYPOS[domain]) return `${local}@${COMMON_TYPOS[domain]}`;
  // Check Levenshtein-1 against common providers (a single missing/extra/swap)
  for (const p of COMMON_PROVIDERS) {
    if (domain !== p && levenshtein(domain, p) === 1) {
      return `${local}@${p}`;
    }
  }
  return null;
}

/** Tiny Levenshtein implementation — only computes up to maxDist=2 for speed. */
function levenshtein(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 2) return 99;
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => i);
  for (let j = 1; j <= n; j++) {
    let prev = dp[0];
    dp[0] = j;
    for (let i = 1; i <= m; i++) {
      const tmp = dp[i];
      dp[i] = Math.min(
        dp[i] + 1,
        dp[i - 1] + 1,
        prev + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
      prev = tmp;
    }
  }
  return dp[m];
}
