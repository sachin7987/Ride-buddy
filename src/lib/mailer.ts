/**
 * Tiny mailer that works in three modes:
 *
 *  1. RESEND_API_KEY is set       → POSTs to Resend's REST API.
 *  2. SMTP_HOST + SMTP_USER + SMTP_PASS are set
 *                                 → uses nodemailer (Gmail/Mailgun/SES SMTP/etc.)
 *  3. Neither is set              → logs the email to the server console
 *                                    so local dev works without any provider.
 *
 * Always called server-side only — there's no SDK dep for Resend, just `fetch`.
 */
import nodemailer, { type Transporter } from "nodemailer";

const APP_URL =
  process.env.APP_URL ||
  process.env.NEXTAUTH_URL ||
  "http://localhost:3000";

type SendArgs = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

// Cached transporter so we don't recreate the SMTP pool on every send.
let smtpTransporter: Transporter | null = null;
function getSmtpTransporter(): Transporter | null {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  if (smtpTransporter) return smtpTransporter;
  const port = Number(process.env.SMTP_PORT || 465);
  // Port 465 implies implicit TLS; 587/25 use STARTTLS (secure: false).
  const secure = port === 465;
  smtpTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
  return smtpTransporter;
}

export async function sendMail({
  to,
  subject,
  html,
  text,
}: SendArgs): Promise<{ delivered: boolean; provider: string }> {
  const resendKey = process.env.RESEND_API_KEY;
  const from =
    process.env.EMAIL_FROM || "RideBuddy <onboarding@resend.dev>";

  // 1. Resend (preferred when configured — easiest deliverability)
  if (resendKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from, to, subject, html, text }),
      });
      if (!res.ok) {
        const body = await res.text();
        console.error(
          `[mailer] Resend API ${res.status} for ${to}:`,
          body
        );
        return { delivered: false, provider: "resend" };
      }
      return { delivered: true, provider: "resend" };
    } catch (err) {
      console.error("[mailer] Resend fetch failed:", err);
      return { delivered: false, provider: "resend" };
    }
  }

  // 2. SMTP via nodemailer (Gmail App Password, Mailgun, SES, etc.)
  const transporter = getSmtpTransporter();
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from,
        to,
        subject,
        text,
        html,
      });
      console.info(
        `[mailer] SMTP sent to ${to} (id=${info.messageId})`
      );
      return { delivered: true, provider: "smtp" };
    } catch (err: any) {
      // Surface common Gmail/SMTP misconfigurations clearly so the dev sees
      // exactly what to fix instead of a generic "send failed".
      const code = err?.code || err?.responseCode;
      const msg = err?.response || err?.message || String(err);
      console.error(
        `[mailer] SMTP send failed (code=${code}) to ${to}: ${msg}`
      );
      if (
        code === "EAUTH" ||
        /invalid login|username and password not accepted|application-specific password required/i.test(
          msg
        )
      ) {
        console.error(
          "[mailer] HINT: For Gmail you must use a 16-character App Password " +
            "(https://myaccount.google.com/apppasswords) with 2-Step Verification enabled."
        );
      }
      return { delivered: false, provider: "smtp" };
    }
  }

  // 3. No provider configured — log to console so the developer can copy/paste
  // the verification link out of their terminal.
  console.warn(
    "\n────────────────  EMAIL (no provider configured)  ────────────────"
  );
  console.warn(`To:      ${to}`);
  console.warn(`From:    ${from}`);
  console.warn(`Subject: ${subject}`);
  console.warn("");
  console.warn(text);
  console.warn(
    "──────────────────────────────────────────────────────────────────\n"
  );
  return { delivered: true, provider: "console" };
}

