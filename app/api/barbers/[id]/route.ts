import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Barber from "@/lib/models/Barber";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const barber = await Barber.findById(params.id).select("-password");

    if (!barber) {
      return NextResponse.json({ error: "Barber not found" }, { status: 404 });
    }

    return NextResponse.json({ barber }, { status: 200 });
  } catch (error: any) {
    console.error("Barber fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

