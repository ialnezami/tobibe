import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/connect";
import Service from "@/lib/models/Service";

// GET all services for a doctor
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const searchParams = request.nextUrl.searchParams;
    const doctorId = searchParams.get("doctorId");

    await connectDB();

    const query: any = {};
    if (doctorId) {
      query.doctorId = doctorId;
    } else if (session?.user?.role === "doctor") {
      query.doctorId = session.user.id;
    } else {
      return NextResponse.json(
        { error: "Doctor ID is required" },
        { status: 400 }
      );
    }

    const services = await Service.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ services }, { status: 200 });
  } catch (error: any) {
    console.error("Services fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// CREATE a new service
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "doctor") {
      return NextResponse.json(
        { error: "Only doctors can create services" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, price, duration, isActive } = body;

    if (!name || price === undefined || duration === undefined) {
      return NextResponse.json(
        { error: "Name, price, and duration are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const service = new Service({
      doctorId: session.user.id,
      name,
      description,
      price,
      duration: duration || 10, // default 10 minutes
      isActive: isActive !== undefined ? isActive : true,
    });

    await service.save();

    return NextResponse.json(
      { message: "Service created successfully", service },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Service creation error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}


