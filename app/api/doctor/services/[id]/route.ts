import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/connect";
import Service from "@/lib/models/Service";

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
    const { name, description, price, duration, isActive, isPriceVisible } = body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price) updateData.price = parseFloat(price) * 100; // Convert to cents
    if (duration) updateData.duration = parseInt(duration);
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isPriceVisible !== undefined) updateData.isPriceVisible = isPriceVisible;

    const service = await Service.findOneAndUpdate(
      { _id: id, doctorId: session.user.id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!service) {
      return NextResponse.json(
        { error: "Service not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({ service, message: "Service updated successfully" });
  } catch (error: any) {
    console.error("Error updating service:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const service = await Service.findOneAndDelete({
      _id: id,
      doctorId: session.user.id,
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Service deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting service:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}


