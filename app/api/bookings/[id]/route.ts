import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/connect";
import Booking from "@/lib/models/Booking";
import TimeSlot from "@/lib/models/TimeSlot";

// GET a single booking
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const booking = await Booking.findById(params.id)
      .populate("customerId", "name email phone")
      .populate("barberId", "name email phone")
      .populate("serviceIds", "name price duration");

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Verify access
    const isOwner =
      booking.customerId.toString() === session.user.id ||
      booking.barberId.toString() === session.user.id;

    if (!isOwner) {
      return NextResponse.json(
        { error: "You don't have access to this booking" },
        { status: 403 }
      );
    }

    return NextResponse.json({ booking }, { status: 200 });
  } catch (error: any) {
    console.error("Booking fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// UPDATE a booking (mainly status updates)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const booking = await Booking.findById(params.id);

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Verify access - barbers can update their bookings, customers can cancel their bookings
    const isBarber = booking.barberId.toString() === session.user.id;
    const isCustomer = booking.customerId.toString() === session.user.id;

    if (!isBarber && !isCustomer) {
      return NextResponse.json(
        { error: "You don't have permission to update this booking" },
        { status: 403 }
      );
    }

    // Customers can only cancel, barbers can update status
    if (isCustomer && status !== "cancelled") {
      return NextResponse.json(
        { error: "Customers can only cancel bookings" },
        { status: 403 }
      );
    }

    booking.status = status;
    await booking.save();

    // Update time slot availability if cancelled
    if (status === "cancelled") {
      await TimeSlot.updateOne(
        { bookingId: params.id },
        { isAvailable: true, bookingId: null }
      );
    }

    const updatedBooking = await Booking.findById(params.id)
      .populate("customerId", "name email phone")
      .populate("barberId", "name email phone")
      .populate("serviceIds", "name price duration");

    return NextResponse.json(
      { message: "Booking updated successfully", booking: updatedBooking },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Booking update error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE a booking (cancellation)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const booking = await Booking.findById(params.id);

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Verify access
    const isOwner =
      booking.customerId.toString() === session.user.id ||
      booking.barberId.toString() === session.user.id;

    if (!isOwner) {
      return NextResponse.json(
        { error: "You don't have permission to delete this booking" },
        { status: 403 }
      );
    }

    // Update time slot
    await TimeSlot.updateOne(
      { bookingId: params.id },
      { isAvailable: true, bookingId: null }
    );

    await Booking.findByIdAndDelete(params.id);

    return NextResponse.json(
      { message: "Booking cancelled successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Booking deletion error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

