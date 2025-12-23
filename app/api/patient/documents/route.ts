import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/connect";
import MedicalDocument from "@/lib/models/MedicalDocument";

// GET all medical documents for the patient
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

    const { searchParams } = new URL(request.url);
    const documentType = searchParams.get("type");
    const limit = searchParams.get("limit");

    const query: any = { patientId: session.user.id };

    if (documentType) {
      query.documentType = documentType;
    }

    const documents = await MedicalDocument.find(query)
      .populate("doctorId", "name")
      .sort({ documentDate: -1 })
      .limit(limit ? parseInt(limit) : undefined)
      .lean();

    return NextResponse.json({ documents });
  } catch (error: any) {
    console.error("Error fetching medical documents:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// POST create a new medical document
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

    const body = await request.json();
    const {
      documentType,
      title,
      description,
      fileUrl,
      fileName,
      fileSize,
      mimeType,
      documentDate,
      doctorId,
      bookingId,
      tags,
    } = body;

    if (!documentType || !title || !fileUrl || !fileName) {
      return NextResponse.json(
        { error: "Document type, title, file URL, and file name are required" },
        { status: 400 }
      );
    }

    const document = new MedicalDocument({
      patientId: session.user.id,
      documentType,
      title,
      description: description || undefined,
      fileUrl,
      fileName,
      fileSize: fileSize || undefined,
      mimeType: mimeType || undefined,
      documentDate: documentDate ? new Date(documentDate) : new Date(),
      doctorId: doctorId || undefined,
      bookingId: bookingId || undefined,
      tags: tags || [],
    });

    await document.save();

    const populatedDocument = await MedicalDocument.findById(document._id)
      .populate("doctorId", "name")
      .lean();

    return NextResponse.json(
      { document: populatedDocument, message: "Medical document uploaded successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating medical document:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

