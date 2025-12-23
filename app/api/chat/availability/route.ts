import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/connect";
import Booking from "@/lib/models/Booking";

// Check if chat is available for a booking
// Available: 24 hours after appointment OR 1 hour before appointment
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const bookingId = searchParams.get("bookingId");

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
    }

    const booking = await Booking.findById(bookingId)
      .populate("customerId", "name email")
      .populate("doctorId", "name email");

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Check if user is part of this booking
    const isCustomer = booking.customerId._id.toString() === session.user.id;
    const isDoctor = booking.doctorId._id.toString() === session.user.id;

    if (!isCustomer && !isDoctor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Calculate appointment datetime
    const appointmentDate = new Date(booking.date);
    const [startHour, startMin] = booking.startTime.split(":").map(Number);
    appointmentDate.setHours(startHour, startMin, 0, 0);

    const now = new Date();

    // Check if chat is available:
    // 1. 24 hours after appointment (for follow-up questions)
    // 2. 1 hour before appointment (for last-minute questions)
    const oneHourBefore = new Date(appointmentDate);
    oneHourBefore.setHours(oneHourBefore.getHours() - 1);

    const twentyFourHoursAfter = new Date(appointmentDate);
    twentyFourHoursAfter.setHours(twentyFourHoursAfter.getHours() + 24);

    const isAvailable =
      (now >= oneHourBefore && now <= appointmentDate) || // 1 hour before to appointment time
      (now >= appointmentDate && now <= twentyFourHoursAfter); // Appointment time to 24 hours after

    return NextResponse.json(
      {
        isAvailable,
        appointmentDate: appointmentDate.toISOString(),
        oneHourBefore: oneHourBefore.toISOString(),
        twentyFourHoursAfter: twentyFourHoursAfter.toISOString(),
        now: now.toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error checking chat availability:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}

