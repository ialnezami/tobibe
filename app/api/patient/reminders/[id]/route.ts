import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/connect";
import Reminder from "@/lib/models/Reminder";

// GET a single reminder
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "customer") {
      return NextResponse.json(
        { error: "Forbidden: Patient access required" },
        { status: 403 }
      );
    }

    await connectDB();

    const reminder = await Reminder.findOne({
      _id: id,
      patientId: session.user.id,
    })
      .populate("bookingId", "date startTime endTime doctorId")
      .lean();

    if (!reminder) {
      return NextResponse.json({ error: "Reminder not found" }, { status: 404 });
    }

    return NextResponse.json({ reminder });
  } catch (error: any) {
    console.error("Error fetching reminder:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT update a reminder
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      title,
      description,
      reminderDate,
      reminderTime,
      medicationName,
      dosage,
      frequency,
      isActive,
      isCompleted,
    } = body;

    const reminder = await Reminder.findOne({
      _id: id,
      patientId: session.user.id,
    });

    if (!reminder) {
      return NextResponse.json({ error: "Reminder not found" }, { status: 404 });
    }

    if (title !== undefined) reminder.title = title;
    if (description !== undefined) reminder.description = description;
    if (reminderDate !== undefined) reminder.reminderDate = new Date(reminderDate);
    if (reminderTime !== undefined) reminder.reminderTime = reminderTime;
    if (medicationName !== undefined) reminder.medicationName = medicationName;
    if (dosage !== undefined) reminder.dosage = dosage;
    if (frequency !== undefined) reminder.frequency = frequency;
    if (isActive !== undefined) reminder.isActive = isActive;
    if (isCompleted !== undefined) {
      reminder.isCompleted = isCompleted;
      if (isCompleted) {
        reminder.completedAt = new Date();
      } else {
        reminder.completedAt = undefined;
      }
    }

    await reminder.save();

    const updatedReminder = await Reminder.findById(reminder._id)
      .populate("bookingId", "date startTime endTime doctorId")
      .lean();

    return NextResponse.json({
      reminder: updatedReminder,
      message: "Reminder updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating reminder:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE a reminder
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "customer") {
      return NextResponse.json(
        { error: "Forbidden: Patient access required" },
        { status: 403 }
      );
    }

    await connectDB();

    const reminder = await Reminder.findOneAndDelete({
      _id: id,
      patientId: session.user.id,
    });

    if (!reminder) {
      return NextResponse.json({ error: "Reminder not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Reminder deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting reminder:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

