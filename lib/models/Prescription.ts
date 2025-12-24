import mongoose, { Schema, model } from "mongoose";

const MedicationSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    dosage: {
      type: String,
      required: true,
      trim: true,
    },
    frequency: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: String,
      trim: true,
    },
    instructions: {
      type: String,
      trim: true,
    },
  },
  { _id: true }
);

const PrescriptionSchema = new Schema(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
    },
    medications: [MedicationSchema],
    diagnosis: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    prescribedDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
    },
    // Refill requests
    refillRequests: [
      {
        requestedAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending",
        },
        notes: String,
        respondedAt: Date,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
PrescriptionSchema.index({ patientId: 1, prescribedDate: -1 });
PrescriptionSchema.index({ doctorId: 1, prescribedDate: -1 });
PrescriptionSchema.index({ bookingId: 1 });

export default mongoose.models.Prescription || model("Prescription", PrescriptionSchema);


