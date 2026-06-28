import mongoose from "mongoose";

const redemptionSchema = new mongoose.Schema(
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

    rewardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RewardCatalog",
        required: true,
    },

    status: {
        type: String,
        enum: ["PENDING", "CLAIMED", "CANCELLED"],
        default: "PENDING",
    },

    coinsUsed: {
        type: Number,
        required: true,
    },

    claimedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // shopkeeper/admin
        default: null,
    },
},
{
    timestamps: true,
}
);

// user history
redemptionSchema.index({
    userId: 1,
    createdAt: -1,
});

const Redemption = mongoose.model(
    "Redemption",
    redemptionSchema
);

export default Redemption;