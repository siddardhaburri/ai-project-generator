const express = require("express");
const router = express.Router();
const Project = require("../models/Project");

// POST /api/generate
router.post("/", async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic || topic.trim().length < 3) {
      return res.status(400).json({
        error: "Please provide a valid project topic",
      });
    }

    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

    const prompt = `You are an expert software engineering mentor. A student wants to build a mini project on: "${topic}"

Return ONLY JSON in this EXACT format (no markdown, no extra text):

{
  "projectIdea": {
    "title": "Project Title",
    "description": "Short description",
    "difficulty": "Beginner",
    "estimatedTime": "2-3 weeks"
  },
  "features": [
    {"name": "Feature", "description": "desc", "priority": "Must Have"}
  ],
  "techStack": {
    "frontend": ["React"],
    "backend": ["Node"],
    "database": ["MongoDB"]
  },
  "githubStructure": {
    "folders": ["/client", "/server", "/server/models", "/server/routes"],
    "files": ["README.md", "package.json", "/server/server.js"]
  },
  "tags": ["ai", "project"]
}`;
    // ✅ Gemini API (WORKING MODEL)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      console.error("Gemini Error:", err);
      return res.status(500).json({ error: "Gemini API failed" });
    }

    const data = await response.json();

    const rawText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    let parsed;

    try {
      const cleaned = rawText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      parsed = JSON.parse(cleaned);
      parsed.githubStructure = parsed.githubStructure || {
  folders: [],
  files: []
};
    } catch (err) {
      console.log("Parse Error:", rawText);
      return res.status(500).json({ error: "Invalid AI JSON response" });
    }

    // ✅ Save to DB
    const project = new Project({
      userInput: topic,
      ...parsed,
    });

    await project.save();

    res.json({
      success: true,
      data: project,
    });

  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;