import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import GigComment from "../models/GigComment.js";

const router = Router();

// add comment
router.post("/", requireAuth, async (req, res) => {
  const { gigId, text } = req.body;
  if (!gigId || !text) return res.status(400).json({ message: "Missing fields" });

  const c = await GigComment.create({
    gigId,
    userId: req.user._id,
    text,
  });

  res.json({ comment: c });
});

// get comments by gig
router.get("/:gigId", async (req, res) => {
  const items = await GigComment.find({ gigId: req.params.gigId })
    .populate("userId", "name profilePic")
    .sort({ createdAt: -1 });

  res.json({ comments: items });
});

export default router;
