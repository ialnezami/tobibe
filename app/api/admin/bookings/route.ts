import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/connect";
import Booking from "@/lib/models/Booking";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const query: any = {};
    if (status && status !== "all") {
      if (status === "active") {
        query.status = { $in: ["pending", "confirmed"] };
        query.date = { $gte: new Date() };
      } else {
        query.status = status;
      }
    }

    const skip = (page - 1) * limit;

    let bookings = await Booking.find(query)
      .populate("customerId", "name email phone")
      .populate("doctorId", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Filter by search if provided (after population)
    if (search) {
      const searchLower = search.toLowerCase();
      bookings = bookings.filter((booking: any) => {
        const customerName = booking.customerId?.name?.toLowerCase() || "";
        const customerEmail = booking.customerId?.email?.toLowerCase() || "";
        const doctorName = booking.doctorId?.name?.toLowerCase() || "";
        return (
          customerName.includes(searchLower) ||
          customerEmail.includes(searchLower) ||
          doctorName.includes(searchLower)
        );
      });
    }

    const total = await Booking.countDocuments(query);

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

