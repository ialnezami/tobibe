import mongoose, { Schema, model } from "mongoose";

const MedicalDocumentSchema = new Schema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    documentType: {
      type: String,
      required: true,
      enum: [
        "lab_result",
        "test_report",
        "imaging",
        "prescription_copy",
        "medical_certificate",
        "insurance",
        "other",
      ],
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number, // in bytes
    },
    mimeType: {
      type: String,
    },
    // Optional: Link to a doctor or appointment
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
    },
    documentDate: {
      type: Date,
      default: Date.now,
    },
    // Tags for organization
    tags: [String],
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
MedicalDocumentSchema.index({ patientId: 1, documentDate: -1 });
MedicalDocumentSchema.index({ patientId: 1, documentType: 1 });

export default mongoose.models.MedicalDocument || model("MedicalDocument", MedicalDocumentSchema);

