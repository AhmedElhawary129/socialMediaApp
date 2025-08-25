import mongoose from "mongoose";
import { onModelTypes } from "../enums.js";


const commentSchema = new mongoose.Schema({
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
    refId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "onModrl",
        required: true
    },
    onModel: {
        type: String,
        required: true,
        enum: Object.values(onModelTypes)
    },
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    commentAttachment: {
        secure_url: String,
        public_id: String
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    isDeleted: {
        type: Boolean,
        default: false
    }
},{
    toJSON:{virtuals: true},
    toObject:{virtuals: true},
    timestamps:{
        createdAt: true,
        updatedAt: true
    }
})

commentSchema.virtual("Replies", {
    ref: "Comment",
    localField: "_id",
    foreignField: "refId",
})

export const commentModel = mongoose.models.Comment || mongoose.model("Comment", commentSchema)
