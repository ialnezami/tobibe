import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/connect";
import Booking from "@/lib/models/Booking";
import User from "@/lib/models/User";

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
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    // Get all unique patients who have booked with this doctor
    const patientIds = await Booking.distinct("customerId", { doctorId });

    // Get patient details
    let patients = await User.find({
      _id: { $in: patientIds },
      role: "customer",
    })
      .select("-password")
      .lean();

    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      patients = patients.filter(
        (patient: any) =>
          patient.name?.toLowerCase().includes(searchLower) ||
          patient.email?.toLowerCase().includes(searchLower) ||
          patient.phone?.toLowerCase().includes(searchLower)
      );
    }

    // Get booking statistics for each patient
    const patientsWithStats = await Promise.all(
      patients.map(async (patient: any) => {
        const [bookingCount, lastBooking, totalSpent] = await Promise.all([
          Booking.countDocuments({
            doctorId,
            customerId: patient._id,
          }),
          Booking.findOne({
            doctorId,
            customerId: patient._id,
          })
            .sort({ date: -1 })
            .select("date")
            .lean(),
          Booking.aggregate([
            {
              $match: {
                doctorId: doctorId as any,
                customerId: patient._id,
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
          ]),
        ]);

        return {
          ...patient,
          bookingCount,
          lastVisit: lastBooking?.date || null,
          totalSpent: totalSpent[0]?.total || 0,
        };
      })
    );

    // Sort by last visit (most recent first)
    patientsWithStats.sort((a: any, b: any) => {
      if (!a.lastVisit) return 1;
      if (!b.lastVisit) return -1;
      return new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime();
    });

    return NextResponse.json({ patients: patientsWithStats });
  } catch (error: any) {
    console.error("Error fetching patients:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

