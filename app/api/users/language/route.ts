import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/connect";
import User from "@/lib/models/User";

// GET user's language preference
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id).select("language");

    return NextResponse.json(
      { language: user?.language || "en" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching user language:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}

// PUT update user's language preference
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { language } = body;

    if (!language || !["en", "ar", "fr"].includes(language)) {
      return NextResponse.json(
        { error: "Invalid language. Must be 'en', 'ar', or 'fr'" },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndUpdate(
      session.user.id,
      { language },
      { new: true }
    ).select("language");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { language: user.language, message: "Language preference updated" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating user language:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}

