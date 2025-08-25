import joi from "joi";
import { Types } from "mongoose";

export const customId = (value, helper) => {
    let data = Types.ObjectId.isValid(value);
    return data ? value : helper.message("Invalid ID");
}

// general rules
export const generalRules = {
    objectId: joi.string().custom(customId),
    email: joi.string().email({tlds: {allow: ["com", "net", "outlook"]}, minDomainSegments: 2, maxDomainSegments: 3}).required(),
    password: joi.string().regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/).required(),
    headers: joi.object({
        authorization: joi.string().required(),
        "cache-control": joi.string(),
        "postman-token": joi.string(),
        "content-type": joi.string(),
        "content-length": joi.string(),
        host: joi.string(),
        "user-agent": joi.string(),
        accept: joi.string(),
        "accept-encoding": joi.string(),
        connection: joi.string()
    }),
    file: joi.object({
        size: joi.number().positive().required(),
        path: joi.string().required(),
        filename: joi.string().required(),
        destination: joi.string().required(),
        mimetype: joi.string().required(),
        encoding: joi.string().required(),
        originalname: joi.string().required(),
        fieldname: joi.string().valid("profileImage", "coverImage", "postAttachments", "commentAttachment").required()
    }).messages({"any.required": "File is required"})
}