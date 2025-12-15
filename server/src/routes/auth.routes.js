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

// ✅ helper: only run multer when request is multipart/form-data
function maybeUploadSingle(fieldName) {
  return (req, res, next) => {
    const ct = req.headers["content-type"] || "";
    if (ct.includes("multipart/form-data")) {
      return upload.single(fieldName)(req, res, next);
    }
    return next();
  };
}

/* -------------------- REGISTER -------------------- */

// ✅ CLIENT register (JSON) + OPTIONAL profilePic via multipart
router.post("/register/client", maybeUploadSingle("profilePic"), async (req, res) => {
  try {
    // JSON or multipart both supported
    const { name, email, phone, password, city } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const exists = await User.findOne({ email: String(email).toLowerCase() });
    if (exists) return res.status(409).json({ message: "Email already in use" });

    if (String(password).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const profilePic = req.file?.filename || ""; // ✅ if user uploaded

    const user = await User.create({
      role: "client",
      name: String(name).trim(),
      email: String(email).toLowerCase(),
      phone: String(phone).trim(),
      city: city ? String(city).trim() : "",
      profilePic,
      passwordHash,
      status: "active",
    });

    const token = signToken(user._id.toString());
    setAuthCookie(res, token);

    const safe = await User.findById(user._id).select("-passwordHash").lean();
    return res.json({ user: safe });
  } catch (e) {
    console.log("CLIENT REGISTER ERROR:", e);
    return res.status(500).json({ message: "Register failed" });
  }
});

// ✅ PROFESSIONAL register (multipart)
router.post(
  "/register/professional",
  upload.fields([
    { name: "profilePic", maxCount: 1 },
    { name: "cnicPic", maxCount: 1 },
    { name: "feeScreenshot", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { name, email, phone, city, category, shortIntro, password } = req.body;

      if (!name || !email || !phone || !city || !category || !password) {
        return res.status(400).json({ message: "Missing fields" });
      }

      if (String(password).length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      const exists = await User.findOne({ email: String(email).toLowerCase() });
      if (exists) return res.status(409).json({ message: "Email already in use" });

      const profilePic = req.files?.profilePic?.[0]?.filename || "";
      const cnicPic = req.files?.cnicPic?.[0]?.filename || "";
      const feeScreenshot = req.files?.feeScreenshot?.[0]?.filename || "";

      if (!profilePic) return res.status(400).json({ message: "Profile picture required" });
      if (!cnicPic) return res.status(400).json({ message: "CNIC picture required" });
      if (!feeScreenshot) return res.status(400).json({ message: "Fee screenshot required" });

      const passwordHash = await bcrypt.hash(password, 10);

      const user = await User.create({
        role: "professional",
        name: String(name).trim(),
        email: String(email).toLowerCase(),
        phone: String(phone).trim(),
        city: String(city).trim(),
        passwordHash,
        status: "pending",
        profilePic,
      });

      await ProfessionalProfile.create({
        userId: user._id,
        category: String(category).trim(),
        skills: [],
        cnicPic,
        feeScreenshot,
        shortIntro: shortIntro ? String(shortIntro) : "",
        isVerified: false,
      });

      return res.json({ ok: true, message: "Submitted. Waiting for admin approval." });
    } catch (e) {
      console.log("PRO REGISTER ERROR:", e);
      return res.status(500).json({ message: "Register failed" });
    }
  }
);

/* -------------------- LOGIN / LOGOUT -------------------- */

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Missing fields" });

    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    if (user.role === "professional" && user.status !== "active") {
      return res.status(403).json({ message: "Your account is pending approval" });
    }

    if (!user.passwordHash) return res.status(401).json({ message: "Password not set yet" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken(user._id.toString());
    setAuthCookie(res, token);

    const safe = await User.findById(user._id).select("-passwordHash").lean();
    return res.json({ user: safe });
  } catch (e) {
    console.log("LOGIN ERROR:", e);
    return res.status(500).json({ message: "Login failed" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ ok: true });
});

router.get("/me", requireAuth, (req, res) => res.json({ user: req.user }));

/* -------------------- ✅ EDIT PROFILE -------------------- */
/**
 * PUT /api/auth/me
 * Supports:
 * - JSON (name/phone/city/address...)
 * - multipart/form-data (same + profilePic upload)
 *
 * Client can update: name, phone, city, address, profilePic
 * Professional can update: name, phone, city, address, profilePic + (category, shortIntro) in ProfessionalProfile
 */
router.put("/me", requireAuth, maybeUploadSingle("profilePic"), async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, phone, city, address, category, shortIntro } = req.body || {};

    // user fields (both roles)
    if (name !== undefined) user.name = String(name).trim();
    if (phone !== undefined) user.phone = String(phone).trim();
    if (city !== undefined) user.city = String(city).trim();
    if (address !== undefined) user.address = String(address).trim();

    // profile pic (if multipart)
    if (req.file?.filename) {
      user.profilePic = req.file.filename;
    }

    await user.save();

    // professional extra fields
    if (user.role === "professional") {
      const prof = await ProfessionalProfile.findOne({ userId: user._id });

      // if profile missing for some reason, create it (safe)
      if (!prof) {
        await ProfessionalProfile.create({
          userId: user._id,
          category: category ? String(category).trim() : "",
          skills: [],
          shortIntro: shortIntro ? String(shortIntro) : "",
          cnicPic: "",
          feeScreenshot: "",
          isVerified: false,
        });
      } else {
        if (category !== undefined) prof.category = String(category).trim();
        if (shortIntro !== undefined) prof.shortIntro = String(shortIntro);
        await prof.save();
      }
    }

    const safe = await User.findById(user._id).select("-passwordHash").lean();
    return res.json({ user: safe });
  } catch (e) {
    console.log("UPDATE PROFILE ERROR:", e);
    return res.status(500).json({ message: "Update failed" });
  }
});

export default router;
