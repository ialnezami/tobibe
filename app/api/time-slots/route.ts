import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/connect";
import TimeSlot from "@/lib/models/TimeSlot";

// GET time slots for a barber
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const barberId = searchParams.get("barberId");
    const date = searchParams.get("date");

    if (!barberId || !date) {
      return NextResponse.json(
        { error: "Barber ID and date are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const dateObj = new Date(date);
    const startOfDay = new Date(dateObj);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dateObj);
    endOfDay.setHours(23, 59, 59, 999);

    const slots = await TimeSlot.find({
      barberId,
      date: { $gte: startOfDay, $lte: endOfDay },
    }).sort({ startTime: 1 });

    return NextResponse.json({ slots }, { status: 200 });
  } catch (error: any) {
    console.error("Time slots fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// CREATE/UPDATE time slot (for blocking slots)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "barber") {
      return NextResponse.json(
        { error: "Only barbers can manage time slots" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { barberId, date, startTime, endTime, isBlocked } = body;

    if (!barberId || !date || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Barber ID, date, start time, and end time are required" },
        { status: 400 }
      );
    }

    // Verify barber can only manage their own slots
    if (barberId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only manage your own time slots" },
        { status: 403 }
      );
    }

    await connectDB();

    const dateObj = new Date(date);

    // Find or create time slot
    let timeSlot = await TimeSlot.findOne({
      barberId,
      date: dateObj,
      startTime,
      endTime,
    });

    if (timeSlot) {
      timeSlot.isBlocked = isBlocked !== undefined ? isBlocked : false;
      timeSlot.isAvailable = !timeSlot.isBlocked && !timeSlot.bookingId;
    } else {
      timeSlot = new TimeSlot({
        barberId,
        date: dateObj,
        startTime,
        endTime,
        isBlocked: isBlocked !== undefined ? isBlocked : false,
        isAvailable: !isBlocked,
      });
    }

    await timeSlot.save();

    return NextResponse.json(
      { message: "Time slot updated successfully", timeSlot },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Time slot creation/update error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

