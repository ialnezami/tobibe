import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/connect";
import Doctor from "@/lib/models/Doctor";
import TimeSlot from "@/lib/models/TimeSlot";

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

    const doctor = await Doctor.findById(session.user.id).select("workingHours").lean();

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    return NextResponse.json({
      workingHours: doctor.workingHours || {},
    });
  } catch (error: any) {
    console.error("Error fetching availability:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "doctor") {
      return NextResponse.json(
        { error: "Forbidden: Doctor access required" },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { workingHours } = body;

    if (!workingHours) {
      return NextResponse.json(
        { error: "Working hours are required" },
        { status: 400 }
      );
    }

    const doctor = await Doctor.findByIdAndUpdate(
      session.user.id,
      { workingHours: new Map(Object.entries(workingHours)) },
      { new: true }
    );

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    return NextResponse.json({
      doctor,
      message: "Working hours updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating availability:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

