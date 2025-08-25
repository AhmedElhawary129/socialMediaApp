import joi from "joi";
import { generalRules } from "../../utils/index.js";

//---------------------------------------------------------------------------------------------------------------

// create post schema
export const createPostSchema = {
    body: joi.object({
        content: joi.string().alphanum().min(3).required()
    }).required(),
    files: joi.array().items(generalRules.file)
};

//---------------------------------------------------------------------------------------------------------------

// update post schema
export const updatePostSchema = {
    body: joi.object({
        content: joi.string().min(3)
    }),
    params: joi.object({
        postId: generalRules.objectId.required()
    }).required(),
    files: joi.array().items(generalRules.file)
};

//---------------------------------------------------------------------------------------------------------------

// freeze post schema
export const freezePostSchema = {
    params: joi.object({
        postId: generalRules.objectId.required()
    }).required()
};

//---------------------------------------------------------------------------------------------------------------

// like post schema
export const likePostSchema = {
    params: joi.object({
        postId: generalRules.objectId.required()
    }).required()
};

//---------------------------------------------------------------------------------------------------------------

// user posts schema
export const userPostsSchema = {
    params: joi.object({
        userId: generalRules.objectId.required()
    }).required()
};

//---------------------------------------------------------------------------------------------------------------

// archive post schema
export const archivePostSchema = {
    params: joi.object({
        postId: generalRules.objectId.required()
    }).required()
};