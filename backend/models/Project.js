const mongoose = require("mongoose");

const milestoneSchema = new mongoose.Schema({
  title: String,
  description: String,
  tasks: [String],
  estimatedDays: Number,
  order: Number,
});

const projectSchema = new mongoose.Schema(
  {
    userInput: { type: String, required: true, trim: true },
    difficulty: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], default: "Beginner" },
    techStackFilter: [String],
    teamSize: { type: Number, default: 1 },
    domain: { type: String, default: "" },

    projectIdea: {
      title: String,
      description: String,
      difficulty: { type: String, enum: ["Beginner", "Intermediate", "Advanced"] },
      estimatedTime: String,
      estimatedHours: Number,
      teamSize: Number,
      domain: String,
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

    roadmap: [milestoneSchema],

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

    resumeBullets: [String],

    liked: { type: Boolean, default: false },
    saved: { type: Boolean, default: false },
    upvotes: { type: Number, default: 0 },
    remixCount: { type: Number, default: 0 },
    remixedFrom: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null },
    isPublic: { type: Boolean, default: true },
    shareSlug: { type: String, unique: true, sparse: true },
    completedAt: Date,

    tags: [String],
    domainTags: [String],
  },
  { timestamps: true }
);

projectSchema.index({ "projectIdea.difficulty": 1 });
projectSchema.index({ domainTags: 1 });
projectSchema.index({ tags: 1 });
projectSchema.index({ shareSlug: 1 });

module.exports = mongoose.model("Project", projectSchema);