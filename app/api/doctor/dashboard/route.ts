import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/connect";
import Booking from "@/lib/models/Booking";
import Service from "@/lib/models/Service";
import User from "@/lib/models/User";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "doctor") {
      return NextResponse.json(
        { error: "Forbidden: Doctor access required" },
        { status: 403 }
      );
    }

    await connectDB();

    const doctorId = session.user.id;

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get statistics
    const [
      totalBookings,
      upcomingBookings,
      completedBookings,
      todayAppointments,
      totalRevenue,
      pendingPayments,
      totalPatients,
      activeServices,
      recentBookings,
    ] = await Promise.all([
      Booking.countDocuments({ doctorId }),
      Booking.countDocuments({
        doctorId,
        status: { $in: ["pending", "confirmed"] },
        date: { $gte: new Date() },
      }),
      Booking.countDocuments({
        doctorId,
        status: "completed",
      }),
      Booking.find({
        doctorId,
        date: { $gte: today, $lt: tomorrow },
        status: { $in: ["pending", "confirmed"] },
      })
        .populate("customerId", "name email phone")
        .sort({ startTime: 1 })
        .lean(),
      Booking.aggregate([
        {
          $match: {
            doctorId: doctorId as any,
            "payment.status": "paid",
            "payment.amount": { $exists: true },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$payment.amount" },
          },
        },
      ]),
      Booking.aggregate([
        {
          $match: {
            doctorId: doctorId as any,
            "payment.status": "pending",
            "payment.amount": { $exists: true },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$payment.amount" },
          },
        },
      ]),
      Booking.distinct("customerId", { doctorId }).then((ids) => ids.length),
      Service.countDocuments({ doctorId, isActive: true }),
      Booking.find({ doctorId })
        .populate("customerId", "name email")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const revenue = totalRevenue[0]?.total || 0;
    const pending = pendingPayments[0]?.total || 0;
    const averageAppointmentValue = completedBookings > 0 
      ? revenue / completedBookings 
      : 0;

    return NextResponse.json({
      stats: {
        totalBookings,
        upcomingBookings,
        completedBookings,
        totalRevenue: revenue,
        pendingPayments: pending,
        totalPatients,
        activeServices,
        averageAppointmentValue,
      },
      todayAppointments,
      recentBookings,
    });
  } catch (error: any) {
    console.error("Error fetching doctor dashboard:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}


