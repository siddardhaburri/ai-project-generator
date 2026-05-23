const express = require("express");
const router = express.Router();
const Project = require("../models/Project");

// Helper: call Gemini API
async function callGemini(prompt) {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  );
  if (!response.ok) {
    const err = await response.json();
    throw new Error("Gemini API error: " + JSON.stringify(err));
  }
  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return rawText.replace(/```json/g, "").replace(/```/g, "").trim();
}

// POST /api/generate
router.post("/", async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic || topic.trim().length < 3) {
      return res.status(400).json({ error: "Please provide a valid project topic" });
    }

    const prompt = [
      'You are an expert software engineering mentor. A student wants to build a mini project on: "' + topic + '"',
      "",
      "Return ONLY valid JSON with no markdown, no extra text. Use this EXACT structure:",
      "",
      "{",
      '  "projectIdea": {',
      '    "title": "Project Title",',
      '    "description": "2-3 sentence description of what the project does",',
      '    "difficulty": "Beginner",',
      '    "estimatedTime": "2-3 weeks"',
      "  },",
      '  "features": [',
      '    {"name": "Feature Name", "description": "What it does", "priority": "Must Have"},',
      '    {"name": "Feature Name", "description": "What it does", "priority": "Should Have"},',
      '    {"name": "Feature Name", "description": "What it does", "priority": "Nice to Have"}',
      "  ],",
      '  "techStack": {',
      '    "frontend": ["React", "CSS"],',
      '    "backend": ["Node.js", "Express"],',
      '    "database": ["MongoDB"],',
      '    "tools": ["VS Code", "Git"],',
      '    "apis": ["Relevant API"]',
      "  },",
      '  "roadmap": [',
      '    {"order": 1, "title": "Project Setup", "description": "Initialize project", "tasks": ["Create project structure", "Install dependencies", "Configure environment"], "estimatedDays": 2},',
      '    {"order": 2, "title": "Core Features", "description": "Build main functionality", "tasks": ["Build UI", "Create API routes", "Add database models"], "estimatedDays": 5},',
      '    {"order": 3, "title": "Polish and Deploy", "description": "Finalize and deploy", "tasks": ["Add error handling", "Write README", "Deploy"], "estimatedDays": 3}',
      "  ],",
      '  "githubStructure": {',
      '    "folders": ["/client", "/client/src", "/client/src/components", "/server", "/server/models", "/server/routes"],',
      '    "files": ["README.md", "package.json", ".env.example", "/server/server.js", "/server/models/Item.js", "/server/routes/api.js", "/client/src/App.jsx"],',
      '    "readme": "# Project Title - description - Setup: npm install then npm run dev - Features: list them"',
      "  },",
      '  "sampleCode": {',
      '    "filename": "server.js",',
      '    "language": "javascript",',
      '    "code": "write 40-80 lines of REAL working Express/Node.js code specific to the project topic: ' + topic + '",',
      '    "explanation": "Short explanation of what this code does"',
      "  },",
      '  "htmlPreview": "FULL single-file HTML here — see instructions below",',
      '  "resumeBullets": [',
      '    "Built a full-stack project using React and Node.js",',
      '    "Designed REST API with Express and MongoDB",',
      '    "Integrated external API to deliver specific results"',
      "  ],",
      '  "tags": ["react", "nodejs"],',
      '  "domainTags": ["Web Dev"]',
      "}",
      "",
      "=== CRITICAL INSTRUCTIONS FOR htmlPreview ===",
      "The htmlPreview field must be a COMPLETE, working, single-file HTML page that actually demonstrates the project: " + topic,
      "Requirements:",
      "- Full HTML5 page with <!DOCTYPE html>, head, body",
      "- Embedded CSS with nice modern styling (colors, cards, responsive)",
      "- Embedded JavaScript with REAL working demo logic specific to: " + topic,
      "- Must be interactive — buttons should DO something, forms should work with JS",
      "- If it is a weather app: show a fake weather UI with JS toggle between cities",
      "- If it is a todo app: show a working todo list where you can add/remove items",
      "- If it is a calculator: build a working calculator",
      "- If it is a quiz app: show 2-3 sample questions with scoring",
      "- If it is a chatbot: show a chat UI with hardcoded sample responses",
      "- Minimum 100 lines of HTML, at least 40 lines of CSS, at least 30 lines of JS",
      "- The JS must actually work — no placeholder functions",
      "- Escape all double quotes inside the HTML string with backslash",
      "- The entire HTML must be on a SINGLE line (replace newlines with \\n)",
      "=== END INSTRUCTIONS ===",
      "",
      "CRITICAL for sampleCode.code:",
      '- Write 40-80 lines of REAL, working code for: "' + topic + '"',
      "- Include actual logic, imports, real variable names — NOT just comments",
    ].join("\n");

    const raw = await callGemini(prompt);

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.error("Parse Error:", raw.slice(0, 400));
      return res.status(500).json({ error: "AI returned invalid JSON. Please try again." });
    }

    // Ensure all required fields exist
    parsed.githubStructure = parsed.githubStructure || { folders: [], files: [], readme: "" };
    parsed.sampleCode = parsed.sampleCode || { filename: "main.js", language: "javascript", code: "", explanation: "" };
    parsed.roadmap = parsed.roadmap || [];
    parsed.resumeBullets = parsed.resumeBullets || [];
    parsed.htmlPreview = parsed.htmlPreview || "";

    const project = new Project({ userInput: topic, ...parsed });
    await project.save();

    res.json({ success: true, data: project });
  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// POST /api/generate/starter-code
