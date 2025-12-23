import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/connect";
import FavoriteDoctor from "@/lib/models/FavoriteDoctor";
import Doctor from "@/lib/models/Doctor";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "customer") {
      return NextResponse.json(
        { error: "Forbidden: Patient access required" },
        { status: 403 }
      );
    }

    await connectDB();

    const favorites = await FavoriteDoctor.find({ patientId: session.user.id })
      .populate("doctorId", "name email phone location description photos")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ favorites });
  } catch (error: any) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "customer") {
      return NextResponse.json(
        { error: "Forbidden: Patient access required" },
        { status: 403 }
      );
    }

    await connectDB();

    const { doctorId, notes, preferredTime } = await request.json();

    if (!doctorId) {
      return NextResponse.json({ error: "Doctor ID required" }, { status: 400 });
    }

    // Check if already favorited
    const existing = await FavoriteDoctor.findOne({
      patientId: session.user.id,
      doctorId,
    });

    if (existing) {
      return NextResponse.json(
        { error: "Doctor already in favorites" },
        { status: 400 }
      );
    }

    const favorite = new FavoriteDoctor({
      patientId: session.user.id,
      doctorId,
      notes,
      preferredTime,
    });

    await favorite.save();

    return NextResponse.json({ favorite, message: "Doctor added to favorites" });
  } catch (error: any) {
    console.error("Error adding favorite:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Doctor already in favorites" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "customer") {
      return NextResponse.json(
        { error: "Forbidden: Patient access required" },
        { status: 403 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get("doctorId");

    if (!doctorId) {
      return NextResponse.json({ error: "Doctor ID required" }, { status: 400 });
    }

    await FavoriteDoctor.findOneAndDelete({
      patientId: session.user.id,
      doctorId,
    });

    return NextResponse.json({ message: "Doctor removed from favorites" });
  } catch (error: any) {
    console.error("Error removing favorite:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}


