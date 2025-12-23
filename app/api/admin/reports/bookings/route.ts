import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/connect";
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

    // Build match query
    const matchQuery: any = {};
    if (startDate && endDate) {
      matchQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Booking trends by date
    const bookingsByDate = await Booking.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
          confirmed: {
            $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] },
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Peak hours analysis
    const peakHours = await Booking.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            $substr: ["$startTime", 0, 2], // Extract hour from "HH:MM"
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Bookings by day of week
    const bookingsByDayOfWeek = await Booking.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            $dayOfWeek: "$date",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Day names mapping
    const dayNames = [
      "",
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const bookingsByDayOfWeekWithNames = bookingsByDayOfWeek.map((item) => ({
      day: dayNames[item._id] || `Day ${item._id}`,
      dayNumber: item._id,
      count: item.count,
    }));

    // Cancellation analysis
    const cancellationAnalysis = await Booking.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Booking source analysis
    const bookingSource = await Booking.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$source",
          count: { $sum: 1 },
        },
      },
    ]);

    // Summary statistics
    const summary = await Booking.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          confirmed: {
            $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] },
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          cancellationRate: {
            $avg: {
              $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0],
            },
          },
        },
      },
    ]);

    const cancellationRate =
      summary[0]?.totalBookings > 0
        ? ((summary[0]?.cancelled || 0) / summary[0]?.totalBookings) * 100
        : 0;

    return NextResponse.json({
      summary: {
        ...(summary[0] || {
          totalBookings: 0,
          confirmed: 0,
          cancelled: 0,
          completed: 0,
          pending: 0,
        }),
        cancellationRate: Math.round(cancellationRate * 100) / 100,
      },
      bookingsByDate,
      peakHours,
      bookingsByDayOfWeek: bookingsByDayOfWeekWithNames,
      cancellationAnalysis,
      bookingSource,
    });
  } catch (error: any) {
    console.error("Error generating booking report:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

