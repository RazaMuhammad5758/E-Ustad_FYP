import { Router } from "express";
import User from "../models/User.js";
import ProfessionalProfile from "../models/ProfessionalProfile.js";

const router = Router();

router.get("/", async (req, res) => {
  const { city = "", category = "", q = "" } = req.query;

  const filter = { role: "professional" };
  if (city) filter.city = new RegExp(city, "i");
  if (q) filter.name = new RegExp(q, "i");

  const pros = await User.find(filter).select("-passwordHash").lean();
  const ids = pros.map(p => p._id);

  const profiles = await ProfessionalProfile.find({ userId: { $in: ids } }).lean();
  const map = new Map(profiles.map(p => [p.userId.toString(), p]));

  const merged = pros
    .map(p => ({ ...p, professional: map.get(p._id.toString()) || null }))
    .filter(p => {
      if (!category) return true;
      return (p.professional?.category || "").toLowerCase() === String(category).toLowerCase();
    });

  res.json({ professionals: merged });
});

router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id).select("-passwordHash").lean();
  if (!user || user.role !== "professional") return res.status(404).json({ message: "Not found" });

  const professional = await ProfessionalProfile.findOne({ userId: user._id }).lean();
  res.json({ user, professional });
});

export default router;
