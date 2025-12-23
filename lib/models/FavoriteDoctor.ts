import mongoose, { Schema, model } from "mongoose";

const FavoriteDoctorSchema = new Schema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    preferredTime: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique combination of patient and doctor
FavoriteDoctorSchema.index({ patientId: 1, doctorId: 1 }, { unique: true });

export default mongoose.models.FavoriteDoctor || model("FavoriteDoctor", FavoriteDoctorSchema);

