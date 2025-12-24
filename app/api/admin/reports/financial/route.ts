import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/connect";
import Booking from "@/lib/models/Booking";
import Doctor from "@/lib/models/Doctor";

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
    const doctorId = searchParams.get("doctorId");
    const paymentMethod = searchParams.get("paymentMethod");

    // Build match query
    const matchQuery: any = {
      "payment.amount": { $exists: true },
    };

    if (startDate && endDate) {
      matchQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (doctorId) {
      matchQuery.doctorId = doctorId;
    }

    if (paymentMethod) {
      matchQuery["payment.method"] = paymentMethod;
    }

    // Revenue by date range
    const revenueByDate = await Booking.aggregate([
      { $match: { ...matchQuery, "payment.status": "paid" } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          revenue: { $sum: "$payment.amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Revenue by doctor
    const revenueByDoctor = await Booking.aggregate([
      { $match: { ...matchQuery, "payment.status": "paid" } },
      {
        $group: {
          _id: "$doctorId",
          revenue: { $sum: "$payment.amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 20 },
    ]);

    // Populate doctor names
    const doctorIds = revenueByDoctor.map((r) => r._id);
    const doctors = await Doctor.find({ _id: { $in: doctorIds } })
      .select("name email")
      .lean();
    const doctorMap = new Map(doctors.map((d: any) => [d._id.toString(), d]));

    const revenueByDoctorWithNames = revenueByDoctor.map((r) => ({
      doctorId: r._id,
      doctorName: doctorMap.get(r._id.toString())?.name || "Unknown",
      doctorEmail: doctorMap.get(r._id.toString())?.email || "",
      revenue: r.revenue,
      count: r.count,
    }));

    // Revenue by payment method
    const revenueByPaymentMethod = await Booking.aggregate([
      { $match: { ...matchQuery, "payment.status": "paid" } },
      {
        $group: {
          _id: "$payment.method",
          revenue: { $sum: "$payment.amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    // Summary statistics
    const summary = await Booking.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: {
              $cond: [
                { $eq: ["$payment.status", "paid"] },
                "$payment.amount",
                0,
              ],
            },
          },
          pendingRevenue: {
            $sum: {
              $cond: [
                { $eq: ["$payment.status", "pending"] },
                "$payment.amount",
                0,
              ],
            },
          },
          totalBookings: { $sum: 1 },
          paidBookings: {
            $sum: { $cond: [{ $eq: ["$payment.status", "paid"] }, 1, 0] },
          },
          averageRevenue: {
            $avg: {
              $cond: [
                { $eq: ["$payment.status", "paid"] },
                "$payment.amount",
                null,
              ],
            },
          },
        },
      },
    ]);

    return NextResponse.json({
      summary: summary[0] || {
        totalRevenue: 0,
        pendingRevenue: 0,
        totalBookings: 0,
        paidBookings: 0,
        averageRevenue: 0,
      },
      revenueByDate,
      revenueByDoctor: revenueByDoctorWithNames,
      revenueByPaymentMethod,
    });
  } catch (error: any) {
    console.error("Error generating financial report:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}


