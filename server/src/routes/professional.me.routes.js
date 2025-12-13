import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import User from "../models/User.js";
import ProfessionalProfile from "../models/ProfessionalProfile.js";
import Booking from "../models/Booking.js";
import Gig from "../models/Gig.js";


const router = Router();

router.get("/me", requireAuth, async (req, res) => {
  if (req.user.role !== "professional") return res.status(403).json({ message: "Professional only" });

  const user = await User.findById(req.user._id).select("-passwordHash").lean();
  const professional = await ProfessionalProfile.findOne({ userId: req.user._id }).lean();

  const [total, pending, accepted, rejected] = await Promise.all([
    Booking.countDocuments({ professionalId: req.user._id }),
    Booking.countDocuments({ professionalId: req.user._id, status: "pending" }),
    Booking.countDocuments({ professionalId: req.user._id, status: "accepted" }),
    Booking.countDocuments({ professionalId: req.user._id, status: "rejected" }),
  ]);

  const gigs = await Gig.find({ professionalId: req.user._id }).sort({ createdAt: -1 });


  res.json({
    user,
    professional,
    stats: { total, pending, accepted, rejected },
    gigs,
  });
});

export default router;
