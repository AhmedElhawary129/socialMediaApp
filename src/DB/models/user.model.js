import mongoose from "mongoose";
import { genderTypes, providerTypes, roleTypes } from "../enums.js";


const userSchema = new mongoose.Schema({
    fName: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 30,
        trim: true
    },
    lName: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 30,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: function(data){
            return data.provider == providerTypes.google ? false : true
        },
        minLength: 8,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    gender: {
        type: String,
        enum: Object.values(genderTypes),
        default: genderTypes.other
    },
    confirmed: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: Object.values(roleTypes),
        default: roleTypes.user
    },
    profileImage: {
        secure_url: String,
        public_id: String
    },
    coverImage: {
        secure_url: String,
        public_id: String
    },
    otpEmail: String,
    otpPassword: String,
    otpOldEmail: String,
    otpNewEmail: String,
    tempEmail: String,
    passwordChangedAt: Date,
    emailChangedAt: Date,
    otpExpiresAt: Date,
    provider: {
        type: String,
        enum: Object.values(providerTypes),
        default: providerTypes.system
    },
    viewers: [{
        userId: {type: mongoose.Schema.Types.ObjectId, ref: "user"},
        time: [Date]
    }],
    friends:[{
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User"
    }],
    blockedUsers: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User"
    }],
    roleUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
},{
    timestamps:{
        createdAt: true,
        updatedAt: true
    }
})

export const userModel = mongoose.models.User || mongoose.model("User", userSchema)
export const connectionUser = new Map()
