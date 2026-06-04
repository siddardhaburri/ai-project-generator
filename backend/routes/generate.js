const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const { protect } = require("../middleware/auth");
const { nanoid } = require("nanoid");

// ─── Helper: call Gemini API ──────────────────────────────────────────────────
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

// ─── POST /api/generate ───────────────────────────────────────────────────────
router.post("/", protect, async (req, res) => {
  try {
    const {
      topic,
      difficulty = "Beginner",
      techStackFilter = [],
      teamSize = 1,
      domain = "",
    } = req.body;

    if (!topic || topic.trim().length < 3) {
      return res.status(400).json({ error: "Please provide a valid project topic" });
    }

    const stackHint = techStackFilter.length > 0 ? `Preferred tech stack: ${techStackFilter.join(", ")}.` : "";
    const domainHint = domain ? `Domain/Subject: ${domain}.` : "";
    const teamHint = teamSize > 1 ? `Team size: ${teamSize} people.` : "Solo project.";

    const prompt = [
      `You are an expert software engineering mentor. A ${difficulty}-level student wants to build a project on: "${topic}"`,
      stackHint, domainHint, teamHint,
      "",
      "Return ONLY valid JSON with no markdown, no extra text. Use this EXACT structure:",
      "",
      "{",
      '  "projectIdea": {',
      '    "title": "Project Title",',
      '    "description": "2-3 sentence description of what the project does",',
      `    "difficulty": "${difficulty}",`,
      '    "estimatedTime": "3-4 weeks",',
      "    \"estimatedHours\": 40,",
      `    "teamSize": ${teamSize},`,
      `    "domain": "${domain || "Web Development"}"`,
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
      '    "apis": []',
      "  },",
      '  "roadmap": [',
      '    {"order": 1, "title": "Project Setup", "description": "Initialize project", "tasks": ["Create project structure", "Install dependencies", "Configure environment"], "estimatedDays": 2},',
      '    {"order": 2, "title": "Core Features", "description": "Build main functionality", "tasks": ["Build UI", "Create API routes", "Add database models"], "estimatedDays": 5},',
      '    {"order": 3, "title": "Polish and Deploy", "description": "Finalize and deploy", "tasks": ["Add error handling", "Write README", "Deploy"], "estimatedDays": 3}',
      "  ],",
      '  "githubStructure": {',
      '    "folders": ["/client", "/client/src", "/client/src/components", "/server", "/server/models", "/server/routes"],',
      '    "files": ["README.md", "package.json", ".env.example", "/server/server.js", "/client/src/App.jsx"],',
      '    "readme": "# Project Title\\n\\nDescription\\n\\n## Setup\\n```bash\\nnpm install\\nnpm run dev\\n```"',
      "  },",
      '  "sampleCode": {',
      '    "filename": "server.js",',
      '    "language": "javascript",',
      `    "code": "write 40-80 lines of REAL working Express/Node.js code specific to: ${topic}",`,
      '    "explanation": "Short explanation of what this code does"',
      "  },",
      '  "htmlPreview": "FULL single-file HTML page demonstrating the project — see instructions below",',
      '  "resumeBullets": [',
      '    "Built a full-stack application using React and Node.js",',
      '    "Designed REST API with Express and MongoDB",',
      '    "Deployed to production using Vercel and Render"',
      "  ],",
      '  "tags": ["react", "nodejs"],',
      `  "domainTags": ["${domain || "Web Dev"}"]`,
      "}",
      "",
      "=== CRITICAL INSTRUCTIONS FOR htmlPreview ===",
      `The htmlPreview must be a COMPLETE single-file HTML page demonstrating: ${topic}`,
      "- Full HTML5 with embedded CSS and JS",
      "- Interactive demo with real working logic (buttons DO things, forms work)",
      "- Modern styling with colors and cards",
      "- Minimum 100 lines HTML, 40 lines CSS, 30 lines JS",
      "- Escape all double quotes with backslash inside the JSON string",
      "- Entire HTML on a SINGLE line (replace newlines with \\n)",
      "=== END INSTRUCTIONS ===",
    ].filter(Boolean).join("\n");

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

    const shareSlug = nanoid(10);

    const project = new Project({
      userInput: topic,
      difficulty,
      techStackFilter,
      teamSize,
      domain,
      shareSlug,
      userId: req.user._id, // associate with logged-in user
      ...parsed,
    });

    await project.save();
    res.json({ success: true, data: project });
  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// ─── POST /api/generate/starter-code (protected) ─────────────────────────────
router.post("/starter-code", protect, async (req, res) => {
  try {
    const { projectId } = req.body;
    if (!projectId) return res.status(400).json({ error: "projectId is required" });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    const title = project.projectIdea?.title || "My Project";
    const description = project.projectIdea?.description || "";
    const tech = project.techStack || {};
    const frontend = (tech.frontend || []).join(", ") || "React";
    const backend = (tech.backend || []).join(", ") || "Node.js, Express";
    const database = (tech.database || []).join(", ") || "MongoDB";
    const features = (project.features || []).slice(0, 4).map(f => f.name).join(", ");

    const prompt = [
      "You are a senior software engineer. Generate complete working boilerplate code for this project:",
      "",
      `Project: "${title}"`,
      `Description: "${description}"`,
      `Frontend: ${frontend}`,
      `Backend: ${backend}`,
      `Database: ${database}`,
      `Key Features: ${features}`,
      "",
      "Return ONLY a valid JSON array of exactly 5 files. No markdown, no extra text.",
      "",
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
      `2. Every file must be SPECIFIC to: ${title}`,
      "3. Include all imports, proper error handling, meaningful variable names",
      "4. server.js: Express server with real route handlers for this project's features",
      "5. App.jsx: Real React component with useState, useEffect, fetch calls to the API",
      "6. model.js: Mongoose schema with fields that match this project's data",
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

    res.json({ success: true, files });
  } catch (err) {
    console.error("Starter code error:", err);
    res.status(500).json({ error: "Failed to generate starter code: " + err.message });
  }
});

// ─── POST /api/generate/chat — AI mentor (protected) ─────────────────────────
router.post("/chat", protect, async (req, res) => {
  try {
    const { messages, projectContext } = req.body;

    const systemContext = projectContext
      ? `You are an expert AI mentor helping a student build: "${projectContext.title}" (${projectContext.difficulty} level, stack: ${JSON.stringify(projectContext.techStack)}). Be concise, encouraging, and practical. Give code snippets when helpful.`
      : "You are an expert software engineering mentor. Be concise, encouraging, and practical.";

    const conversation = messages.map(m =>
      `${m.role === "user" ? "Student" : "Mentor"}: ${m.content}`
    ).join("\n");

    const raw = await callGemini(`${systemContext}\n\nConversation:\n${conversation}\n\nMentor:`);
    res.json({ success: true, reply: raw });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Chat failed" });
  }
});

// ─── POST /api/generate/resume-bullets (protected) ───────────────────────────
router.post("/resume-bullets", protect, async (req, res) => {
  try {
    const { projectId } = req.body;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    const stack = Object.values(project.techStack || {}).flat().join(", ");
    const prompt = `Generate 5 strong resume bullet points for a student who completed: "${project.projectIdea?.title}".
Tech stack used: ${stack}.
Each bullet should start with a strong action verb, include metrics where possible, and highlight impact.
Return ONLY JSON: {"bullets": ["bullet1", "bullet2", "bullet3", "bullet4", "bullet5"]}`;

    const raw = await callGemini(prompt);
    const parsed = JSON.parse(raw);

    project.resumeBullets = parsed.bullets;
    await project.save();

    res.json({ success: true, bullets: parsed.bullets });
  } catch (err) {
    console.error("Resume bullets error:", err);
    res.status(500).json({ error: "Resume bullet generation failed" });
  }
});

// ─── POST /api/generate/regenerate-card (protected) ──────────────────────────
router.post("/regenerate-card", protect, async (req, res) => {
  try {
    const { projectId, section } = req.body;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    const prompt = `Suggest a NEW alternative ${section} for project "${project.projectIdea?.title}" (${project.projectIdea?.difficulty} level).
Return ONLY a JSON object with key "${section}" containing an array/object replacement. No markdown.`;

    const raw = await callGemini(prompt);
    const parsed = JSON.parse(raw);

    if (section === "features" && parsed.features) project.features = parsed.features;
    if (section === "techStack" && parsed.techStack) project.techStack = parsed.techStack;
    if (section === "roadmap" && parsed.roadmap) project.roadmap = parsed.roadmap;

    await project.save();
    res.json({ success: true, data: project });
  } catch (err) {
    console.error("Regenerate error:", err);
    res.status(500).json({ error: "Failed to regenerate section" });
  }
});

module.exports = router;