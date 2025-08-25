import joi from "joi";
import { generalRules } from "../../utils/index.js";
import { genderTypes } from "../../DB/enums.js";

//---------------------------------------------------------------------------------------------------------------

// sign up schema
export const signUpSchema = {
    body: joi.object({
        fName: joi.string().alphanum().min(3).max(30).required(),
        lName: joi.string().alphanum().min(3).max(30).required(),
        email: generalRules.email.required(),
        password: generalRules.password.required(),
        cPassword: generalRules.password.valid(joi.ref("password")).required(),
        phone: joi.string().regex(/^01[0125][0-9]{8}$/).required(),
        gender: joi.string().valid(genderTypes.male, genderTypes.female, genderTypes.other).required()
    }).required()
};

//---------------------------------------------------------------------------------------------------------------

// upload image
export const uploadImageSchema = {
    file: generalRules.file.required()
};

//---------------------------------------------------------------------------------------------------------------

// confirm email schema
export const confirmEmailSchema = {
    body: joi.object({
        email: generalRules.email.required(),
        code: joi.string().length(5).required()
    }).required()
};

//---------------------------------------------------------------------------------------------------------------

// log in schema
export const logInSchema = {
    body: joi.object({
        email: generalRules.email.required(),
        password: generalRules.password.required()
    }).required()
};

//---------------------------------------------------------------------------------------------------------------

// refresh token schema
export const refreshTokenSchema = {
    body: joi.object({
        authorization: joi.string().required()
    }).required()
};

//---------------------------------------------------------------------------------------------------------------

// forget password schema
export const forgetPasswordSchema = {
    body: joi.object({
        email: generalRules.email.required()
    }).required()
};

//---------------------------------------------------------------------------------------------------------------

// reset password schema
export const resetPasswordSchema = {
    body: joi.object({
        email: generalRules.email.required(),
        code: joi.string().length(5).required(),
        newPassword: generalRules.password.required(),
        cPassword: generalRules.password.valid(joi.ref("newPassword")).required()
    }).required()
};

//---------------------------------------------------------------------------------------------------------------

// update profile schema
export const updateProfileSchema = {
    body: joi.object({
        fName: joi.string().alphanum().min(3).max(30),
        lName: joi.string().alphanum().min(3).max(30),
        gender: joi.string().valid(genderTypes.male, genderTypes.female, genderTypes.other),
        phone: joi.string().regex(/^01[0125][0-9]{8}$/)
    }).required()
};

//---------------------------------------------------------------------------------------------------------------

// update password schema
export const updatePasswordSchema = {
    body: joi.object({
        oldPassword: generalRules.password.required(),
        newPassword: generalRules.password.required(),
        cNewPassword: generalRules.password.valid(joi.ref("newPassword")).required()
    }).required()
};

//---------------------------------------------------------------------------------------------------------------

// share profile schema
export const shareProfileSchema = {
    params: joi.object({
        id: generalRules.objectId.required()
    }).required()
};

//---------------------------------------------------------------------------------------------------------------

// update email schema
export const updateEmailSchema = {
    body: joi.object({
        newEmail: generalRules.email.required()
    }).required()
};

//---------------------------------------------------------------------------------------------------------------

// replace email schema
export const replaceEmailSchema = {
    body: joi.object({
        oldEmailCode: joi.string().length(5).required(),
        newEmailCode: joi.string().length(5).required()
    }).required()
};

//---------------------------------------------------------------------------------------------------------------

// friend schema
export const friendSchema = {
    params: joi.object({
        userId: generalRules.objectId.required()
    }).required()
};

//---------------------------------------------------------------------------------------------------------------

// block user schema
export const blockUserSchema = {
    params: joi.object({
        userId: generalRules.objectId.required()
    }).required()
};