import mongoose from "mongoose";

const professionalProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },

    category: { type: String, required: true },
    skills: [{ type: String, trim: true }],

    cnicPic: { type: String, default: "" },
    feeScreenshot: { type: String, default: "" }, // ✅ NEW
       // ✅ keep

    isAvailable: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("ProfessionalProfile", professionalProfileSchema);
