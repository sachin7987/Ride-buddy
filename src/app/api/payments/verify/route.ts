import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { verifyRazorpaySignature } from "@/lib/razorpay";

const schema = z.object({
  bookingId: z.string(),
  razorpay_order_id: z.string().optional(),
  razorpay_payment_id: z.string().optional(),
  razorpay_signature: z.string().optional(),
  mock: z.boolean().optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const data = schema.parse(await req.json());
  const payment = await prisma.payment.findUnique({
    where: { bookingId: data.bookingId },
    include: { booking: { include: { ride: true } } },
  });
  if (!payment || payment.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (data.mock || payment.provider === "mock") {
    // simulated success
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "PAID",
          paidAt: new Date(),
          providerPaymentId: `mock_pay_${Date.now()}`,
        },
      });
      await tx.booking.update({
        where: { id: payment.bookingId },
        data: { status: "CONFIRMED" },
      });
      await tx.ride.update({
        where: { id: payment.booking.rideId },
        data: { availableSeats: { decrement: payment.booking.seats } },
      });
    });
    return NextResponse.json({ ok: true });
  }

  if (
    !data.razorpay_order_id ||
    !data.razorpay_payment_id ||
    !data.razorpay_signature
  ) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }
  const valid = verifyRazorpaySignature({
    orderId: data.razorpay_order_id,
    paymentId: data.razorpay_payment_id,
    signature: data.razorpay_signature,
  });
  if (!valid) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED" },
    });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: "PAID",
        paidAt: new Date(),
        providerPaymentId: data.razorpay_payment_id,
        providerSignature: data.razorpay_signature,
      },
    });
    await tx.booking.update({
      where: { id: payment.bookingId },
      data: { status: "CONFIRMED" },
    });
    await tx.ride.update({
      where: { id: payment.booking.rideId },
      data: { availableSeats: { decrement: payment.booking.seats } },
    });
  });
  return NextResponse.json({ ok: true });
}
