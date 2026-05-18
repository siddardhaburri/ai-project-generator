const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit");

dotenv.config();

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests, please try again later." },
});

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://ai-project-generator-three.vercel.app",
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
}));

app.use(express.json({ limit: "2mb" }));
app.use("/api/", limiter);

app.use("/api/projects", require("./routes/projects"));
app.use("/api/generate", require("./routes/generate"));

app.get("/health", (req, res) =>
  res.json({ status: "OK", message: "AI Project Generator API is running", version: "2.0" })
);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));