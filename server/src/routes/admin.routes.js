import { Router } from "express";

import User from "../models/User.js";
import ProfessionalProfile from "../models/ProfessionalProfile.js";


const router = Router();

function requireAdmin(req, res, next) {
  const email = req.headers["x-admin-email"];
  const pass = req.headers["x-admin-password"];

  if (email !== process.env.ADMIN_EMAIL || pass !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ message: "Admin unauthorized" });
  }
  next();
}

router.get("/pending-professionals", requireAdmin, async (req, res) => {
  const users = await User.find({ role: "professional", status: "pending" })
    .select("-passwordHash")
    .lean();

  const ids = users.map((u) => u._id);

  const profiles = await ProfessionalProfile.find({ userId: { $in: ids } }).lean();
  const map = new Map(profiles.map((p) => [p.userId.toString(), p]));

  res.json({
    pending: users.map((u) => ({ ...u, professional: map.get(u._id.toString()) || null })),
  });
});

// ✅ approve -> create token + activate + TRY email, but never fail approval
router.post("/approve/:userId", requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user || user.role !== "professional") return res.status(404).json({ message: "Not found" });

    user.status = "active";
    user.approvedAt = new Date();
    await user.save();

    return res.json({ ok: true });
  } catch (e) {
    console.log("APPROVE ERROR:", e);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/reject/:userId", requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user || user.role !== "professional") return res.status(404).json({ message: "Not found" });

    user.status = "rejected";
    await user.save();

    res.json({ ok: true });
  } catch (e) {
    console.log("REJECT ERROR:", e);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
