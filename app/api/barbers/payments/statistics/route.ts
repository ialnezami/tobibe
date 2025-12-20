import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/connect";
import Booking from "@/lib/models/Booking";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "barber") {
      return NextResponse.json(
        { error: "Only barbers can access payment statistics" },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get("month"); // YYYY-MM format
    const year = searchParams.get("year");

    await connectDB();

    // Calculate date range
    const now = new Date();
    const startDate = month
      ? new Date(`${month}-01`)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = month
      ? new Date(now.getFullYear(), parseInt(month.split("-")[1]), 0, 23, 59, 59)
      : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Get all bookings for the barber in the date range with payment status "paid"
    const bookings = await Booking.find({
      barberId: session.user.id,
      date: { $gte: startDate, $lte: endDate },
      "payment.status": "paid",
    }).populate("serviceIds", "name price");

    // Calculate statistics
    const totalRevenue = bookings.reduce(
      (sum, booking) => sum + (booking.payment?.amount || 0),
      0
    );

    const cashPayments = bookings.filter(
      (b) => b.payment?.method === "cash" && b.payment?.status === "paid"
    );
    const onlinePayments = bookings.filter(
      (b) => b.payment?.method === "online" && b.payment?.status === "paid"
    );

    const cashRevenue = cashPayments.reduce(
      (sum, booking) => sum + (booking.payment?.amount || 0),
      0
    );
    const onlineRevenue = onlinePayments.reduce(
      (sum, booking) => sum + (booking.payment?.amount || 0),
      0
    );

    // Daily breakdown
    const dailyBreakdown: { [key: string]: { cash: number; online: number; total: number } } = {};
    bookings.forEach((booking) => {
      const dateKey = booking.date.toISOString().split("T")[0];
      if (!dailyBreakdown[dateKey]) {
        dailyBreakdown[dateKey] = { cash: 0, online: 0, total: 0 };
      }
      const amount = booking.payment?.amount || 0;
      dailyBreakdown[dateKey].total += amount;
      if (booking.payment?.method === "cash") {
        dailyBreakdown[dateKey].cash += amount;
      } else if (booking.payment?.method === "online") {
        dailyBreakdown[dateKey].online += amount;
      }
    });

    // Weekly breakdown
    const weeklyBreakdown: { [key: string]: { cash: number; online: number; total: number } } = {};
    bookings.forEach((booking) => {
      const date = new Date(booking.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split("T")[0];
      if (!weeklyBreakdown[weekKey]) {
        weeklyBreakdown[weekKey] = { cash: 0, online: 0, total: 0 };
      }
      const amount = booking.payment?.amount || 0;
      weeklyBreakdown[weekKey].total += amount;
      if (booking.payment?.method === "cash") {
        weeklyBreakdown[weekKey].cash += amount;
      } else if (booking.payment?.method === "online") {
        weeklyBreakdown[weekKey].online += amount;
      }
    });

    // Service breakdown
    const serviceBreakdown: { [key: string]: { count: number; revenue: number } } = {};
    bookings.forEach((booking) => {
      const services = booking.serviceIds as any[];
      services.forEach((service: any) => {
        const serviceId = service._id?.toString() || service.toString();
        if (!serviceBreakdown[serviceId]) {
          serviceBreakdown[serviceId] = { count: 0, revenue: 0 };
        }
        serviceBreakdown[serviceId].count += 1;
        // Distribute revenue proportionally (simplified - each service gets equal share)
        serviceBreakdown[serviceId].revenue += (booking.payment?.amount || 0) / services.length;
      });
    });

    return NextResponse.json(
      {
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
        summary: {
          totalRevenue,
          cashRevenue,
          onlineRevenue,
          totalBookings: bookings.length,
          cashBookings: cashPayments.length,
          onlineBookings: onlinePayments.length,
        },
        dailyBreakdown,
        weeklyBreakdown,
        serviceBreakdown,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Payment statistics error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

