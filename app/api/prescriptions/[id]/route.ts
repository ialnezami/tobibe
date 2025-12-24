import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/connect";
import Prescription from "@/lib/models/Prescription";

// GET a single prescription
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const prescription = await Prescription.findById(id)
      .populate("doctorId", "name email phone")
      .populate("patientId", "name email phone")
      .populate("bookingId", "date startTime endTime")
      .lean();

    if (!prescription) {
      return NextResponse.json({ error: "Prescription not found" }, { status: 404 });
    }

    // Verify access
    const isOwner =
      prescription.patientId.toString() === session.user.id ||
      prescription.doctorId.toString() === session.user.id ||
      session.user.role === "admin";

    if (!isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ prescription });
  } catch (error: any) {
    console.error("Error fetching prescription:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT update prescription (doctor only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "doctor") {
      return NextResponse.json(
        { error: "Forbidden: Doctor access required" },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { medications, diagnosis, notes, expiryDate, isActive } = body;

    const prescription = await Prescription.findOne({
      _id: id,
      doctorId: session.user.id,
    });

    if (!prescription) {
      return NextResponse.json({ error: "Prescription not found" }, { status: 404 });
    }

    if (medications !== undefined) prescription.medications = medications;
    if (diagnosis !== undefined) prescription.diagnosis = diagnosis;
    if (notes !== undefined) prescription.notes = notes;
    if (expiryDate !== undefined) prescription.expiryDate = new Date(expiryDate);
    if (isActive !== undefined) prescription.isActive = isActive;

    await prescription.save();

    const updatedPrescription = await Prescription.findById(prescription._id)
      .populate("doctorId", "name email phone")
      .populate("patientId", "name email phone")
      .populate("bookingId", "date startTime endTime")
      .lean();

    return NextResponse.json({
      prescription: updatedPrescription,
      message: "Prescription updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating prescription:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}


