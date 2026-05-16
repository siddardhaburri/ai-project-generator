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

Return ONLY valid JSON in this EXACT format (no markdown, no extra text, no code fences):

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
    "backend": ["Node.js"],
    "database": ["MongoDB"],
    "tools": ["npm"],
    "apis": []
  },
  "githubStructure": {
    "folders": ["src", "src/components", "src/pages", "public"],
    "files": ["README.md", "package.json", "src/index.js", "src/App.js"],
    "readme": "# Project Title\\n\\nDescription here.\\n\\n## Setup\\n\\nnpm install && npm start"
  },
  "fileContents": {
    "README.md": "# Project Title\\n\\nFull readme content here with setup instructions.",
    "package.json": "{\\n  \\"name\\": \\"project-name\\",\\n  \\"version\\": \\"1.0.0\\",\\n  \\"scripts\\": { \\"start\\": \\"node src/index.js\\" },\\n  \\"dependencies\\": {}\\n}",
    "src/index.js": "// Entry point\\nconsole.log('Hello World');",
    "src/App.js": "// Main application file\\n// Add your code here"
  },
  "sampleCode": {
    "filename": "src/App.js",
    "language": "JavaScript",
    "code": "// Full working sample code for the main file\\n// with real implementation",
    "explanation": "Brief explanation of what this code does"
  },
  "tags": ["tag1", "tag2"]
}

IMPORTANT RULES:
1. fileContents must have REAL, WORKING code for EVERY file listed in githubStructure.files
2. The code must be actual implementation code, not placeholder comments
3. sampleCode.code must be a complete working implementation of the main feature
4. All string values with newlines must use \\n (escaped newlines) since this is JSON
5. Do not use actual newlines inside JSON string values`;
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
      parsed.githubStructure = parsed.githubStructure || { folders: [], files: [] };
      parsed.sampleCode = parsed.sampleCode || {};
      // Ensure fileContents is a plain object mapping filename -> code
      if (!parsed.fileContents || Array.isArray(parsed.fileContents) || typeof parsed.fileContents !== 'object') {
        parsed.fileContents = {};
      }
      // Mirror sampleCode into fileContents so it's always included in the zip
      if (parsed.sampleCode?.filename && parsed.sampleCode?.code) {
        parsed.fileContents[parsed.sampleCode.filename] =
          parsed.fileContents[parsed.sampleCode.filename] || parsed.sampleCode.code;
      }
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