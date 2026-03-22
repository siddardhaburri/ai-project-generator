const express = require("express");
const router = express.Router();
const { generateProject } = require("../controllers/generateController");

// POST /api/generate
router.post("/", generateProject);

module.exports = router;