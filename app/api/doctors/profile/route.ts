import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/connect";
import Doctor from "@/lib/models/Doctor";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "doctor") {
      return NextResponse.json(
        { error: "Only doctors can access this endpoint" },
        { status: 403 }
      );
    }

    await connectDB();

    const doctor = await Doctor.findById(session.user.id).select("-password");

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    return NextResponse.json({ doctor }, { status: 200 });
  } catch (error: any) {
    console.error("Doctor profile fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "doctor") {
      return NextResponse.json(
        { error: "Only doctors can update their profile" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      phone,
      address,
      location,
      description,
      photos,
      workingHours,
    } = body;

    await connectDB();

    const doctor = await Doctor.findById(session.user.id);

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    if (name) doctor.name = name;
    if (phone) doctor.phone = phone;
    if (address !== undefined) doctor.address = address;
    if (location) doctor.location = location;
    if (description !== undefined) doctor.description = description;
    if (photos) doctor.photos = photos;
    if (workingHours) doctor.workingHours = workingHours;

    await doctor.save();

    const doctorResponse = doctor.toObject();
    delete (doctorResponse as any).password;

    return NextResponse.json(
      { message: "Doctor profile updated successfully", doctor: doctorResponse },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Doctor profile update error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}


