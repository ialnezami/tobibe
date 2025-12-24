import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/connect";
import User from "@/lib/models/User";
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

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const role = searchParams.get("role");

    // Build match query
    const matchQuery: any = {};
    if (startDate && endDate) {
      matchQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    if (role) {
      matchQuery.role = role;
    }

    // User registrations by date
    const registrationsByDate = await User.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
          customers: {
            $sum: { $cond: [{ $eq: ["$role", "customer"] }, 1, 0] },
          },
          doctors: {
            $sum: { $cond: [{ $eq: ["$role", "doctor"] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // User registrations by role
    const registrationsByRole = await User.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]);

    // User activity (users with bookings)
    const activeUsers = await Booking.aggregate([
      {
        $group: {
          _id: "$customerId",
          bookingCount: { $sum: 1 },
          lastBooking: { $max: "$createdAt" },
          firstBooking: { $min: "$createdAt" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          userId: "$_id",
          userName: "$user.name",
          userEmail: "$user.email",
          userRole: "$user.role",
          bookingCount: 1,
          lastBooking: 1,
          firstBooking: 1,
        },
      },
      { $sort: { bookingCount: -1 } },
      { $limit: 50 },
    ]);

    // Retention analysis (users who booked multiple times)
    const retentionData = await Booking.aggregate([
      {
        $group: {
          _id: "$customerId",
          bookingCount: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$bookingCount",
          userCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Summary statistics
    const summary = await User.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          totalCustomers: {
            $sum: { $cond: [{ $eq: ["$role", "customer"] }, 1, 0] },
          },
          totalDoctors: {
            $sum: { $cond: [{ $eq: ["$role", "doctor"] }, 1, 0] },
          },
          totalAdmins: {
            $sum: { $cond: [{ $eq: ["$role", "admin"] }, 1, 0] },
          },
        },
      },
    ]);

    // Calculate active users (users with at least one booking)
    const activeUsersCount = await Booking.distinct("customerId").then(
      (ids) => ids.length
    );

    return NextResponse.json({
      summary: {
        ...(summary[0] || {
          totalUsers: 0,
          totalCustomers: 0,
          totalDoctors: 0,
          totalAdmins: 0,
        }),
        activeUsers: activeUsersCount,
      },
      registrationsByDate,
      registrationsByRole,
      activeUsers,
      retentionData,
    });
  } catch (error: any) {
    console.error("Error generating user report:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}


