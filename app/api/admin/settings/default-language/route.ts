import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/connect";
import SystemSettings from "@/lib/models/SystemSettings";

// GET default language
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const setting = await SystemSettings.findOne({ key: "defaultLanguage" });

    return NextResponse.json(
      { defaultLanguage: setting?.value || "en" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching default language:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}

// PUT update default language (admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { defaultLanguage } = body;

    if (!defaultLanguage || !["en", "ar", "fr"].includes(defaultLanguage)) {
      return NextResponse.json(
        { error: "Invalid language. Must be 'en', 'ar', or 'fr'" },
        { status: 400 }
      );
    }

    const setting = await SystemSettings.findOneAndUpdate(
      { key: "defaultLanguage" },
      { value: defaultLanguage },
      { upsert: true, new: true }
    );

    return NextResponse.json(
      {
        defaultLanguage: setting.value,
        message: "Default language updated successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating default language:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}

