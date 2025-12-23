import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/connect";
import Booking from "@/lib/models/Booking";
import FavoriteDoctor from "@/lib/models/FavoriteDoctor";

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

    // Get current date/time for proper comparison
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const currentTimeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    // Get patient statistics
    const [
      totalBookings,
      allBookings,
      favoriteDoctorsCount,
      recentBookings,
    ] = await Promise.all([
      Booking.countDocuments({ customerId: userId }),
      // Get all bookings to calculate upcoming/past more accurately
      Booking.find({ customerId: userId })
        .populate("doctorId", "name email phone location")
        .sort({ date: 1, startTime: 1 })
        .lean(),
      // Count from FavoriteDoctor model
      FavoriteDoctor.countDocuments({ patientId: userId }),
      Booking.find({ customerId: userId })
        .populate("doctorId", "name")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    // Calculate upcoming and past bookings from the fetched data
    let upcomingBookings = 0;
    let pastBookings = 0;
    let nextAppointment: any = null;

    allBookings.forEach((booking: any) => {
      // Handle date - it might be a Date object or ISO string
      const bookingDate = booking.date instanceof Date 
        ? booking.date 
        : new Date(booking.date);
      
      const bookingDateOnly = new Date(
        bookingDate.getFullYear(),
        bookingDate.getMonth(),
        bookingDate.getDate()
      );
      
      const isToday = bookingDateOnly.getTime() === today.getTime();
      const isFuture = bookingDateOnly > today;
      const isPast = bookingDateOnly < today;
      const isCompletedOrCancelled = 
        booking.status === "completed" || booking.status === "cancelled";

      // Check if booking is upcoming
      const isUpcoming = 
        !isCompletedOrCancelled &&
        (isFuture || (isToday && booking.startTime >= currentTimeStr));

      if (isUpcoming) {
        upcomingBookings++;
        // Find the next appointment (earliest upcoming)
        if (
          !nextAppointment ||
          bookingDateOnly < new Date(nextAppointment.date) ||
          (bookingDateOnly.getTime() === new Date(nextAppointment.date).getTime() &&
            booking.startTime < nextAppointment.startTime)
        ) {
          nextAppointment = booking;
        }
      } else {
        pastBookings++;
      }
    });

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


