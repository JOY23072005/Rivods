import mongoose from "mongoose";

const challengeSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    challengeType: {
      type: String,
      enum: ["daily", "weekly", "monthly", "custom"],
      default: "daily",
    },

    goalType: {
      type: String,
      enum: ["steps"],
      default: "steps",
    },

    goalValue: {
      type: Number,
      required: true,
      min: 1,
    },

    rewardCoins: {
      type: Number,
      required: true,
      min: 0,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

challengeSchema.index({
  organizationId: 1,
  isActive: 1,
});

challengeSchema.index({
  organizationId: 1,
  startDate: 1,
  endDate: 1,
});

const Challenge = mongoose.model("Challenge", challengeSchema);

export default Challenge;