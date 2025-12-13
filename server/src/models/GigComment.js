import mongoose from "mongoose";

const gigCommentSchema = new mongoose.Schema(
  {
    gigId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gig",
      required: true,
      index: true, // ✅ fast comment fetch per gig
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // ✅ cascade delete fast
    },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

// compound index (very useful)
gigCommentSchema.index({ gigId: 1, createdAt: -1 });

export default mongoose.model("GigComment", gigCommentSchema);
