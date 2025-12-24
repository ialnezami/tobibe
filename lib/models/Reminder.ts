import mongoose, { Schema, model } from "mongoose";

const ReminderSchema = new Schema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["appointment", "medication", "checkup"],
      required: true,
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
    reminderDate: {
      type: Date,
      required: true,
    },
    reminderTime: {
      type: String,
      required: true,
    },
    // For appointment reminders
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
    },
    // For medication reminders
    medicationName: {
      type: String,
      trim: true,
    },
    dosage: {
      type: String,
      trim: true,
    },
    frequency: {
      type: String,
      enum: ["once", "daily", "weekly", "monthly"],
    },
    // For recurring reminders
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringInterval: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
    },
    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
ReminderSchema.index({ patientId: 1, reminderDate: 1 });
ReminderSchema.index({ patientId: 1, isActive: 1 });

export default mongoose.models.Reminder || model("Reminder", ReminderSchema);


