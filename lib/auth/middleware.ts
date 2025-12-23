import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function requireAuth(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return null;
}

export async function requireRole(request: NextRequest, role: "doctor" | "customer" | "admin") {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session.user.role !== role) {
    return NextResponse.json(
      { error: "Forbidden: Insufficient permissions" },
      { status: 403 }
    );
  }

  return null;
}

export async function requireAdmin(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session.user.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden: Admin access required" },
      { status: 403 }
    );
  }

  return null;
}


