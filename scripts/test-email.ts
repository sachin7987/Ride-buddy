/**
 * Send a single test email to verify SMTP / Resend credentials are wired up.
 *
 * Usage:
 *   npm run test:email -- you@example.com
 *
 * Reads RESEND_API_KEY / SMTP_* env vars from .env (via dotenv), so you can
 * confirm a deployment will be able to deliver mail before relying on it.
 */
import "dotenv/config";
import { sendMail } from "../src/lib/mailer";

async function main() {
  const to = process.argv[2];
  if (!to) {
    console.error(
      "\n❌ Missing recipient.\n" +
        "   Usage: npm run test:email -- you@example.com\n"
    );
    process.exit(1);
  }

  // Print a config summary so the user can sanity-check what's actually set.
  console.log("\n📧 Email config:");
  console.log(
    "   RESEND_API_KEY:",
    process.env.RESEND_API_KEY ? "✓ set" : "(not set)"
  );
  console.log("   SMTP_HOST:    ", process.env.SMTP_HOST || "(not set)");
  console.log("   SMTP_PORT:    ", process.env.SMTP_PORT || "(not set)");
  console.log("   SMTP_USER:    ", process.env.SMTP_USER || "(not set)");
  console.log(
    "   SMTP_PASS:    ",
    process.env.SMTP_PASS ? `✓ set (${process.env.SMTP_PASS.length} chars)` : "(not set)"
  );
  console.log("   EMAIL_FROM:   ", process.env.EMAIL_FROM || "(default)");
  console.log("   To:           ", to);
  console.log("");

  const result = await sendMail({
    to,
    subject: "RideBuddy — test email ✓",
    text: [
      "Hi there,",
      "",
      "If you're reading this, your RideBuddy email setup is working correctly.",
      "Verification emails will be delivered just like this one.",
      "",
      "— RideBuddy mailer self-test",
    ].join("\n"),
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; color: #0f1f1a; background:#ffffff;">
        <div style="text-align:center; margin-bottom: 24px;">
          <span style="display:inline-block; width:44px; height:44px; line-height:44px; border-radius:12px; background:#16a97a; color:white; font-weight:700; font-size:22px;">R</span>
        </div>
        <h1 style="font-size:22px; margin:0 0 12px;">Mailer test ✅</h1>
        <p style="line-height:1.55; color:#374151;">
          If you're reading this, your RideBuddy email setup is working
          correctly. Verification emails will be delivered just like this one.
        </p>
        <p style="line-height:1.55; color:#6b7280; font-size:13px;">
          Sent at ${new Date().toISOString()}
        </p>
      </div>
    `,
  });

  if (!result.delivered) {
    console.error(
      `\n❌ Delivery failed via ${result.provider}. Check the error above.\n`
    );
    process.exit(2);
  }

  if (result.provider === "console") {
    console.warn(
      "\n⚠️  No mail provider configured — the message was logged to the\n" +
        "   console above instead of sent. Set RESEND_API_KEY or SMTP_*\n" +
        "   env vars in .env, then re-run this command.\n"
    );
    process.exit(3);
  }

  console.log(`\n✅ Test email queued via ${result.provider} → ${to}`);
  console.log("   Check the inbox (and spam folder) within a minute.\n");
}

main().catch((err) => {
  console.error("\n❌ Unexpected error:", err);
  process.exit(99);
});
