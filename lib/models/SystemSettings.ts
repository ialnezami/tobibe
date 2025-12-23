import mongoose, { Schema, model } from "mongoose";

const SystemSettingsSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
SystemSettingsSchema.index({ key: 1 });

export default mongoose.models.SystemSettings ||
  model("SystemSettings", SystemSettingsSchema);

