import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Doctor from "@/lib/models/Doctor";

// GET all doctors (for discovery)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = parseInt(searchParams.get("skip") || "0");

    const query: any = { role: "doctor" };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { "location.address": { $regex: search, $options: "i" } },
      ];
    }

    const doctors = await Doctor.find(query)
      .select("-password")
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Doctor.countDocuments(query);

    return NextResponse.json(
      { doctors, total, limit, skip },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Doctors fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}


