import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/connect";
import Barber from "@/lib/models/Barber";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "barber") {
      return NextResponse.json(
        { error: "Only barbers can access this endpoint" },
        { status: 403 }
      );
    }

    await connectDB();

    const barber = await Barber.findById(session.user.id).select("-password");

    if (!barber) {
      return NextResponse.json({ error: "Barber not found" }, { status: 404 });
    }

    return NextResponse.json({ barber }, { status: 200 });
  } catch (error: any) {
    console.error("Barber profile fetch error:", error);
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

    if (session.user.role !== "barber") {
      return NextResponse.json(
        { error: "Only barbers can update their profile" },
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

    const barber = await Barber.findById(session.user.id);

    if (!barber) {
      return NextResponse.json({ error: "Barber not found" }, { status: 404 });
    }

    if (name) barber.name = name;
    if (phone) barber.phone = phone;
    if (address !== undefined) barber.address = address;
    if (location) barber.location = location;
    if (description !== undefined) barber.description = description;
    if (photos) barber.photos = photos;
    if (workingHours) barber.workingHours = workingHours;

    await barber.save();

    const barberResponse = barber.toObject();
    delete (barberResponse as any).password;

    return NextResponse.json(
      { message: "Barber profile updated successfully", barber: barberResponse },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Barber profile update error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

