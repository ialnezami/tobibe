import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/connect";
import Prescription from "@/lib/models/Prescription";

// POST request a refill (patient)
export async function POST(
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
    const { notes } = body;

    const prescription = await Prescription.findOne({
      _id: id,
      patientId: session.user.id,
    });

    if (!prescription) {
      return NextResponse.json({ error: "Prescription not found" }, { status: 404 });
    }

    if (!prescription.isActive) {
      return NextResponse.json(
        { error: "This prescription is no longer active" },
        { status: 400 }
      );
    }

    // Add refill request
    prescription.refillRequests.push({
      requestedAt: new Date(),
      status: "pending",
      notes: notes || "",
    });

    await prescription.save();

    const updatedPrescription = await Prescription.findById(prescription._id)
      .populate("doctorId", "name email phone")
      .populate("patientId", "name email phone")
      .lean();

    return NextResponse.json({
      prescription: updatedPrescription,
      message: "Refill request submitted successfully",
    });
  } catch (error: any) {
    console.error("Error requesting refill:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT respond to refill request (doctor)
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
    const { refillRequestId, status, notes } = body;

    if (!refillRequestId || !status) {
      return NextResponse.json(
        { error: "Refill request ID and status are required" },
        { status: 400 }
      );
    }

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be 'approved' or 'rejected'" },
        { status: 400 }
      );
    }

    const prescription = await Prescription.findOne({
      _id: id,
      doctorId: session.user.id,
    });

    if (!prescription) {
      return NextResponse.json({ error: "Prescription not found" }, { status: 404 });
    }

    const refillRequest = prescription.refillRequests.id(refillRequestId);
    if (!refillRequest) {
      return NextResponse.json({ error: "Refill request not found" }, { status: 404 });
    }

    if (refillRequest.status !== "pending") {
      return NextResponse.json(
        { error: "This refill request has already been processed" },
        { status: 400 }
      );
    }

    refillRequest.status = status;
    refillRequest.notes = notes || refillRequest.notes;
    refillRequest.respondedAt = new Date();

    await prescription.save();

    const updatedPrescription = await Prescription.findById(prescription._id)
      .populate("doctorId", "name email phone")
      .populate("patientId", "name email phone")
      .lean();

    return NextResponse.json({
      prescription: updatedPrescription,
      message: `Refill request ${status} successfully`,
    });
  } catch (error: any) {
    console.error("Error responding to refill request:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}


