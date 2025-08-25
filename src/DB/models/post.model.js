import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        minLength: 3,
        trim: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    postAttachments: [{
        secure_url: String,
        public_id: String
    }],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    isDeleted: {
        type: Boolean,
        default: false
    },
    isArchived: {
        type: Boolean,
        default: false
    },
    archivedBy: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    }
},{
    toJSON: {virtuals: true},
    toObject: {virtuals: true},
    timestamps:{
        createdAt: true,
        updatedAt: true
    }
})

postSchema.virtual("comments", {
    ref: "Comment",
    localField: "_id",
    foreignField: "postId"
})

export const postModel = mongoose.models.Post || mongoose.model("Post", postSchema)
