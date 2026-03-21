const express = require("express");
const router = express.Router();
const Project = require("../models/Project");

// GET /api/projects - Get all saved projects
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { "projectIdea.title": { $regex: search, $options: "i" } },
        { userInput: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select("userInput projectIdea tags liked saved createdAt");

    const total = await Project.countDocuments(query);

    res.json({
      success: true,
      data: projects,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch projects." });
  }
});

// GET /api/projects/:id - Get single project
router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found." });
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch project." });
  }
});

// PATCH /api/projects/:id/like - Toggle like
router.patch("/:id/like", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found." });
    project.liked = !project.liked;
    await project.save();
    res.json({ success: true, liked: project.liked });
  } catch (error) {
    res.status(500).json({ error: "Failed to update." });
  }
});

// PATCH /api/projects/:id/save - Toggle save
router.patch("/:id/save", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found." });
    project.saved = !project.saved;
    await project.save();
    res.json({ success: true, saved: project.saved });
  } catch (error) {
    res.status(500).json({ error: "Failed to update." });
  }
});

// DELETE /api/projects/:id - Delete project
router.delete("/:id", async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Project deleted." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete." });
  }
});

module.exports = router;
