const express = require("express");
const router = express.Router();
const {
  getProjects,
  getProjectById,
  likeProject,
  saveProject,
  deleteProject
} = require("../controllers/projectController");

router.get("/", getProjects);

router.get("/:id", getProjectById);

router.patch("/:id/like", likeProject);

router.patch("/:id/save", saveProject);

router.delete("/:id", deleteProject);

module.exports = router;