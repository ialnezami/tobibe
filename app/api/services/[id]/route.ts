import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/connect";
import Service from "@/lib/models/Service";

// GET a single service
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const service = await Service.findById(params.id);

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json({ service }, { status: 200 });
  } catch (error: any) {
    console.error("Service fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// UPDATE a service
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "barber") {
      return NextResponse.json(
        { error: "Only barbers can update services" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, price, duration, isActive } = body;

    await connectDB();

    const service = await Service.findById(params.id);

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Verify the service belongs to the barber
    if (service.barberId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "You can only update your own services" },
        { status: 403 }
      );
    }

    if (name) service.name = name;
    if (description !== undefined) service.description = description;
    if (price !== undefined) service.price = price;
    if (duration !== undefined) service.duration = duration;
    if (isActive !== undefined) service.isActive = isActive;

    await service.save();

    return NextResponse.json(
      { message: "Service updated successfully", service },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Service update error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE a service
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "barber") {
      return NextResponse.json(
        { error: "Only barbers can delete services" },
        { status: 403 }
      );
    }

    await connectDB();

    const service = await Service.findById(params.id);

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Verify the service belongs to the barber
    if (service.barberId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "You can only delete your own services" },
        { status: 403 }
      );
    }

    await Service.findByIdAndDelete(params.id);

    return NextResponse.json(
      { message: "Service deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Service deletion error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

