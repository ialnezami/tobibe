import mongoose, { Schema, model } from "mongoose";
import { TimeSlot } from "@/lib/types";

const TimeSlotSchema = new Schema(
  {
    barberId: {
      type: Schema.Types.ObjectId,
      ref: "Barber",
      required: true,
    },
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
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
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

// Index for efficient queries
TimeSlotSchema.index({ barberId: 1, date: 1, startTime: 1 });

export default mongoose.models.TimeSlot || model("TimeSlot", TimeSlotSchema);

