import { Router } from "express";

import User from "../models/User.js";
import ProfessionalProfile from "../models/ProfessionalProfile.js";

import Booking from "../models/Booking.js";
import Gig from "../models/Gig.js";
import GigComment from "../models/GigComment.js";


const router = Router();

function requireAdmin(req, res, next) {
  const email = req.headers["x-admin-email"];
  const pass = req.headers["x-admin-password"];

  if (email !== process.env.ADMIN_EMAIL || pass !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ message: "Admin unauthorized" });
  }
  next();
}

/* ----------------------- LISTS ----------------------- */

router.get("/clients", requireAdmin, async (req, res) => {
  const clients = await User.find({ role: "client" })
    .select("-passwordHash")
    .sort({ createdAt: -1 })
    .lean();

  res.json({ clients });
});

router.get("/professionals", requireAdmin, async (req, res) => {
  const pros = await User.find({ role: "professional" })
    .select("-passwordHash")
    .sort({ createdAt: -1 })
    .lean();

  const ids = pros.map((p) => p._id);

  const profiles = await ProfessionalProfile.find({ userId: { $in: ids } }).lean();
  const map = new Map(profiles.map((p) => [p.userId.toString(), p]));

  res.json({
    professionals: pros.map((p) => ({
      ...p,
      professional: map.get(p._id.toString()) || null,
    })),
  });
});

/* ------------------ APPROVAL WORKFLOW ------------------ */

router.get("/pending-professionals", requireAdmin, async (req, res) => {
  const users = await User.find({ role: "professional", status: "pending" })
    .select("-passwordHash")
    .lean();

  const ids = users.map((u) => u._id);

  const profiles = await ProfessionalProfile.find({ userId: { $in: ids } }).lean();
  const map = new Map(profiles.map((p) => [p.userId.toString(), p]));

  res.json({
    pending: users.map((u) => ({
      ...u,
      professional: map.get(u._id.toString()) || null,
    })),
  });
});

router.post("/approve/:userId", requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user || user.role !== "professional") {
      return res.status(404).json({ message: "Not found" });
    }

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
    if (!user || user.role !== "professional") {
      return res.status(404).json({ message: "Not found" });
    }

    user.status = "rejected";
    await user.save();

    return res.json({ ok: true });
  } catch (e) {
    console.log("REJECT ERROR:", e);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

/* ----------------------- STATS ----------------------- */

router.get("/stats/categories", requireAdmin, async (req, res) => {
  const data = await ProfessionalProfile.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  res.json({
    categories: data.map((d) => ({
      category: d._id || "Uncategorized",
      count: d.count,
    })),
  });
});

router.get("/stats/bookings-by-category", requireAdmin, async (req, res) => {
  const data = await Booking.aggregate([
    {
      $lookup: {
        from: "professionalprofiles",
        localField: "professionalId",
        foreignField: "userId",
        as: "pro",
      },
    },
    { $unwind: "$pro" },
    { $group: { _id: "$pro.category", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  res.json({
    bookings: data.map((d) => ({
      category: d._id || "Uncategorized",
      count: d.count,
    })),
  });
});

/* -------------------- CASCADE DELETE -------------------- */
/**
 * Deletes user + related data everywhere:
 * - Bookings (as client OR professional)
 * - If professional: ProfessionalProfile + Gigs + GigComments + Blogs
 * - If client: their GigComments (written by them)
 */
router.delete("/users/:userId", requireAdmin, async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 1) delete bookings (client or professional)
    await Booking.deleteMany({
      $or: [{ clientId: userId }, { professionalId: userId }],
    });

    // 2) delete comments made by this user (client/pro)
    await GigComment.deleteMany({ userId });

    // 3) if professional: delete gigs + comments on those gigs + profile + blogs
    if (user.role === "professional") {
      // IMPORTANT: Gig model uses professionalId (not userId)
      const gigs = await Gig.find({ professionalId: userId }).select("_id").lean();
      const gigIds = gigs.map((g) => g._id);

      if (gigIds.length) {
        await GigComment.deleteMany({ gigId: { $in: gigIds } });
      }

      await Gig.deleteMany({ professionalId: userId });
      await ProfessionalProfile.deleteOne({ userId });

      
    }

    // 4) finally delete user
    await User.deleteOne({ _id: userId });

    return res.json({ ok: true });
  } catch (e) {
    console.log("ADMIN DELETE ERROR:", e);
    return res.status(500).json({ message: "Delete failed" });
  }
});

export default router;
