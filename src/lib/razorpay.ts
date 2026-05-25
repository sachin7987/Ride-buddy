import crypto from "node:crypto";

export const razorpayKey = process.env.RAZORPAY_KEY_ID;
export const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
export const razorpayEnabled = !!(razorpayKey && razorpaySecret);

export async function createRazorpayOrder(amount: number, receipt: string) {
  if (!razorpayEnabled) throw new Error("Razorpay not configured");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "Basic " +
        Buffer.from(`${razorpayKey}:${razorpaySecret}`).toString("base64"),
    },
    body: JSON.stringify({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Razorpay create order failed: ${text}`);
  }
  return res.json() as Promise<{ id: string; status: string; amount: number }>;
}

export function verifyRazorpaySignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  if (!razorpaySecret) return false;
  const expected = crypto
    .createHmac("sha256", razorpaySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return expected === signature;
}
