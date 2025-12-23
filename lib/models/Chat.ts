import mongoose, { Schema, model } from "mongoose";

const ChatMessageSchema = new Schema(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
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
ChatMessageSchema.index({ bookingId: 1, createdAt: 1 });
ChatMessageSchema.index({ senderId: 1, receiverId: 1 });
ChatMessageSchema.index({ receiverId: 1, isRead: 1 });

export default mongoose.models.ChatMessage || model("ChatMessage", ChatMessageSchema);

