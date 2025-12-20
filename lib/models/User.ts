import mongoose, { Schema, model, models } from "mongoose";
import { User } from "@/lib/types";

const UserSchema = new Schema<User>(
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

