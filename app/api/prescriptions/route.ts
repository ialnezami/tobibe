import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/connect";
import Prescription from "@/lib/models/Prescription";

// GET all prescriptions (filtered by role)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter"); // "active", "all"

    const query: any = {};

    if (session.user.role === "customer") {
      query.patientId = session.user.id;
    } else if (session.user.role === "doctor") {
      query.doctorId = session.user.id;
    } else if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (filter === "active") {
      query.isActive = true;
    }

    const prescriptions = await Prescription.find(query)
      .populate("doctorId", "name email phone")
      .populate("patientId", "name email phone")
      .populate("bookingId", "date startTime endTime")
      .sort({ prescribedDate: -1 })
      .lean();

    return NextResponse.json({ prescriptions });
  } catch (error: any) {
    console.error("Error fetching prescriptions:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// POST create a new prescription (doctor only)
export async function POST(request: NextRequest) {
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
    const { patientId, bookingId, medications, diagnosis, notes, expiryDate } = body;

    if (!patientId || !medications || medications.length === 0) {
      return NextResponse.json(
        { error: "Patient ID and at least one medication are required" },
        { status: 400 }
      );
    }

    const prescription = new Prescription({
      doctorId: session.user.id,
      patientId,
      bookingId: bookingId || undefined,
      medications,
      diagnosis: diagnosis || undefined,
      notes: notes || undefined,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
    });

    await prescription.save();

    const populatedPrescription = await Prescription.findById(prescription._id)
      .populate("doctorId", "name email phone")
      .populate("patientId", "name email phone")
      .populate("bookingId", "date startTime endTime")
      .lean();

    return NextResponse.json(
      { prescription: populatedPrescription, message: "Prescription created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating prescription:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

