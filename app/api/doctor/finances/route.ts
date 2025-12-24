import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/connect";
import Booking from "@/lib/models/Booking";

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
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "all";

    // Calculate date range based on period
    let startDate: Date | null = null;
    const endDate = new Date();

    if (period === "today") {
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
    } else if (period === "week") {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === "month") {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === "year") {
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    const matchQuery: any = {
      doctorId,
      "payment.amount": { $exists: true },
    };

    if (startDate) {
      matchQuery.createdAt = { $gte: startDate, $lte: endDate };
    }

    const [totalRevenue, paidRevenue, pendingRevenue, paymentMethods, recentPayments] =
      await Promise.all([
        Booking.aggregate([
          { $match: { ...matchQuery, "payment.status": "paid" } },
          { $group: { _id: null, total: { $sum: "$payment.amount" } } },
        ]),
        Booking.aggregate([
          { $match: { ...matchQuery, "payment.status": "paid" } },
          { $group: { _id: null, total: { $sum: "$payment.amount" } } },
        ]),
        Booking.aggregate([
          { $match: { ...matchQuery, "payment.status": "pending" } },
          { $group: { _id: null, total: { $sum: "$payment.amount" } } },
        ]),
        Booking.aggregate([
          { $match: { ...matchQuery, "payment.status": "paid" } },
          {
            $group: {
              _id: "$payment.method",
              total: { $sum: "$payment.amount" },
              count: { $sum: 1 },
            },
          },
        ]),
        Booking.find({
          doctorId,
          "payment.status": "paid",
          "payment.amount": { $exists: true },
        })
          .populate("customerId", "name")
          .sort({ "payment.paidAt": -1, createdAt: -1 })
          .limit(10)
          .lean(),
      ]);

    return NextResponse.json({
      totalRevenue: totalRevenue[0]?.total || 0,
      paidRevenue: paidRevenue[0]?.total || 0,
      pendingRevenue: pendingRevenue[0]?.total || 0,
      paymentMethods,
      recentPayments,
    });
  } catch (error: any) {
    console.error("Error fetching finances:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}



