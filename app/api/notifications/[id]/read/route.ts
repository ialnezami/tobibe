import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/connect";
import AppointmentNotification from "@/lib/models/AppointmentNotification";

// Mark notification as read
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;
    const notification = await AppointmentNotification.findById(id);

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    if (notification.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    return NextResponse.json({ notification }, { status: 200 });
  } catch (error: any) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}


