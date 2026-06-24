import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
            index: true,   // important for filtering by org
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true,
        },

        phone: {
            type: String,
            required: false,
            trim: true,
            index: true,
        },

        password: {
            type: String,
            required: true,
            minlength: 6,
        },

        passwordChangedAt: {
            type: Date,
            default: null,
        },

        gender: {
            type: String,
            enum: ["Male", "Female", "Other"],
            required: true,
        },

        dob: {
            type: Date,
            required: true,
        },

        employeeId: {
            type: String,
            default: null,
        },

        roll:{
            type: String,
            default: null,
        },

        role: {
            type: String,
            default: "user",
            enum: ["admin", "sub-admin", "user"],
        },

        profileImage: {
            url: {
                type: String,
                default: null,
            },
            publicId: {
                type: String,
                default: null,
            },
        },
         // ===== FITNESS / REWARD DATA =====

        totalSteps: {
        type: Number,
        default: 0,
        min: 0,
        },

        rewardCoinsBalance: {
        type: Number,
        default: 0,
        min: 0,
        },

        totalRewardCoinsEarned: {
        type: Number,
        default: 0,
        min: 0,
        },

        totalRewardCoinsRedeemed: {
        type: Number,
        default: 0,
        min: 0,
        },

        lastSyncedAt: {
        type: Date,
        default: null,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
            },

        isActive: {
            type: Boolean,
            default: true,
            },
    },
    { timestamps: true }
);

// Compound unique index (ensures email is unique only inside the same org)
userSchema.index({ organizationId: 1, email: 1 }, { unique: true });
userSchema.index({ organizationId: 1, phone: 1 }, { unique: true });

// employee lookup
userSchema.index({
  organizationId: 1,
  employeeId: 1,
});

// admin dashboard queries
userSchema.index({
  organizationId: 1,
  role: 1,
});

// leaderboard / analytics
userSchema.index({
  organizationId: 1,
  totalSteps: -1,
});

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    // subtract 1 second to avoid race condition
    this.passwordChangedAt = new Date(Date.now() - 1000);
});

const User = mongoose.model("User", userSchema);

export default User;
