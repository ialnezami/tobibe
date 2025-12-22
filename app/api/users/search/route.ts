import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/connect";
import User from "@/lib/models/User";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only doctors can search for customers
    if (session.user.role !== "doctor") {
      return NextResponse.json(
        { error: "Only doctors can search for customers" },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Search by name, email, or phone
    const users = await User.find({
      role: "customer",
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
        { phone: { $regex: query, $options: "i" } },
      ],
    })
      .select("-password")
      .limit(20);

    return NextResponse.json({ users }, { status: 200 });
  } catch (error: any) {
    console.error("User search error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}


