import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/connect";
import Doctor from "@/lib/models/Doctor";
import Booking from "@/lib/models/Booking";
import Service from "@/lib/models/Service";

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
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const query: any = { role: "doctor" };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { "location.address": { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [doctors, total] = await Promise.all([
      Doctor.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-password")
        .lean(),
      Doctor.countDocuments(query),
    ]);

    // Get stats for each doctor
    const doctorsWithStats = await Promise.all(
      doctors.map(async (doctor) => {
        const [bookingCount, serviceCount, revenue] = await Promise.all([
          Booking.countDocuments({ doctorId: doctor._id }),
          Service.countDocuments({ doctorId: doctor._id, isActive: true }),
          Booking.aggregate([
            { $match: { doctorId: doctor._id, "payment.status": "paid" } },
            { $group: { _id: null, total: { $sum: "$payment.amount" } } },
          ]),
        ]);

        return {
          ...doctor,
          bookingCount,
          serviceCount,
          revenue: revenue[0]?.total || 0,
        };
      })
    );

    return NextResponse.json({
      doctors: doctorsWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching doctors:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