/**
 * Build the email used to verify a new account. Returns both HTML and plain
 * text versions plus the verification URL (handy for callers that want to
 * also include it in API responses during local dev).
 *
 * The HTML uses a centered, table-based layout — divs with CSS flex/grid
 * don't render reliably in Outlook, Yahoo, or older Gmail clients, so all
 * structural alignment is done with <table> and inline style="" attributes.
 * Every text node also redeclares font-family because Gmail's HTML cleaner
 * strips <style> blocks and resets <h1>/<p> defaults to a serif fallback.
 */
export function buildVerificationEmail(opts: {
  name: string;
  token: string;
}) {
  const url = `${APP_URL}/auth/verify-email?token=${encodeURIComponent(
    opts.token
  )}`;
  const subject = "Confirm your RideBuddy email";
  const text = [
    `Hi ${opts.name},`,
    "",
    "Thanks for joining RideBuddy! Please confirm your email address by opening the link below:",
    "",
    url,
    "",
    "This link expires in 24 hours. If you didn't create a RideBuddy account, you can safely ignore this email.",
    "",
    "— Team RideBuddy",
  ].join("\n");

  // Single inline-only stylesheet baked into every cell — this is the
  // friendliest pattern for Gmail / Outlook / Apple Mail / Yahoo.
  const FONT =
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>${subject}</title>
  </head>
  <body style="margin:0; padding:0; background:#f5f7f6; font-family:${FONT};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f7f6; padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="520" cellpadding="0" cellspacing="0" border="0" style="max-width:520px; width:100%; background:#ffffff; border-radius:14px; box-shadow:0 1px 3px rgba(15,31,26,0.06); overflow:hidden;">
            <!-- Hero -->
            <tr>
              <td align="center" style="padding:36px 32px 8px 32px; font-family:${FONT};">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="center" style="background:#16a97a; width:52px; height:52px; border-radius:14px; color:#ffffff; font-family:${FONT}; font-weight:700; font-size:24px; line-height:52px;">R</td>
                  </tr>
                </table>
                <h1 style="margin:20px 0 6px 0; font-family:${FONT}; font-size:24px; line-height:1.3; font-weight:700; color:#0f1f1a; text-align:center;">
                  Confirm your email
                </h1>
                <p style="margin:0; padding:0 8px; font-family:${FONT}; font-size:15px; line-height:1.55; color:#4b5563; text-align:center;">
                  Hi ${escapeHtml(opts.name)}, thanks for joining RideBuddy!<br />
                  Tap the button below to confirm this is your email address.
                </p>
              </td>
            </tr>

            <!-- Button -->
            <tr>
              <td align="center" style="padding:28px 32px 8px 32px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="center" bgcolor="#16a97a" style="border-radius:10px;">
                      <a href="${url}"
                         style="display:inline-block; padding:14px 32px; font-family:${FONT}; font-size:15px; font-weight:600; color:#ffffff; text-decoration:none; border-radius:10px; background:#16a97a; line-height:1;">
                        Confirm my email
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Fallback link -->
            <tr>
              <td align="center" style="padding:20px 32px 8px 32px; font-family:${FONT};">
                <p style="margin:0 0 6px 0; font-family:${FONT}; font-size:13px; line-height:1.55; color:#6b7280; text-align:center;">
                  Or copy &amp; paste this link into your browser:
                </p>
                <p style="margin:0; font-family:${FONT}; font-size:13px; line-height:1.55; word-break:break-all; text-align:center;">
                  <a href="${url}" style="color:#0e8862; text-decoration:underline;">${url}</a>
                </p>
              </td>
            </tr>

            <!-- Divider + footer -->
            <tr>
              <td style="padding:24px 32px 32px 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="border-top:1px solid #e5e7eb; padding-top:18px; font-family:${FONT}; font-size:12px; line-height:1.55; color:#9ca3af; text-align:center;">
                      This link expires in 24 hours. If you didn't create a RideBuddy account, you can safely ignore this email.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <p style="margin:18px 0 0 0; font-family:${FONT}; font-size:12px; color:#9ca3af; text-align:center;">
            © RideBuddy · Share rides across India
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, text, html, url };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
