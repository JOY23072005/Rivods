import mongoose from "mongoose";

const dailyStepLogSchema = new mongoose.Schema(
{
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

    date: {
        type: String,
        required: true,
    },

    steps: {
        type: Number,
        required: true,
        min: 0,
    },

    coinsEarned: {
        type: Number,
        required: true,
        default: 0,
    },
},
{
    timestamps: true,
}
);

// one log per day
dailyStepLogSchema.index(
{
    userId: 1,
    date: 1,
},
{
    unique: true,
}
);

const DailyStepLog = mongoose.model(
    "DailyStepLog",
    dailyStepLogSchema
);

export default DailyStepLog;