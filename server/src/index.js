import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import path from "path";
import adminRoutes from "./routes/admin.routes.js";
import authRoutes from "./routes/auth.routes.js";
import professionalsRoutes from "./routes/professionals.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import gigRoutes from "./routes/gig.routes.js";
import professionalMeRoutes from "./routes/professional.me.routes.js";
import gigCommentRoutes from "./routes/gigComment.routes.js";


dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
app.use(cookieParser());

app.use("/api/bookings", bookingRoutes);
app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/professionals", professionalsRoutes);
app.use("/uploads", express.static(path.join(process.cwd(), "src", "uploads")));
app.use("/api/admin", adminRoutes);
app.use("/api/gigs", gigRoutes);

app.use("/api/professional", professionalMeRoutes);
app.use("/api/gig-comments", gigCommentRoutes);

const port = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(port, () => console.log(`✅ Server running on ${port}`));
  })
  .catch((e) => {
    console.error("❌ DB connect failed:", e.message);
    process.exit(1);
  });
