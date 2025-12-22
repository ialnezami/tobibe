import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Doctor from "@/lib/models/Doctor";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const doctor = await Doctor.findById(id).select("-password");

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    return NextResponse.json({ doctor }, { status: 200 });
  } catch (error: any) {
    console.error("Doctor fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

