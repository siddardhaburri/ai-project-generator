const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Project = require("../models/Project");

// GET /api/projects — list with filters
router.get("/", async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search = "",
      difficulty = "",
      domain = "",
      techStack = "",
      saved = "",
      liked = "",
      sortBy = "newest",
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const query = {};

    if (search.trim()) {
      query.$or = [
        { "projectIdea.title": { $regex: search, $options: "i" } },
        { userInput: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }
    if (difficulty) query["projectIdea.difficulty"] = difficulty;
    if (domain) query.domainTags = { $in: [new RegExp(domain, "i")] };
    if (saved === "true") query.saved = true;
    if (liked === "true") query.liked = true;
    if (techStack) {
      const stackArr = techStack.split(",").map((s) => s.trim());
      query.$or = [
        ...(query.$or || []),
        { "techStack.frontend": { $in: stackArr } },
        { "techStack.backend": { $in: stackArr } },
      ];
    }

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      popular: { upvotes: -1 },
      title: { "projectIdea.title": 1 },
    };

    const projects = await Project.find(query)
      .sort(sortMap[sortBy] || { createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("userInput projectIdea tags domainTags liked saved upvotes createdAt techStack difficulty teamSize shareSlug remixCount remixedFrom");

    const total = await Project.countDocuments(query);

    res.json({ success: true, data: projects, pagination: { total, page, pages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error("Fetch Projects Error:", error);
    res.status(500).json({ error: "Failed to fetch projects." });
  }
});

// GET /api/projects/gallery — community gallery (public projects)
router.get("/gallery", async (req, res) => {
  try {
    const { page = 1, limit = 12, sortBy = "popular" } = req.query;
    const sortMap = { popular: { upvotes: -1 }, newest: { createdAt: -1 }, remixed: { remixCount: -1 } };
    const projects = await Project.find({ isPublic: true })
      .sort(sortMap[sortBy] || { upvotes: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .select("projectIdea tags domainTags upvotes remixCount createdAt techStack shareSlug");

    const total = await Project.countDocuments({ isPublic: true });
    res.json({ success: true, data: projects, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch gallery" });
  }
});

// GET /api/projects/share/:slug — get project by share slug
router.get("/share/:slug", async (req, res) => {
  try {
    const project = await Project.findOne({ shareSlug: req.params.slug });
    if (!project) return res.status(404).json({ error: "Shared project not found." });
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch shared project." });
  }
});

// GET /api/projects/:id — single project
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid project ID." });
    }
    const project = await Project.findById(req.params.id).populate("remixedFrom", "projectIdea.title");
    if (!project) return res.status(404).json({ error: "Project not found." });
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch project." });
  }
});

// PATCH /api/projects/:id/like
router.patch("/:id/like", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found." });
    project.liked = !project.liked;
    await project.save();
    res.json({ success: true, liked: project.liked });
  } catch (error) {
    res.status(500).json({ error: "Failed to update like." });
  }
});

// PATCH /api/projects/:id/save
router.patch("/:id/save", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found." });
    project.saved = !project.saved;
    await project.save();
    res.json({ success: true, saved: project.saved });
  } catch (error) {
    res.status(500).json({ error: "Failed to update save." });
  }
});

// PATCH /api/projects/:id/upvote — community upvote
router.patch("/:id/upvote", async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $inc: { upvotes: 1 } },
      { new: true }
    );
    if (!project) return res.status(404).json({ error: "Project not found." });
    res.json({ success: true, upvotes: project.upvotes });
  } catch (error) {
    res.status(500).json({ error: "Failed to upvote." });
  }
});

// POST /api/projects/:id/remix — fork/remix a project
router.post("/:id/remix", async (req, res) => {
  try {
    const original = await Project.findById(req.params.id);
    if (!original) return res.status(404).json({ error: "Project not found." });

    const { nanoid } = require("nanoid");
    const remixedProject = new Project({
      ...original.toObject(),
      _id: new mongoose.Types.ObjectId(),
      userInput: `Remix of: ${original.userInput}`,
      "projectIdea.title": `${original.projectIdea?.title} (Remix)`,
      remixedFrom: original._id,
      liked: false,
      saved: false,
      upvotes: 0,
      remixCount: 0,
      shareSlug: nanoid(10),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await remixedProject.save();
    await Project.findByIdAndUpdate(req.params.id, { $inc: { remixCount: 1 } });

    res.json({ success: true, data: remixedProject });
  } catch (err) {
    res.status(500).json({ error: "Failed to remix project." });
  }
});

// DELETE /api/projects/:id
router.delete("/:id", async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found." });
    res.json({ success: true, message: "Project deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete project." });
  }
});

module.exports = router;