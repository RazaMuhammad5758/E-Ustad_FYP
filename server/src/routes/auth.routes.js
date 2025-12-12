import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import ProfessionalProfile from "../models/ProfessionalProfile.js";


import { requireAuth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";


const router = Router();

function setAuthCookie(res, token) {
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

// ✅ CLIENT register (JSON)
router.post("/register/client", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) return res.status(400).json({ message: "Missing fields" });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: "Email already in use" });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      role: "client",
      name,
      email: email.toLowerCase(),
      phone,
      passwordHash,
      status: "active",
    });

    const token = signToken(user._id.toString());
    setAuthCookie(res, token);

    const safe = await User.findById(user._id).select("-passwordHash");
    res.json({ user: safe });
  } catch {
    res.status(500).json({ message: "Register failed" });
  }
});

// ✅ PROFESSIONAL register (multipart)
router.post(
  "/register/professional",
  upload.fields([
    { name: "profilePic", maxCount: 1 },
    { name: "cnicPic", maxCount: 1 },
    { name: "feeScreenshot", maxCount: 1 }, // ✅ NEW
  ]),
  async (req, res) => {
    try {
      const { name, email, phone, category, shortIntro, password } = req.body;

      if (!name || !email || !phone || !category || !password)
        return res.status(400).json({ message: "Missing fields" });

      if (String(password).length < 6)
        return res.status(400).json({ message: "Password must be at least 6 characters" });

      const exists = await User.findOne({ email: email.toLowerCase() });
      if (exists) return res.status(409).json({ message: "Email already in use" });

      const profilePic = req.files?.profilePic?.[0]?.filename || "";
      const cnicPic = req.files?.cnicPic?.[0]?.filename || "";
      const feeScreenshot = req.files?.feeScreenshot?.[0]?.filename || "";

      if (!profilePic) return res.status(400).json({ message: "Profile picture required" });
      if (!cnicPic) return res.status(400).json({ message: "CNIC picture required" });
      if (!feeScreenshot) return res.status(400).json({ message: "Fee screenshot required" });

      const passwordHash = await bcrypt.hash(password, 10);

      // ✅ pending until admin approves
      const user = await User.create({
        role: "professional",
        name,
        email: email.toLowerCase(),
        phone,
        passwordHash,        // ✅ store now
        status: "pending",   // ✅ block login
        profilePic,
      });

      await ProfessionalProfile.create({
        userId: user._id,
        category,
        skills: [],
        cnicPic,
        feeScreenshot,           // ✅ NEW
        shortIntro: shortIntro || "",
        isVerified: false,
      });

      return res.json({ ok: true, message: "Submitted. Waiting for admin approval." });
    } catch (e) {
      return res.status(500).json({ message: "Register failed" });
    }
  }
);


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Missing fields" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    if (user.role === "professional" && user.status !== "active") {
      return res.status(403).json({ message: "Your account is pending approval" });
    }

    if (!user.passwordHash) return res.status(401).json({ message: "Password not set yet" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken(user._id.toString());
    setAuthCookie(res, token);

    const safe = await User.findById(user._id).select("-passwordHash");
    res.json({ user: safe });
  } catch {
    res.status(500).json({ message: "Login failed" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ ok: true });
});

router.get("/me", requireAuth, (req, res) => res.json({ user: req.user }));





export default router;
