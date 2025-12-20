import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Barber from "@/lib/models/Barber";

// GET all barbers (for discovery)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = parseInt(searchParams.get("skip") || "0");

    const query: any = { role: "barber" };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { "location.address": { $regex: search, $options: "i" } },
      ];
    }

    const barbers = await Barber.find(query)
      .select("-password")
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Barber.countDocuments(query);

    return NextResponse.json(
      { barbers, total, limit, skip },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Barbers fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

