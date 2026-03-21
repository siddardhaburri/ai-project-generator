const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    userInput: {
      type: String,
      required: true,
      trim: true,
    },
    projectIdea: {
      title: String,
      description: String,
      difficulty: { type: String, enum: ["Beginner", "Intermediate", "Advanced"] },
      estimatedTime: String,
    },
    features: [
      {
        name: String,
        description: String,
        priority: { type: String, enum: ["Must Have", "Should Have", "Nice to Have"] },
      },
    ],
    techStack: {
      frontend: [String],
      backend: [String],
      database: [String],
      tools: [String],
      apis: [String],
    },
    githubStructure: {
      folders: [String],
      files: [String],
      readme: String,
    },
    sampleCode: {
      filename: String,
      language: String,
      code: String,
      explanation: String,
    },
    liked: { type: Boolean, default: false },
    saved: { type: Boolean, default: false },
    tags: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
