import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/connect";
import User from "@/lib/models/User";
import Doctor from "@/lib/models/Doctor";
import Booking from "@/lib/models/Booking";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    await connectDB();

    // Get statistics
    const [
      totalUsers,
      totalDoctors,
      totalCustomers,
      totalBookings,
      activeBookings,
      totalRevenue,
      pendingPayments,
      recentUsers,
      recentBookings,
    ] = await Promise.all([
      User.countDocuments(),
      Doctor.countDocuments({ role: "doctor" }),
      User.countDocuments({ role: "customer" }),
      Booking.countDocuments(),
      Booking.countDocuments({
        status: { $in: ["pending", "confirmed"] },
        date: { $gte: new Date() },
      }),
      Booking.aggregate([
        {
          $match: {
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
      User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email role createdAt")
        .lean(),
      Booking.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("customerId", "name email")
        .populate("doctorId", "name")
        .lean(),
    ]);

    const revenue = totalRevenue[0]?.total || 0;
    const pending = pendingPayments[0]?.total || 0;

    return NextResponse.json({
      stats: {
        totalUsers,
        totalDoctors,
        totalCustomers,
        totalBookings,
        activeBookings,
        totalRevenue: revenue,
        pendingPayments: pending,
      },
      recentUsers,
      recentBookings,
    });
  } catch (error: any) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

