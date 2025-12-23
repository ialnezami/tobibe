import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/connect";
import Booking from "@/lib/models/Booking";
import Doctor from "@/lib/models/Doctor";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "customer") {
      return NextResponse.json(
        { error: "Forbidden: Patient access required" },
        { status: 403 }
      );
    }

    await connectDB();

    const userId = session.user.id;

    // Get patient statistics
    const [
      totalBookings,
      upcomingBookings,
      pastBookings,
      favoriteDoctorsCount,
      nextAppointment,
      recentBookings,
    ] = await Promise.all([
      Booking.countDocuments({ customerId: userId }),
      Booking.countDocuments({
        customerId: userId,
        status: { $in: ["pending", "confirmed"] },
        date: { $gte: new Date() },
      }),
      Booking.countDocuments({
        customerId: userId,
        date: { $lt: new Date() },
      }),
      // For now, we'll count unique doctors the patient has booked with
      Booking.distinct("doctorId", { customerId: userId }).then((ids) => ids.length),
      Booking.findOne({
        customerId: userId,
        status: { $in: ["pending", "confirmed"] },
        date: { $gte: new Date() },
      })
        .populate("doctorId", "name email phone location")
        .sort({ date: 1, startTime: 1 })
        .lean(),
      Booking.find({ customerId: userId })
        .populate("doctorId", "name")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    return NextResponse.json({
      stats: {
        totalBookings,
        upcomingBookings,
        pastBookings,
        favoriteDoctorsCount,
      },
      nextAppointment,
      recentBookings,
    });
  } catch (error: any) {
    console.error("Error fetching patient dashboard:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}


