import mongoose, { Schema, model } from "mongoose";

const AppointmentNotificationSchema = new Schema(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["late", "cancel", "reminder"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
AppointmentNotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
AppointmentNotificationSchema.index({ bookingId: 1 });

export default mongoose.models.AppointmentNotification ||
  model("AppointmentNotification", AppointmentNotificationSchema);


