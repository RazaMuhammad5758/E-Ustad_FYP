import { Router } from "express";
import Booking from "../models/Booking.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// CLIENT → CREATE BOOKING
router.post("/", requireAuth, async (req, res) => {
  const { professionalId, message } = req.body;

  if (!professionalId) return res.status(400).json({ message: "Missing professional" });

  const booking = await Booking.create({
    clientId: req.user._id,
    professionalId,
    message: message || "",
  });

  res.json({ booking });
});

// CLIENT → VIEW MY SENT REQUESTS
router.get("/client", requireAuth, async (req, res) => {
  const items = await Booking.find({ clientId: req.user._id })
    .populate("professionalId", "name phone")
    .sort({ createdAt: -1 });

  res.json({ bookings: items });
});


// PROFESSIONAL → VIEW REQUESTS
router.get("/professional", requireAuth, async (req, res) => {
  const items = await Booking.find({ professionalId: req.user._id })
    .populate("clientId", "name phone")
    .sort({ createdAt: -1 });

  res.json({ bookings: items });
});

// UPDATE STATUS
router.post("/:id/status", requireAuth, async (req, res) => {
  const { status } = req.body;
  if (!["accepted", "rejected"].includes(status))
    return res.status(400).json({ message: "Invalid status" });

  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ message: "Not found" });

  // only professional can update
  if (booking.professionalId.toString() !== req.user._id.toString())
    return res.status(403).json({ message: "Forbidden" });

  booking.status = status;
  await booking.save();

  res.json({ ok: true });
});

export default router;
