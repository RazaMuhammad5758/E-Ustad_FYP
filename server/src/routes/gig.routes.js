import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import Gig from "../models/Gig.js";

const router = Router();

function requireProfessional(req, res, next) {
  if (req.user.role !== "professional") return res.status(403).json({ message: "Professional only" });
  next();
}

// Create gig (professional)
router.post(
  "/",
  requireAuth,
  requireProfessional,
  upload.single("image"),
  async (req, res) => {
    const { title, description, price } = req.body;
    if (!title || price === undefined) return res.status(400).json({ message: "Missing fields" });

    const gig = await Gig.create({
      professionalId: req.user._id,
      title: title.trim(),
      description: description || "",
      price: Number(price),
      image: req.file?.filename || "",
    });

    res.json({ gig });
  }
);

// Professional: my gigs
router.get("/me", requireAuth, requireProfessional, async (req, res) => {
  const gigs = await Gig.find({ professionalId: req.user._id }).sort({ createdAt: -1 });
  res.json({ gigs });
});

// Public: gigs by professionalId
router.get("/by/:professionalId", async (req, res) => {
  const gigs = await Gig.find({ professionalId: req.params.professionalId }).sort({ createdAt: -1 });
  res.json({ gigs });
});

export default router;
