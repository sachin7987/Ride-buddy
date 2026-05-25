import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding RideBuddy…");
  const password = await bcrypt.hash("password123", 10);

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@ridebuddy.in" },
    update: { isAdmin: true, kycStatus: "VERIFIED" },
    create: {
      email: "admin@ridebuddy.in",
      phone: "9999999999",
      name: "Admin",
      passwordHash: password,
      isAdmin: true,
      kycStatus: "VERIFIED",
      role: "BOTH",
    },
  });

  // Driver
  const driver = await prisma.user.upsert({
    where: { email: "arjun@ridebuddy.in" },
    update: {},
    create: {
      email: "arjun@ridebuddy.in",
      phone: "9000000001",
      name: "Arjun Verma",
      passwordHash: password,
      kycStatus: "VERIFIED",
      role: "DRIVER",
      bio: "Software engineer who loves road trips. Bengaluru ↔ Mysuru weekly.",
      ratingAvg: 4.8,
      ratingCount: 27,
    },
  });

  // Passenger
  const rider = await prisma.user.upsert({
    where: { email: "riya@ridebuddy.in" },
    update: {},
    create: {
      email: "riya@ridebuddy.in",
      phone: "9000000002",
      name: "Riya Sharma",
      passwordHash: password,
      kycStatus: "VERIFIED",
      role: "PASSENGER",
      bio: "Designer in Bengaluru. Always traveling for hikes.",
      ratingAvg: 4.9,
      ratingCount: 14,
    },
  });

  // Driver vehicle
  const vehicle = await prisma.vehicle.upsert({
    where: { plateNumber: "KA01AB1234" },
    update: {},
    create: {
      ownerId: driver.id,
      type: "CAR",
      make: "Maruti",
      model: "Swift",
      year: 2022,
      color: "White",
      plateNumber: "KA01AB1234",
      seats: 4,
      isVerified: true,
    },
  });

  // Sample rides
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(8, 30, 0, 0);

  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  dayAfter.setHours(18, 0, 0, 0);

  await prisma.ride.deleteMany({ where: { driverId: driver.id } });
  await prisma.ride.createMany({
    data: [
      {
        driverId: driver.id,
        vehicleId: vehicle.id,
        fromCity: "Bengaluru",
        fromAddress: "Koramangala, Bengaluru, Karnataka",
        fromLat: 12.9352,
        fromLng: 77.6245,
        toCity: "Mysuru",
        toAddress: "City Bus Stand, Mysuru, Karnataka",
        toLat: 12.3052,
        toLng: 76.6552,
        departureTime: tomorrow,
        totalSeats: 3,
        availableSeats: 3,
        pricePerSeat: 450,
        description:
          "Leaving exactly at 8:30 AM. AC car, music friendly. One coffee stop on the way.",
        distanceKm: 145,
        durationMin: 180,
      },
      {
        driverId: driver.id,
        vehicleId: vehicle.id,
        fromCity: "Mumbai",
        fromAddress: "Andheri East, Mumbai",
        fromLat: 19.119,
        fromLng: 72.847,
        toCity: "Pune",
        toAddress: "Hinjewadi, Pune",
        toLat: 18.5912,
        toLng: 73.7389,
        departureTime: dayAfter,
        totalSeats: 3,
        availableSeats: 2,
        pricePerSeat: 380,
        distanceKm: 150,
        durationMin: 180,
      },
      {
        driverId: driver.id,
        vehicleId: vehicle.id,
        fromCity: "Delhi",
        fromAddress: "Connaught Place, Delhi",
        fromLat: 28.6315,
        fromLng: 77.2167,
        toCity: "Jaipur",
        toAddress: "MI Road, Jaipur",
        toLat: 26.9124,
        toLng: 75.8024,
        departureTime: new Date(tomorrow.getTime() + 6 * 60 * 60 * 1000),
        totalSeats: 4,
        availableSeats: 4,
        pricePerSeat: 650,
        distanceKm: 280,
        durationMin: 300,
      },
    ],
  });

  console.log("✓ Seeded:");
  console.log("  Admin:    admin@ridebuddy.in / password123");
  console.log("  Driver:   arjun@ridebuddy.in / password123");
  console.log("  Passenger:riya@ridebuddy.in / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
