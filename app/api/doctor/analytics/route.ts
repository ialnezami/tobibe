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
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "month"; // week, month, year, all

    // Calculate date range
    let startDate: Date | null = null;
    const endDate = new Date();

    if (period === "week") {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === "month") {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === "year") {
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    const matchQuery: any = { doctorId };
    if (startDate) {
      matchQuery.createdAt = { $gte: startDate, $lte: endDate };
    }

    // Booking Analytics
    const [
      totalBookings,
      completedBookings,
      cancelledBookings,
      bookingsOverTime,
      peakHours,
      popularServices,
      cancellationRate,
    ] = await Promise.all([
      Booking.countDocuments(matchQuery),
      Booking.countDocuments({ ...matchQuery, status: "completed" }),
      Booking.countDocuments({ ...matchQuery, status: "cancelled" }),
      // Bookings over time (daily breakdown)
      Booking.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      // Peak booking hours
      Booking.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: { $substr: ["$startTime", 0, 2] },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
      // Popular services
      Booking.aggregate([
        { $match: matchQuery },
        { $unwind: "$serviceIds" },
        {
          $group: {
            _id: "$serviceIds",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      // Calculate cancellation rate
      Booking.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    // Patient Analytics
    const [
      totalPatients,
      newPatients,
      returningPatients,
      patientRetention,
      averageVisitsPerPatient,
    ] = await Promise.all([
      Booking.distinct("customerId", matchQuery).then((ids) => ids.length),
      // New patients (first booking in period)
      Booking.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: "$customerId",
            firstBooking: { $min: "$createdAt" },
          },
        },
        {
          $match: {
            firstBooking: startDate ? { $gte: startDate } : { $exists: true },
          },
        },
      ]).then((result) => result.length),
      // Returning patients
      Booking.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: "$customerId",
            bookingCount: { $sum: 1 },
          },
        },
        {
          $match: {
            bookingCount: { $gt: 1 },
          },
        },
      ]).then((result) => result.length),
      // Patient retention (simplified)
      Booking.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: "$customerId",
            bookingCount: { $sum: 1 },
            lastVisit: { $max: "$date" },
          },
        },
      ]),
      // Average visits per patient
      Booking.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: "$customerId",
            visitCount: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: null,
            avgVisits: { $avg: "$visitCount" },
          },
        },
      ]),
    ]);

    // Calculate cancellation rate
    const statusCounts: { [key: string]: number } = {};
    cancellationRate.forEach((item: any) => {
      statusCounts[item._id] = item.count;
    });
    const total = statusCounts.completed + statusCounts.cancelled + (statusCounts.pending || 0) + (statusCounts.confirmed || 0);
    const cancellationRateValue = total > 0 ? ((statusCounts.cancelled || 0) / total) * 100 : 0;

    // Performance Metrics
    const [
      completionRate,
      averageAppointmentValue,
      revenueTrends,
    ] = await Promise.all([
      // Completion rate
      Booking.aggregate([
        { $match: { ...matchQuery, status: "completed" } },
        { $count: "completed" },
      ]),
      // Average appointment value
      Booking.aggregate([
        {
          $match: {
            ...matchQuery,
            "payment.status": "paid",
            "payment.amount": { $exists: true },
          },
        },
        {
          $group: {
            _id: null,
            avgValue: { $avg: "$payment.amount" },
            totalRevenue: { $sum: "$payment.amount" },
          },
        },
      ]),
      // Revenue trends (daily)
      Booking.aggregate([
        {
          $match: {
            ...matchQuery,
            "payment.status": "paid",
            "payment.amount": { $exists: true },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$payment.paidAt" } },
            revenue: { $sum: "$payment.amount" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Populate service names for popular services
    const popularServicesWithNames = await Promise.all(
      popularServices.map(async (item: any) => {
        const service = await Service.findById(item._id).lean();
        return {
          serviceId: item._id,
          serviceName: service?.name || "Unknown Service",
          count: item.count,
        };
      })
    );

    return NextResponse.json({
      period: {
        start: startDate?.toISOString() || null,
        end: endDate.toISOString(),
        period,
      },
      bookingAnalytics: {
        totalBookings,
        completedBookings,
        cancelledBookings,
        cancellationRate: cancellationRateValue,
        bookingsOverTime,
        peakHours,
        popularServices: popularServicesWithNames,
      },
      patientAnalytics: {
        totalPatients,
        newPatients,
        returningPatients,
        patientRetention: patientRetention.length,
        averageVisitsPerPatient: averageVisitsPerPatient[0]?.avgVisits || 0,
      },
      performanceMetrics: {
        completionRate: totalBookings > 0
          ? ((completionRate[0]?.completed || completedBookings) / totalBookings) * 100
          : 0,
        averageAppointmentValue: averageAppointmentValue[0]?.avgValue || 0,
        totalRevenue: averageAppointmentValue[0]?.totalRevenue || 0,
        revenueTrends,
      },
    });
  } catch (error: any) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

