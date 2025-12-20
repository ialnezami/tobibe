import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Barber from "@/lib/models/Barber";
import TimeSlot from "@/lib/models/TimeSlot";
import { generateTimeSlots } from "@/lib/utils/timeSlots";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get("date");

    if (!dateParam) {
      return NextResponse.json(
        { error: "Date parameter is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const barber = await Barber.findById(id);

    if (!barber) {
      return NextResponse.json({ error: "Barber not found" }, { status: 404 });
    }

    const date = new Date(dateParam);
    const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();

    // Get working hours for the day
    const workingHours = barber.workingHours?.get(dayOfWeek) || {
      open: "09:00",
      close: "17:00",
      isOpen: true,
    };

    // Generate available time slots for the day
    const generatedSlots = generateTimeSlots(date, workingHours);

    // Get existing time slots for the date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingSlots = await TimeSlot.find({
      barberId: id,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    // Merge generated slots with existing slots
    const availability = generatedSlots.map((slot) => {
      const existing = existingSlots.find(
        (es) => es.startTime === slot.startTime && es.endTime === slot.endTime
      );

      return {
        startTime: slot.startTime,
        endTime: slot.endTime,
        isAvailable: existing
          ? existing.isAvailable && !existing.isBlocked
          : true,
        isBlocked: existing ? existing.isBlocked : false,
        bookingId: existing?.bookingId || null,
      };
    });

    return NextResponse.json({ availability, workingHours }, { status: 200 });
  } catch (error: any) {
    console.error("Availability fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

