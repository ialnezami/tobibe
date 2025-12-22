import mongoose, { Schema, model } from "mongoose";
import { Doctor, WorkingHours } from "@/lib/types";

const WorkingHoursSchema = new Schema(
  {
    open: String,
    close: String,
    isOpen: Boolean,
  },
  { _id: false }
);

const DoctorSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["customer", "doctor"],
      default: "doctor",
    },
    location: {
      address: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    description: {
      type: String,
      trim: true,
    },
    photos: [String],
    workingHours: {
      type: Map,
      of: WorkingHoursSchema,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Doctor || model("Doctor", DoctorSchema);

