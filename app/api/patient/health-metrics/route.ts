import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/connect";
import HealthMetric from "@/lib/models/HealthMetric";

// GET all health metrics for the patient
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
    const metricType = searchParams.get("type");
    const limit = searchParams.get("limit");

    const query: any = { patientId: session.user.id };

    if (metricType) {
      query.metricType = metricType;
    }

    let queryBuilder = HealthMetric.find(query)
      .populate("doctorId", "name")
      .sort({ recordedDate: -1 });
    
    if (limit) {
      queryBuilder = queryBuilder.limit(parseInt(limit));
    }
    
    const metrics = await queryBuilder.lean();

    return NextResponse.json({ metrics });
  } catch (error: any) {
    console.error("Error fetching health metrics:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// POST create a new health metric
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
    const { metricType, value, unit, secondaryValue, notes, recordedDate, doctorId, bookingId } =
      body;

    if (!metricType || value === undefined || !unit) {
      return NextResponse.json(
        { error: "Metric type, value, and unit are required" },
        { status: 400 }
      );
    }

    const metric = new HealthMetric({
      patientId: session.user.id,
      metricType,
      value: parseFloat(value),
      unit,
      secondaryValue: secondaryValue ? parseFloat(secondaryValue) : undefined,
      notes: notes || undefined,
      recordedDate: recordedDate ? new Date(recordedDate) : new Date(),
      doctorId: doctorId || undefined,
      bookingId: bookingId || undefined,
    });

    await metric.save();

    const populatedMetric = await HealthMetric.findById(metric._id)
      .populate("doctorId", "name")
      .lean();

    return NextResponse.json(
      { metric: populatedMetric, message: "Health metric recorded successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating health metric:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

