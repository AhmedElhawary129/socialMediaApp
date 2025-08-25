import joi from "joi";
import { generalRules } from "../../utils/index.js";

//---------------------------------------------------------------------------------------------------------------

// create comment schema
export const createCommentSchema = {
    body: joi.object({
        content: joi.string().min(3).required(),
        onModel: joi.string().valid("Post", "Comment").required(),
    }).required(),
    params: joi.object({
        refId: generalRules.objectId.required()
    }).required(),
    file: generalRules.file
}

//---------------------------------------------------------------------------------------------------------------

// update comment schema
export const updateCommentSchema = {
    body: joi.object({
        content: joi.string().min(3)
    }),
    params: joi.object({
        commentId: generalRules.objectId.required(),
        refId: generalRules.objectId.required()
    }).required(),
    fils: joi.array().items(generalRules.file)
}

//---------------------------------------------------------------------------------------------------------------

// freeze comment schema
export const freezeCommentSchema = {
    params: joi.object({
        commentId: generalRules.objectId.required(),
        refId: generalRules.objectId.required()
    })
}

//---------------------------------------------------------------------------------------------------------------

// like comment schema
export const likeCommentSchema = {
    params: joi.object({
        commentId: generalRules.objectId.required(),
        refId: generalRules.objectId.required()
    }).required()
};