const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit");

dotenv.config();

const app = express();

// ✅ Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { error: "Too many requests, please try again later." },
});

// ✅ CORS (IMPORTANT)
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://ai-project-generator-three.vercel.app"
  ],
  credentials: true
}));

app.use(express.json());
app.use("/api/", limiter);

// ✅ Routes
app.use("/api/projects", require("./routes/projects"));
app.use("/api/generate", require("./routes/generate"));

// ✅ Health check
app.get("/health", (req, res) =>
  res.json({ status: "OK", message: "AI Project Generator API is running" })
);

const connectDB = require("./config/db");

// ✅ Initialize DB
connectDB();

// ✅ Server start
const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);