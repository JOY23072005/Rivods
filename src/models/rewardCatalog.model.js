import mongoose from "mongoose";

const rewardCatalogSchema = new mongoose.Schema(
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

    coinCost: {
      type: Number,
      required: true,
      min: 1,
    },

    image: {
      url: {
        type: String,
        default: null,
      },

      publicId: {
        type: String,
        default: null,
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

rewardCatalogSchema.index({
    organizationId: 1,
    isActive: 1,
});

const RewardCatalog = mongoose.model(
    "RewardCatalog",
    rewardCatalogSchema
);

export default RewardCatalog;