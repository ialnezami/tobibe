import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/connect";
import AppointmentNotification from "@/lib/models/AppointmentNotification";
import Booking from "@/lib/models/Booking";

// GET all notifications for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const query: any = { userId: session.user.id };
    if (unreadOnly) {
      query.isRead = false;
    }

    const notifications = await AppointmentNotification.find(query)
      .populate("bookingId")
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({ notifications }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}

// POST create a new notification (for late/cancel)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { bookingId, type, message } = body;

    if (!bookingId || !type || !message) {
      return NextResponse.json(
        { error: "Booking ID, type, and message are required" },
        { status: 400 }
      );
    }

    if (!["late", "cancel", "reminder"].includes(type)) {
      return NextResponse.json({ error: "Invalid notification type" }, { status: 400 });
    }

    // Verify booking exists and user is part of it
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const isCustomer = booking.customerId.toString() === session.user.id;
    const isDoctor = booking.doctorId.toString() === session.user.id;

    if (!isCustomer && !isDoctor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Determine who should receive the notification
    const recipientId = isCustomer ? booking.doctorId.toString() : booking.customerId.toString();

    // Create notification for the other party
    const notification = new AppointmentNotification({
      bookingId,
      userId: recipientId,
      type,
      message,
    });

    await notification.save();

    // Also create a notification for the sender (confirmation)
    const senderNotification = new AppointmentNotification({
      bookingId,
      userId: session.user.id,
      type,
      message: `You ${type === "late" ? "notified about being late" : "cancelled"} the appointment`,
    });

    await senderNotification.save();

    return NextResponse.json(
      {
        notification,
        message: "Notification sent successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating notification:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}


