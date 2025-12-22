import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/connect";
import Booking from "@/lib/models/Booking";
import TimeSlot from "@/lib/models/TimeSlot";
import Service from "@/lib/models/Service";
import User from "@/lib/models/User";
import { calculateBookingDuration, hasTimeSlotConflict } from "@/lib/utils/timeSlots";
import { generateBookingCalendarEvent } from "@/lib/utils/calendar";
import { sendCalendarInvite } from "@/lib/utils/email";

// GET all bookings (filtered by user role)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const doctorId = searchParams.get("doctorId");
    const customerId = searchParams.get("customerId");
    const status = searchParams.get("status");
    const date = searchParams.get("date");

    const query: any = {};

    if (session.user.role === "doctor") {
      query.doctorId = session.user.id;
    } else {
      query.customerId = session.user.id;
    }

    if (doctorId) query.doctorId = doctorId;
    if (customerId) query.customerId = customerId;
    if (status) query.status = status;
    if (date) {
      const dateObj = new Date(date);
      const startOfDay = new Date(dateObj);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(dateObj);
      endOfDay.setHours(23, 59, 59, 999);
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const bookings = await Booking.find(query)
      .populate("customerId", "name email phone")
      .populate("doctorId", "name email phone")
      .populate("serviceIds", "name price duration")
      .sort({ date: 1, startTime: 1 });

    return NextResponse.json({ bookings }, { status: 200 });
  } catch (error: any) {
    console.error("Bookings fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// CREATE a new booking
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      customerId,
      doctorId,
      serviceIds,
      date,
      startTime,
      source = "self-service",
    } = body;

    if (!doctorId || !serviceIds || !date || !startTime) {
      return NextResponse.json(
        { error: "Doctor ID, services, date, and start time are required" },
        { status: 400 }
      );
    }

    // Determine customer ID based on user role
    let finalCustomerId = customerId;
    if (session.user.role === "customer") {
      finalCustomerId = session.user.id;
    } else if (session.user.role === "doctor") {
      // Doctor-assisted booking
      if (!customerId) {
        return NextResponse.json(
          { error: "Customer ID is required for doctor-assisted bookings" },
          { status: 400 }
        );
      }
      // Verify doctor can only book for their own calendar
      if (doctorId !== session.user.id) {
        return NextResponse.json(
          { error: "Doctors can only create bookings for their own calendar" },
          { status: 403 }
        );
      }
    }

    await connectDB();

    // Fetch services to calculate total duration and price
    const services = await Service.find({ _id: { $in: serviceIds } });
    if (services.length !== serviceIds.length) {
      return NextResponse.json(
        { error: "One or more services not found" },
        { status: 400 }
      );
    }

    const totalDuration = calculateBookingDuration(
      services.map((s) => s.duration)
    );
    const totalPrice = services.reduce((sum, service) => sum + service.price, 0);

    // Calculate end time
    const [startHour, startMin] = startTime.split(":").map(Number);
    const endTimeMinutes = startHour * 60 + startMin + totalDuration;
    const endHour = Math.floor(endTimeMinutes / 60);
    const endMin = endTimeMinutes % 60;
    const endTime = `${endHour.toString().padStart(2, "0")}:${endMin.toString().padStart(2, "0")}`;

    // Check for conflicts
    const bookingDate = new Date(date);
    const startOfDay = new Date(bookingDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(bookingDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingSlots = await TimeSlot.find({
      doctorId,
      date: { $gte: startOfDay, $lte: endOfDay },
      $or: [{ isBlocked: true }, { isAvailable: false }],
    });

    if (hasTimeSlotConflict(startTime, endTime, existingSlots)) {
      return NextResponse.json(
        { error: "Time slot is not available" },
        { status: 400 }
      );
    }

    // Create booking with payment info
    const booking = new Booking({
      customerId: finalCustomerId,
      doctorId,
      serviceIds,
      date: bookingDate,
      startTime,
      endTime,
      status: "pending",
      source: session.user.role === "doctor" ? "doctor-assisted" : "self-service",
      payment: {
        amount: totalPrice,
        method: "pending",
        status: "pending",
      },
    });

    await booking.save();

    // Create/update time slots
    const timeSlot = new TimeSlot({
      doctorId,
      date: bookingDate,
      startTime,
      endTime,
      isAvailable: false,
      isBlocked: false,
      bookingId: booking._id,
    });

    await timeSlot.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate("customerId", "name email phone")
      .populate("doctorId", "name email phone")
      .populate("serviceIds", "name price duration");

    // Send calendar invitations via email
    try {
      const doctor = populatedBooking.doctorId as any;
      const customer = populatedBooking.customerId as any;
      const services = populatedBooking.serviceIds as any[];

      if (doctor?.email && customer?.email) {
        const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || "http://localhost:3000";
        const calendarContent = generateBookingCalendarEvent(
          populatedBooking,
          {
            name: doctor.name,
            email: doctor.email,
            phone: doctor.phone,
          },
          {
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
          },
          services.map((s) => ({
            name: s.name,
            price: s.price,
            duration: s.duration,
          })),
          baseUrl
        );

        if (calendarContent) {
          const servicesList = services.map((s: any) => s.name);
          const timeRange = `${populatedBooking.startTime} - ${populatedBooking.endTime}`;

          // Send to both doctor and customer
          await sendCalendarInvite(
            [doctor.email, customer.email],
            calendarContent,
            {
              doctorName: doctor.name,
              customerName: customer.name,
              date: populatedBooking.date,
              time: timeRange,
              services: servicesList,
            }
          );
        }
      }
    } catch (emailError) {
      // Log error but don't fail the booking creation
      console.error("Error sending calendar invites:", emailError);
    }

    return NextResponse.json(
      { message: "Booking created successfully", booking: populatedBooking },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Booking creation error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

