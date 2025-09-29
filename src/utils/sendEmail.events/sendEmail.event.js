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
`<div style="font-family: Arial, sans-serif; background:#fff; padding:30px; color:#333; line-height:1.6; border:1px solid #eee; border-radius:10px; max-width:600px; margin:auto;">
  
  <!-- Title -->
  <h2 style="margin-bottom:15px; font-size:22px; color:#111;">Confirm your email</h2>

  <!-- Message -->
  <p style="margin:0 0 15px 0; font-size:15px;">Please confirm your email to activate your account. Use the code below:</p>

  <!-- OTP -->
  <p style="font-size:24px; font-weight:bold; letter-spacing:3px; background:#f5f5f5; padding:12px 20px; border-radius:8px; display:inline-block; margin:20px 0;">
    ${OTP}
  </p>

  <!-- Expiry -->
  <p style="font-size:14px; color:#555; margin:0 0 20px 0;">This code will expire in 5 minutes</p>

  <!-- Footer -->
  <p style="font-size:14px; margin:0;">Thanks for using <b>JobSearch</b>!</p>
  <p style="font-size:14px; color:#666; margin:5px 0 0 0;">– The JobSearch Team</p>

</div>`
  );
  if (!emailSender) {
    throw new AppError("Error sending message", 500);
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
`<div style="font-family: Arial, sans-serif; background:#fff; padding:30px; color:#333; line-height:1.6; border:1px solid #eee; border-radius:10px; max-width:600px; margin:auto;">
  
  <!-- Title -->
  <h2 style="margin-bottom:15px; font-size:22px; color:#111;">Reset Your Password</h2>

  <!-- Message -->
  <p style="margin:0 0 15px 0; font-size:15px;">We received a request to reset your password. Use the code below to proceed:</p>

  <!-- OTP -->
  <p style="font-size:24px; font-weight:bold; letter-spacing:3px; background:#f5f5f5; padding:12px 20px; border-radius:8px; display:inline-block; margin:20px 0;">
    ${OTP}
  </p>

  <!-- Expiry -->
  <p style="font-size:14px; color:#555; margin:0 0 20px 0;">This code will expire in 5 minutes</p>

  <!-- Footer -->
  <p style="font-size:14px; margin:0;">Thanks for using <b>JobSearch</b>!</p>
  <p style="font-size:14px; color:#666; margin:5px 0 0 0;">– The JobSearch Team</p>

</div>`
  );
  if (!emailSender) {
    throw new AppError("Error sending message", 500);
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
`<div style="font-family: Arial, sans-serif; background:#fff; padding:30px; color:#333; line-height:1.6; border:1px solid #eee; border-radius:10px; max-width:600px; margin:auto;">
  
  <!-- Title -->
  <h2 style="margin-bottom:15px; font-size:22px; color:#111;">Replace your email</h2>

  <!-- Message -->
  <p style="margin:0 0 15px 0; font-size:15px;">You requested to replace this email. Use the code below to confirm:</p>

  <!-- OTP -->
  <p style="font-size:24px; font-weight:bold; letter-spacing:3px; background:#f5f5f5; padding:12px 20px; border-radius:8px; display:inline-block; margin:20px 0;">
    ${OTP}
  </p>

  <!-- Expiry -->
  <p style="font-size:14px; color:#555; margin:0 0 20px 0;">This code will expire in 5 minutes</p>

  <!-- Footer -->
  <p style="font-size:14px; margin:0;">Thanks for using <b>JobSearch</b>!</p>
  <p style="font-size:14px; color:#666; margin:5px 0 0 0;">– The JobSearch Team</p>

</div>`
  );
  if (!emailSender) {
    throw new AppError("Error sending message", 500);
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
`<div style="font-family: Arial, sans-serif; background:#fff; padding:30px; color:#333; line-height:1.6; border:1px solid #eee; border-radius:10px; max-width:600px; margin:auto;">
  
  <!-- Title -->
  <h2 style="margin-bottom:15px; font-size:22px; color:#111;">Replace your email</h2>

  <!-- Message -->
  <p style="margin:0 0 15px 0; font-size:15px;">Use the code below to confirm your new email address:</p>

  <!-- OTP -->
  <p style="font-size:24px; font-weight:bold; letter-spacing:3px; background:#f5f5f5; padding:12px 20px; border-radius:8px; display:inline-block; margin:20px 0;">
    ${OTP}
  </p>

  <!-- Expiry -->
  <p style="font-size:14px; color:#555; margin:0 0 20px 0;">This code will expire in 5 minutes</p>

  <!-- Footer -->
  <p style="font-size:14px; margin:0;">Thanks for using <b>JobSearch</b>!</p>
  <p style="font-size:14px; color:#666; margin:5px 0 0 0;">– The JobSearch Team</p>

</div>`
  );
  if (!emailSender) {
    throw new AppError("Error sending message", 500);
  }

  await dbService.updateOne({
    model: userModel, 
    filter: {tempEmail: email, _id: id}, 
    update: {otpNewEmail: hash, otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000)}
  }) // 5 minutes
});