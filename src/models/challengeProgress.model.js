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
  },
  { timestamps: true }
);

challengeProgressSchema.index(
  {
    challengeId: 1,
    userId: 1,
  },
  { unique: true }
);

challengeProgressSchema.index({
  userId: 1,
  isCompleted: 1,
});

const ChallengeProgress = mongoose.model(
  "ChallengeProgress",
  challengeProgressSchema
);

export default ChallengeProgress;