router.post("/starter-code", async (req, res) => {
  try {
    const { projectId } = req.body;
    if (!projectId) return res.status(400).json({ error: "projectId is required" });

   const project = await Project.findById(projectId);
    
    if (!project) return res.status(404).json({ error: "Project not found" });

    const title = (project.projectIdea && project.projectIdea.title) || "My Project";
    const description = (project.projectIdea && project.projectIdea.description) || "";
    const tech = project.techStack || {};
    const frontend = (tech.frontend || []).join(", ") || "React";
    const backend = (tech.backend || []).join(", ") || "Node.js, Express";
    const database = (tech.database || []).join(", ") || "MongoDB";
    const features = (project.features || []).slice(0, 4).map(function (f) { return f.name; }).join(", ");

    const prompt = [
      "You are a senior software engineer. Generate complete working boilerplate code for this project:",
      "",
      'Project: "' + title + '"',
      'Description: "' + description + '"',
      "Frontend: " + frontend,
      "Backend: " + backend,
      "Database: " + database,
      "Key Features: " + features,
      "",
      "Return ONLY a valid JSON array of exactly 5 files. No markdown, no extra text.",
      "",
      "Format:",
      "[",
      '  {"filename": "server.js", "language": "javascript", "code": "full working code min 40 lines"},',
      '  {"filename": "App.jsx", "language": "jsx", "code": "full working React component min 40 lines"},',
      '  {"filename": "model.js", "language": "javascript", "code": "full Mongoose model min 20 lines"},',
      '  {"filename": "routes.js", "language": "javascript", "code": "full API routes min 40 lines"},',
      '  {"filename": "README.md", "language": "markdown", "code": "complete README with setup steps"}',
      "]",
      "",
      "RULES:",
      "1. Code must be REAL and WORKING — no TODO placeholders",
      "2. Every file must be SPECIFIC to: " + title,
      "3. Include all imports, proper error handling, meaningful variable names",
      "4. server.js: Express server with real route handlers for this project features",
      "5. App.jsx: Real React component with useState, useEffect, fetch calls to your API",
      "6. model.js: Mongoose schema with fields that match this project data",
      "7. routes.js: All CRUD routes with real logic",
      "8. README.md: Project name, description, npm install steps, env vars, how to run",
    ].join("\n");

    const raw = await callGemini(prompt);

    let files;
    try {
      files = JSON.parse(raw);
      if (!Array.isArray(files)) throw new Error("Response is not an array");
    } catch (err) {
      console.error("Starter code parse error:", raw.slice(0, 300));
      return res.status(500).json({ error: "Failed to parse generated code. Please try again." });
    }

    res.json({ success: true, files: files });
  } catch (err) {
    console.error("Starter code error:", err);
    res.status(500).json({ error: "Failed to generate starter code: " + err.message });
  }
});

module.exports = router;