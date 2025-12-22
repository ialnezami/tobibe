import mongoose, { Schema, model } from "mongoose";
import { Booking } from "@/lib/types";

const BookingSchema = new Schema(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    serviceIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Service",
        required: true,
      },
    ],
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    source: {
      type: String,
      enum: ["self-service", "doctor-assisted"],
      required: true,
    },
    payment: {
      amount: {
        type: Number,
        default: 0,
      },
      method: {
        type: String,
        enum: ["cash", "online", "pending"],
        default: "pending",
      },
      status: {
        type: String,
        enum: ["pending", "paid", "refunded"],
        default: "pending",
      },
      paidAt: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
BookingSchema.index({ customerId: 1, date: 1 });
BookingSchema.index({ doctorId: 1, date: 1 });
BookingSchema.index({ date: 1, startTime: 1 });

export default mongoose.models.Booking || model("Booking", BookingSchema);

