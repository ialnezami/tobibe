import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/connect";
import HealthMetric from "@/lib/models/HealthMetric";

// GET a single health metric
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

    const metric = await HealthMetric.findOne({
      _id: id,
      patientId: session.user.id,
    })
      .populate("doctorId", "name")
      .lean();

    if (!metric) {
      return NextResponse.json({ error: "Health metric not found" }, { status: 404 });
    }

    return NextResponse.json({ metric });
  } catch (error: any) {
    console.error("Error fetching health metric:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT update a health metric
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
    const { value, unit, secondaryValue, notes, recordedDate } = body;

    const metric = await HealthMetric.findOne({
      _id: id,
      patientId: session.user.id,
    });

    if (!metric) {
      return NextResponse.json({ error: "Health metric not found" }, { status: 404 });
    }

    if (value !== undefined) metric.value = parseFloat(value);
    if (unit !== undefined) metric.unit = unit;
    if (secondaryValue !== undefined) metric.secondaryValue = secondaryValue ? parseFloat(secondaryValue) : undefined;
    if (notes !== undefined) metric.notes = notes;
    if (recordedDate !== undefined) metric.recordedDate = new Date(recordedDate);

    await metric.save();

    const updatedMetric = await HealthMetric.findById(metric._id)
      .populate("doctorId", "name")
      .lean();

    return NextResponse.json({
      metric: updatedMetric,
      message: "Health metric updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating health metric:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE a health metric
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

    const metric = await HealthMetric.findOneAndDelete({
      _id: id,
      patientId: session.user.id,
    });

    if (!metric) {
      return NextResponse.json({ error: "Health metric not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Health metric deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting health metric:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

