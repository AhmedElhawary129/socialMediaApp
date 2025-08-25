import { EventEmitter } from "events";
import { sendEmail } from "../../service/sendEmail.js";
import { customAlphabet } from "nanoid";
import { userModel } from "../../DB/models/index.js";
import { Hash } from "../encryption/index.js";
import { AppError } from "../error/index.js";
import * as dbService from "../../DB/dbService.js";

export const eventEmitter = new EventEmitter();

// confirm email
eventEmitter.on("sendEmaliConfirmation", async (data) => {
  const { email } = data;

  // generate OTP
  
  const OTP = customAlphabet("1234567890", 5)();
  const hash = await Hash({key: OTP, SALT_ROUNDS: process.env.SALT_ROUNDS})

  // send email
  const emailSender = await sendEmail(
    email,
    "Confirm your email",
    `
        <p>You must confirm your email to use your account</p>
        <p>use this code to confirm your email</p>
        <h1 style="color: brown;">${OTP}</h1>
        <p>The OTP is expired after 5 minutes</p>
        <p>Thanks for using my Social Application</p>
        <p>Best wishes</p>
        `
  );
  if (!emailSender) {
    return next(new AppError("Error sending message", 500));
  }

    await dbService.updateOne({
    model: userModel, 
    filter: {email}, 
    update: {otpEmail: hash, otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000)}
  }) // 5 minutes
});

//--------------------------------------------------------------------------------------------------------------

// Forget password
eventEmitter.on("forgetPassword", async (data) => {
  const { email } = data;

  // generate OTP
  const OTP = customAlphabet("1234567890", 5)();
  const hash = await Hash({key: OTP, SALT_ROUNDS: process.env.SALT_ROUNDS})

  // send email
  const emailSender = await sendEmail(
    email,
    "Reset your password",
    `
        <p>You must reset your password to login again</p>
        <p>use this code to reset your password</p>
        <h1 style="color: brown;">${OTP}</h1>
        <p>The OTP is expired after 5 minutes</p>
        <p>Thanks for using my Social Application</p>
        <p>Best wishes</p>
        `
  );
  if (!emailSender) {
    return next(new AppError("Error sending message", 500));
  }

  await dbService.updateOne({
    model: userModel, 
    filter: {email}, 
    update: {otpPassword: hash, otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000)}
  }) // 5 minutes
});

//--------------------------------------------------------------------------------------------------------------

// update email
// old email
eventEmitter.on("oldEmailMessage", async (data) => {
  const { email, id } = data;

  // generate OTP
  const OTP = customAlphabet("1234567890", 5)();
  const hash = await Hash({key: OTP, SALT_ROUNDS: process.env.SALT_ROUNDS})

  // send email
  const emailSender = await sendEmail(
    email,
    "Replace your email",
    `
        <p>Use this code to replace this old email</p>
        <h1 style="color: brown;">${OTP}</h1>
        <p>The OTP is expired after using it</p>
        <p>Thanks for using my Social Application</p>
        <p>Best wishes</p>
        `
  );
  if (!emailSender) {
    return next(new AppError("Error sending message", 500));
  }

  await dbService.updateOne({
    model: userModel, 
    filter: {email, _id: id}, 
    update: {otpOldEmail: hash, otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000)}
  }) // 5 minutes
});


// new email
eventEmitter.on("newEmailMessage", async (data) => {
  const { email, id } = data;

  // generate OTP
  const OTP = customAlphabet("1234567890", 5)();
  const hash = await Hash({key: OTP, SALT_ROUNDS: process.env.SALT_ROUNDS})

  // send email
  const emailSender = await sendEmail(
    email,
    "Replace your email",
    `
        <p>Use this code to use this email instead of your current email</p>
        <h1 style="color: brown;">${OTP}</h1>
        <p>The OTP is expired after using it</p>
        <p>Thanks for using my Social Application</p>
        <p>Best wishes</p>
        `
  );
  if (!emailSender) {
    return next(new AppError("Error sending message", 500));
  }

  await dbService.updateOne({
    model: userModel, 
    filter: {tempEmail: email, _id: id}, 
    update: {otpNewEmail: hash, otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000)}
  }) // 5 minutes
});