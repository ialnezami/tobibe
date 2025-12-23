import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/connect";
import MedicalDocument from "@/lib/models/MedicalDocument";

// GET a single medical document
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "customer") {
      return NextResponse.json(
        { error: "Forbidden: Patient access required" },
        { status: 403 }
      );
    }

    await connectDB();

    const document = await MedicalDocument.findOne({
      _id: id,
      patientId: session.user.id,
    })
      .populate("doctorId", "name")
      .lean();

    if (!document) {
      return NextResponse.json({ error: "Medical document not found" }, { status: 404 });
    }

    return NextResponse.json({ document });
  } catch (error: any) {
    console.error("Error fetching medical document:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT update a medical document
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "customer") {
      return NextResponse.json(
        { error: "Forbidden: Patient access required" },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { title, description, documentDate, tags } = body;

    const document = await MedicalDocument.findOne({
      _id: id,
      patientId: session.user.id,
    });

    if (!document) {
      return NextResponse.json({ error: "Medical document not found" }, { status: 404 });
    }

    if (title !== undefined) document.title = title;
    if (description !== undefined) document.description = description;
    if (documentDate !== undefined) document.documentDate = new Date(documentDate);
    if (tags !== undefined) document.tags = tags;

    await document.save();

    const updatedDocument = await MedicalDocument.findById(document._id)
      .populate("doctorId", "name")
      .lean();

    return NextResponse.json({
      document: updatedDocument,
      message: "Medical document updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating medical document:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE a medical document
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "customer") {
      return NextResponse.json(
        { error: "Forbidden: Patient access required" },
        { status: 403 }
      );
    }

    await connectDB();

    const document = await MedicalDocument.findOneAndDelete({
      _id: id,
      patientId: session.user.id,
    });

    if (!document) {
      return NextResponse.json({ error: "Medical document not found" }, { status: 404 });
    }

    // TODO: Delete the actual file from storage (S3, local storage, etc.)
    // For now, we just delete the database record

    return NextResponse.json({ message: "Medical document deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting medical document:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

