import mongoose from "mongoose";

const challengeProgressSchema = new mongoose.Schema(
  {
    challengeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Challenge",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    // User enrolled in challenge
    joinedAt: {
      type: Date,
      default: Date.now,
    },

    // Current challenge progress
    currentValue: {
      type: Number,
      default: 0,
      min: 0,
    },

    isCompleted: {
      type: Boolean,
      default: false,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    rewardGranted: {
      type: Boolean,
      default: false,
    },

    lastUpdatedAt: {
      type: Date,
      default: Date.now,
    },

    startingSteps: {
      type: String,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

challengeProgressSchema.index(
  {
    challengeId: 1,
    userId: 1,
  },
  {
    unique: true,
  }
);

challengeProgressSchema.index({
  userId: 1,
});

challengeProgressSchema.index({
  challengeId: 1,
});

challengeProgressSchema.index({
  userId: 1,
  isCompleted: 1,
});

const ChallengeProgress = mongoose.model(
  "ChallengeProgress",
  challengeProgressSchema
);

export default ChallengeProgress;