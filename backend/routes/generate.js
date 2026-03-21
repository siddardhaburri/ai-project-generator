const express = require("express");
const router = express.Router();
const Project = require("../models/Project");

// POST /api/generate
router.post("/", async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic || topic.trim().length < 3) {
      return res.status(400).json({ error: "Please provide a valid project topic (min 3 characters)." });
    }

    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Google Gemini API key not configured." });
    }

    const prompt = `You are an expert software engineering mentor. A student wants to build a mini project on: "${topic}"

Generate a complete, detailed project plan. Respond ONLY with valid JSON (no markdown, no extra text) in exactly this structure:

{
  "projectIdea": {
    "title": "Project Title",
    "description": "2-3 sentence description of what this project does",
    "difficulty": "Beginner",
    "estimatedTime": "2-3 weeks"
  },
  "features": [
    {"name": "Feature Name", "description": "What this feature does", "priority": "Must Have"},
    {"name": "Feature Name", "description": "What this feature does", "priority": "Should Have"},
    {"name": "Feature Name", "description": "What this feature does", "priority": "Nice to Have"},
    {"name": "Feature Name", "description": "What this feature does", "priority": "Must Have"},
    {"name": "Feature Name", "description": "What this feature does", "priority": "Should Have"}
  ],
  "techStack": {
    "frontend": ["React.js", "Tailwind CSS"],
    "backend": ["Node.js", "Express.js"],
    "database": ["MongoDB", "Mongoose"],
    "tools": ["VS Code", "Git", "Postman"],
    "apis": ["Relevant API names if any"]
  },
  "githubStructure": {
    "folders": ["/client", "/server", "/server/models", "/server/routes", "/server/controllers"],
    "files": ["README.md", ".env.example", "package.json", "/server/server.js", "/client/src/App.jsx"],
    "readme": "## Project Title\\n\\nShort description\\n\\n## Setup\\n1. Clone repo\\n2. npm install\\n3. Set .env\\n4. npm run dev"
  },
  "sampleCode": {
    "filename": "relevant-filename.js",
    "language": "javascript",
    "code": "// Sample code here (20-30 lines of actual working code for the most important feature)",
    "explanation": "Brief explanation of what this code does"
  },
  "tags": ["tag1", "tag2", "tag3"]
}`;

    // Call Google Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 3000,
          },
        }),
      }
    );

    if (!response.ok) {
      const errData = await response.json();
      console.error("Gemini API Error:", errData);
      return res.status(502).json({ error: "Failed to get response from Gemini API. Check your API key." });
    }

    const geminiData = await response.json();
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return res.status(502).json({ error: "Empty response from Gemini API." });
    }

    // Parse JSON from response
    let parsed;
    try {
      const cleaned = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("JSON Parse Error:", parseErr, "Raw:", rawText.substring(0, 500));
      return res.status(502).json({ error: "Failed to parse AI response. Please try again." });
    }

    // Save to MongoDB
    const project = new Project({
      userInput: topic,
      ...parsed,
    });

    await project.save();

    res.status(201).json({
      success: true,
      message: "Project generated successfully!",
      data: project,
    });
  } catch (error) {
    console.error("Generate Error:", error);
    res.status(500).json({ error: "Server error. Please try again." });
  }
});

module.exports = router;
