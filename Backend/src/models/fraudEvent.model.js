import mongoose from "mongoose";

const fraudEventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    deviceId: {
      type: String,
      default: null,
      index: true,
    },

    eventType: {
      type: String,
      enum: [
        "DEVICE_SHARED",
        "STEP_DUPLICATION",
        "MULTIPLE_ACCOUNT_LOGIN",
        "ACCOUNT_SWITCH",
        "MULTIPLE_ORGANIZATION_USAGE",
        "MANUAL_REPORT",
      ],
      required: true,
    },

    score: {
      type: Number,
      required: true,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    resolved: {
      type: Boolean,
      default: false,
    },

    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    resolvedAt: Date,

    notes: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "FraudEvent",
  fraudEventSchema
);