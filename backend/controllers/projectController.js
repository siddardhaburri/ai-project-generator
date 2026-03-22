const mongoose = require("mongoose");
const Project = require("../models/Project");

const getProjects = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "" } = req.query;

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

    const projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("userInput projectIdea tags liked saved createdAt");

    const total = await Project.countDocuments(query);

    res.json({
      success: true,
      data: projects,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error("Fetch Projects Error:", error);
    res.status(500).json({ error: "Failed to fetch projects." });
  }
};

const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid project ID." });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ error: "Project not found." });
    }

    res.json({ success: true, data: project });

  } catch (error) {
    console.error("Get Project Error:", error);
    res.status(500).json({ error: "Failed to fetch project." });
  }
};

const likeProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ error: "Project not found." });
    }

    project.liked = !project.liked;
    await project.save();

    res.json({
      success: true,
      liked: project.liked,
    });

  } catch (error) {
    console.error("Like Error:", error);
    res.status(500).json({ error: "Failed to update like." });
  }
};

const saveProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ error: "Project not found." });
    }

    project.saved = !project.saved;
    await project.save();

    res.json({
      success: true,
      saved: project.saved,
    });

  } catch (error) {
    console.error("Save Error:", error);
    res.status(500).json({ error: "Failed to update save." });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return res.status(404).json({ error: "Project not found." });
    }

    res.json({
      success: true,
      message: "Project deleted successfully.",
    });

  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ error: "Failed to delete project." });
  }
};

module.exports = {
  getProjects,
  getProjectById,
  likeProject,
  saveProject,
  deleteProject
};
