import mongoose, { Schema, model, models } from "mongoose";
import { User } from "@/lib/types";

const UserSchema = new Schema(
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
    password: {
      type: String,
      required: false, // Optional for quick customer creation
    },
    role: {
      type: String,
      enum: ["customer", "barber"],
      required: true,
      default: "customer",
    },
  },
  {
    timestamps: true,
  }
);

export default models.User || model<User>("User", UserSchema);

