import mongoose, { Schema, model } from "mongoose";

const HealthMetricSchema = new Schema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    metricType: {
      type: String,
      required: true,
      enum: [
        "blood_pressure",
        "heart_rate",
        "weight",
        "height",
        "bmi",
        "blood_sugar",
        "temperature",
        "oxygen_saturation",
        "cholesterol",
        "other",
      ],
    },
    value: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    // For blood pressure, store systolic and diastolic
    secondaryValue: {
      type: Number,
    },
    notes: {
      type: String,
      trim: true,
    },
    recordedDate: {
      type: Date,
      default: Date.now,
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
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
HealthMetricSchema.index({ patientId: 1, recordedDate: -1 });
HealthMetricSchema.index({ patientId: 1, metricType: 1, recordedDate: -1 });

export default mongoose.models.HealthMetric || model("HealthMetric", HealthMetricSchema);

