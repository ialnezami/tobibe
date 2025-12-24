import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/connect";
import ChatMessage from "@/lib/models/Chat";
import Booking from "@/lib/models/Booking";

// GET messages for a booking
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const bookingId = searchParams.get("bookingId");

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
    }

    // Verify user is part of this booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const isCustomer = booking.customerId.toString() === session.user.id;
    const isDoctor = booking.doctorId.toString() === session.user.id;

    if (!isCustomer && !isDoctor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get all messages for this booking
    const messages = await ChatMessage.find({ bookingId })
      .populate("senderId", "name email role")
      .populate("receiverId", "name email role")
      .sort({ createdAt: 1 });

    // Mark messages as read if they're for the current user
    const unreadMessages = messages.filter(
      (msg) => msg.receiverId._id.toString() === session.user.id && !msg.isRead
    );

    if (unreadMessages.length > 0) {
      await ChatMessage.updateMany(
        {
          _id: { $in: unreadMessages.map((msg) => msg._id) },
        },
        {
          $set: {
            isRead: true,
            readAt: new Date(),
          },
        }
      );
    }

    return NextResponse.json({ messages }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}

// POST a new message
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { bookingId, message } = body;

    if (!bookingId || !message || !message.trim()) {
      return NextResponse.json(
        { error: "Booking ID and message are required" },
        { status: 400 }
      );
    }

    // Verify booking exists and user is part of it
    const booking = await Booking.findById(bookingId)
      .populate("customerId", "name email")
      .populate("doctorId", "name email");

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const isCustomer = booking.customerId._id.toString() === session.user.id;
    const isDoctor = booking.doctorId._id.toString() === session.user.id;

    if (!isCustomer && !isDoctor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check chat availability
    const appointmentDate = new Date(booking.date);
    const [startHour, startMin] = booking.startTime.split(":").map(Number);
    appointmentDate.setHours(startHour, startMin, 0, 0);

    const now = new Date();
    const oneHourBefore = new Date(appointmentDate);
    oneHourBefore.setHours(oneHourBefore.getHours() - 1);
    const twentyFourHoursAfter = new Date(appointmentDate);
    twentyFourHoursAfter.setHours(twentyFourHoursAfter.getHours() + 24);

    const isAvailable =
      (now >= oneHourBefore && now <= appointmentDate) ||
      (now >= appointmentDate && now <= twentyFourHoursAfter);

    if (!isAvailable) {
      return NextResponse.json(
        {
          error:
            "Chat is only available 1 hour before or 24 hours after the appointment",
        },
        { status: 403 }
      );
    }

    // Determine receiver
    const receiverId = isCustomer
      ? booking.doctorId._id.toString()
      : booking.customerId._id.toString();

    // Create message
    const chatMessage = new ChatMessage({
      bookingId,
      senderId: session.user.id,
      receiverId,
      message: message.trim(),
    });

    await chatMessage.save();

    const populatedMessage = await ChatMessage.findById(chatMessage._id)
      .populate("senderId", "name email role")
      .populate("receiverId", "name email role");

    return NextResponse.json({ message: populatedMessage }, { status: 201 });
  } catch (error: any) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}


