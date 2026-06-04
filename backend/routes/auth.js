const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const axios = require("axios");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

// ─── Helpers ──────────────────────────────────────────────────────────────────

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const sendTokenResponse = (user, res, statusCode = 200) => {
  const token = generateToken(user._id);
  res.status(statusCode).json({
    success: true,
    token,
    user: user.toJSON ? user.toJSON() : user,
  });
};

// ─── Local Auth ───────────────────────────────────────────────────────────────

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ error: "Please provide name, email, and password." });

    if (password.length < 6)
      return res.status(400).json({ error: "Password must be at least 6 characters." });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ error: "An account with this email already exists." });

    const user = await User.create({ name, email, password, provider: "local" });
    sendTokenResponse(user, res, 201);
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Please provide email and password." });

    const user = await User.findOne({ email }).select("+password");
    if (!user)
      return res.status(401).json({ error: "Invalid email or password." });

    if (!user.password)
      return res.status(401).json({ error: `This account uses ${user.provider} login. Please sign in with ${user.provider}.` });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ error: "Invalid email or password." });

    sendTokenResponse(user, res);
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

// GET /api/auth/me — get current user
router.get("/me", protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ success: true, message: "Logged out successfully." });
});

// ─── Google OAuth ─────────────────────────────────────────────────────────────

// POST /api/auth/google — exchange Google access token for app JWT
router.post("/google", async (req, res) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) return res.status(400).json({ error: "Access token required." });

    // Verify with Google
    const googleRes = await axios.get(
      `https://www.googleapis.com/oauth2/v3/userinfo`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const { sub: googleId, email, name, picture } = googleRes.data;

    // Find or create user
    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    if (user) {
      if (!user.googleId) { user.googleId = googleId; await user.save(); }
    } else {
      user = await User.create({ name, email, googleId, avatar: picture, provider: "google", isVerified: true });
    }

    sendTokenResponse(user, res);
  } catch (err) {
    console.error("Google OAuth Error:", err.response?.data || err.message);
    res.status(401).json({ error: "Google authentication failed." });
  }
});

// ─── GitHub OAuth ─────────────────────────────────────────────────────────────

// POST /api/auth/github — exchange GitHub code for app JWT
router.post("/github", async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "Authorization code required." });

    // Exchange code for access token
    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } }
    );
    const { access_token } = tokenRes.data;
    if (!access_token) return res.status(401).json({ error: "GitHub authentication failed." });

    // Get user profile
    const [profileRes, emailsRes] = await Promise.all([
      axios.get("https://api.github.com/user", { headers: { Authorization: `Bearer ${access_token}` } }),
      axios.get("https://api.github.com/user/emails", { headers: { Authorization: `Bearer ${access_token}` } }),
    ]);
    const profile = profileRes.data;
    const primaryEmail = emailsRes.data.find(e => e.primary && e.verified)?.email || profile.email;

    if (!primaryEmail) return res.status(400).json({ error: "Could not get email from GitHub account." });

    let user = await User.findOne({ $or: [{ githubId: String(profile.id) }, { email: primaryEmail }] });
    if (user) {
      if (!user.githubId) { user.githubId = String(profile.id); await user.save(); }
    } else {
      user = await User.create({
        name: profile.name || profile.login,
        email: primaryEmail,
        githubId: String(profile.id),
        avatar: profile.avatar_url,
        provider: "github",
        isVerified: true,
      });
    }

    sendTokenResponse(user, res);
  } catch (err) {
    console.error("GitHub OAuth Error:");
console.error("Status:", err.response?.status);
console.error("Data:", err.response?.data);
console.error("Message:", err.message);
    res.status(401).json({ error: "GitHub authentication failed." });
  }
});

// ─── LinkedIn OAuth ───────────────────────────────────────────────────────────

// POST /api/auth/linkedin — exchange LinkedIn code for app JWT
router.post("/linkedin", async (req, res) => {
  try {
    const { code, redirectUri } = req.body;
    if (!code) return res.status(400).json({ error: "Authorization code required." });

    // Exchange code for access token
    const tokenRes = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri || process.env.LINKEDIN_REDIRECT_URI,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
    const { access_token } = tokenRes.data;

    // Get profile using OpenID Connect (LinkedIn v2)
    const profileRes = await axios.get(
      "https://api.linkedin.com/v2/userinfo",
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    const { sub: linkedinId, email, name, picture } = profileRes.data;

    let user = await User.findOne({ $or: [{ linkedinId }, { email }] });
    if (user) {
      if (!user.linkedinId) { user.linkedinId = linkedinId; await user.save(); }
    } else {
      user = await User.create({ name, email, linkedinId, avatar: picture, provider: "linkedin", isVerified: true });
    }

    sendTokenResponse(user, res);
  } catch (err) {
    console.error("LinkedIn OAuth Error:", err.response?.data || err.message);
    res.status(401).json({ error: "LinkedIn authentication failed." });
  }
});

module.exports = router;
