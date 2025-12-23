import mongoose, { Schema, model } from "mongoose";
import { Service } from "@/lib/types";

const ServiceSchema = new Schema(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    duration: {
      type: Number,
      required: true,
      default: 10, // default 10 minutes
      min: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPriceVisible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Service || model("Service", ServiceSchema);

