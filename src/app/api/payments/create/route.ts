import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { createRazorpayOrder, razorpayEnabled } from "@/lib/razorpay";

const schema = z.object({ bookingId: z.string() });

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { bookingId } = schema.parse(await req.json());
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.passengerId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // already paid?
  const existing = await prisma.payment.findUnique({ where: { bookingId } });
  if (existing && existing.status === "PAID") {
    return NextResponse.json({ payment: existing, alreadyPaid: true });
  }

  if (razorpayEnabled) {
    const order = await createRazorpayOrder(booking.totalAmount, booking.id);
    const payment = existing
      ? await prisma.payment.update({
          where: { bookingId },
          data: { provider: "razorpay", providerOrderId: order.id, status: "CREATED" },
        })
      : await prisma.payment.create({
          data: {
            bookingId,
            userId: session.user.id,
            amount: booking.totalAmount,
            provider: "razorpay",
            providerOrderId: order.id,
          },
        });
    return NextResponse.json({
      provider: "razorpay",
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: booking.totalAmount,
      payment,
    });
  }

  // mock fallback
  const mockOrderId = `mock_${Date.now()}`;
  const payment = existing
    ? await prisma.payment.update({
        where: { bookingId },
        data: { provider: "mock", providerOrderId: mockOrderId, status: "CREATED" },
      })
    : await prisma.payment.create({
        data: {
          bookingId,
          userId: session.user.id,
          amount: booking.totalAmount,
          provider: "mock",
          providerOrderId: mockOrderId,
        },
      });
  return NextResponse.json({
    provider: "mock",
    orderId: mockOrderId,
    amount: booking.totalAmount,
    payment,
  });
}
