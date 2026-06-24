import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        code: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        imageurl : {
            type:String,
        },

        logo: {
            url: {
                type: String,
                default: null,
            },
            publicId: {
                type: String,
                default: null,
            },
        },

        category : {
            type:String,
            required:true,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
    },
    { timestamps: true }
);

const Organization = mongoose.model("Organization", organizationSchema);

export default Organization;