import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/connect";
import Service from "@/lib/models/Service";
import Booking from "@/lib/models/Booking";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "doctor") {
      return NextResponse.json(
        { error: "Forbidden: Doctor access required" },
        { status: 403 }
      );
    }

    await connectDB();

    const doctorId = session.user.id;

    const services = await Service.find({ doctorId }).sort({ createdAt: -1 }).lean();

    // Get booking statistics for each service
    const servicesWithStats = await Promise.all(
      services.map(async (service: any) => {
        const bookingCount = await Booking.countDocuments({
          doctorId,
          serviceIds: service._id,
        });

        const revenue = await Booking.aggregate([
          {
            $match: {
              doctorId: doctorId as any,
              serviceIds: service._id,
              "payment.status": "paid",
              "payment.amount": { $exists: true },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$payment.amount" },
            },
          },
        ]);

        return {
          ...service,
          bookingCount,
          revenue: revenue[0]?.total || 0,
        };
      })
    );

    return NextResponse.json({ services: servicesWithStats });
  } catch (error: any) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "doctor") {
      return NextResponse.json(
        { error: "Forbidden: Doctor access required" },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { name, description, price, duration, isPriceVisible } = body;

    if (!name || !price || !duration) {
      return NextResponse.json(
        { error: "Name, price, and duration are required" },
        { status: 400 }
      );
    }

    const service = new Service({
      doctorId: session.user.id,
      name,
      description,
      price: parseFloat(price) * 100, // Convert to cents
      duration: parseInt(duration),
      isActive: true,
      isPriceVisible: isPriceVisible !== undefined ? isPriceVisible : true,
    });

    await service.save();

    return NextResponse.json({ service, message: "Service created successfully" });
  } catch (error: any) {
    console.error("Error creating service:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}


