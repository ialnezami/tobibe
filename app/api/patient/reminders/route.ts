import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/connect";
import Reminder from "@/lib/models/Reminder";

// GET all reminders for the patient
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

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter"); // "active", "completed", "all"

    const query: any = { patientId: session.user.id };

    if (filter === "active") {
      query.isActive = true;
      query.isCompleted = false;
    } else if (filter === "completed") {
      query.isCompleted = true;
    }

    const reminders = await Reminder.find(query)
      .populate("bookingId", "date startTime endTime doctorId")
      .sort({ reminderDate: 1, reminderTime: 1 })
      .lean();

    return NextResponse.json({ reminders });
  } catch (error: any) {
    console.error("Error fetching reminders:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// POST create a new reminder
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "customer") {
      return NextResponse.json(
        { error: "Forbidden: Patient access required" },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();
    const {
      type,
      title,
      description,
      reminderDate,
      reminderTime,
      bookingId,
      medicationName,
      dosage,
      frequency,
      isRecurring,
      recurringInterval,
    } = body;

    // Validation
    if (!type || !title || !reminderDate || !reminderTime) {
      return NextResponse.json(
        { error: "Type, title, date, and time are required" },
        { status: 400 }
      );
    }

    if (type === "appointment" && !bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required for appointment reminders" },
        { status: 400 }
      );
    }

    if (type === "medication" && !medicationName) {
      return NextResponse.json(
        { error: "Medication name is required for medication reminders" },
        { status: 400 }
      );
    }

    const reminder = new Reminder({
      patientId: session.user.id,
      type,
      title,
      description,
      reminderDate: new Date(reminderDate),
      reminderTime,
      bookingId: bookingId || undefined,
      medicationName: medicationName || undefined,
      dosage: dosage || undefined,
      frequency: frequency || undefined,
      isRecurring: isRecurring || false,
      recurringInterval: recurringInterval || undefined,
    });

    await reminder.save();

    const populatedReminder = await Reminder.findById(reminder._id)
      .populate("bookingId", "date startTime endTime doctorId")
      .lean();

    return NextResponse.json(
      { reminder: populatedReminder, message: "Reminder created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating reminder:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}


