import * as dbService from "../../DB/dbService.js";
import { providerTypes, roleTypes, tokenTypes } from "../../DB/enums.js";
import { postModel, userModel } from "../../DB/models/index.js";
import { decodedToken } from "../../middleware/auth.js";
import cloudinary from "../../utils/cloudinary/index.js";
import { AppError, asyncHandler, Compare, Encrypt, eventEmitter, generateToken, Hash } from "../../utils/index.js";
import {OAuth2Client}  from 'google-auth-library';

//---------------------------------------------------------------------------------------------------------------

// signUp
export const signUp = asyncHandler(async(req, res, next) => {
    const {fName, lName, email, password, phone, gender} = req.body;

    // check email
    if (await dbService.findOne({model: userModel, filter: {email}})) {
        return next (new AppError("Email already exists", 409))
    }

    // encrypt phone number
    const cipherText = await Encrypt({key: phone, SECRET_KEY: process.env.SECRET_KEY})

    // hash password
    const hash = await Hash({key: password, SALT_ROUNDS: process.env.SALT_ROUNDS})

    // send OTP message
    eventEmitter.emit("sendEmaliConfirmation", {email})

    // create user
    const user = await dbService.create({
        model: userModel, 
        query: {
            fName, 
            lName, 
            email, 
            gender,
            password: hash, 
            phone: cipherText
            }
        })
        return res.status(201).json({msg: "Account created successfully please check your email", user})
})

//---------------------------------------------------------------------------------------------------------------

// upload profile image
export const uploadProfileImage = asyncHandler(async(req, res, next) => {
    if (!req.file) {
        return next(new AppError("Please upload an image", 400))
    }
    const {public_id, secure_url} = await cloudinary.uploader.upload(req.file.path, {
        folder: "socialMediaApp/users/profileImage"
    })
    await dbService.updateOne({
        model: userModel, 
        filter: {_id: req.user._id}, 
        update: {profileImage: {public_id, secure_url}}
    })
    return res.status(201).json({msg: "Profile image uploaded successfully"})
})

//---------------------------------------------------------------------------------------------------------------

// upload cover image
export const uploadCoverImage = asyncHandler(async(req, res, next) => {
    if (!req.file) {
        return next(new AppError("Please upload an image", 400))
    }
    const {public_id, secure_url} = await cloudinary.uploader.upload(req.file.path, {
        folder: "socialMediaApp/users/coverImage"
    })
    await dbService.updateOne({
        model: userModel, 
        filter: {_id: req.user._id}, 
        update: {coverImage: {public_id, secure_url}}
    })
    return res.status(201).json({msg: "Cover image uploaded successfully"})
})

//---------------------------------------------------------------------------------------------------------------

// confirm email
export const confirmEmail = asyncHandler(async(req, res, next) => {
    const {email, code} = req.body;
    
    // check email
    const user = await dbService.findOne({model: userModel, filter: {email, confirmed: false}})
    if (!user) {
        return next (new AppError("Email not exists or already confirmed", 404))
    }

    // check if OTP is expired or not
    if (user?.otpExpiresAt < Date.now()) {
        return next(new AppError("OTP is expired", 401))
    }

    // compare code
    if (!await Compare({key: code, hashed: user.otpEmail})) {
        return next (new AppError("Invalid code", 401))
    }
    
    // update user
    await dbService.updateOne({
        model: userModel, 
        filter: {email}, 
        update: {confirmed: true, $unset: {otpEmail: 0, otpExpiresAt: 0}}
    })
    return res.status(201).json({msg: "Account confirmed successfully"})
})

//---------------------------------------------------------------------------------------------------------------

// logIn
export const logIn = asyncHandler(async(req, res, next) => {
    const {email, password} = req.body;
    
    // check email
    const user = await dbService.findOne({
        model: userModel, 
        filter: {email, confirmed: true, isDeleted: false, provider: providerTypes.system}
    })
    if (!user) {
        return next (new AppError("Email not exists or not confirmed yet", 404))
    }

    // compare password
    if (!await Compare({key: password, hashed: user.password})) {
        return next (new AppError("Invalid password", 401))
    }
    
    // generate token
    const access_token = await generateToken({
        payload: {email, id: user._id}, 
        SIGNETURE: 
        user.role == roleTypes.user ? 
        process.env.ACCESS_SIGNETURE_USER : 
        process.env.ACCESS_SIGNETURE_ADMIN,
        option: {expiresIn: "1d"}
    })

    const refresh_token = await generateToken({
        payload: {email, id: user._id}, 
        SIGNETURE: 
        user.role == roleTypes.user ? 
        process.env.REFRESH_SIGNETURE_USER : 
        process.env.REFRESH_SIGNETURE_ADMIN,
        option: {expiresIn: "1w"}
    })
    return res.status(201).json({message: "LogIn successfully", data: {access_token, refresh_token}})
})

//---------------------------------------------------------------------------------------------------------------

// loginWithGmail
export const loginWithGmail = asyncHandler(async(req, res, next) => {
    const {idToken} = req.body;
    const client = new OAuth2Client();
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.CLIENT_ID, 
        });
        const payload = ticket.getPayload();
        return payload;
    }
    const {email, email_verified, picture, name} = await verify()
    const user = await userModel.findOne({email})
    if (!user) {
        user = await dbService.create({
            model: userModel, 
            query: {
                name,
                email,
                confirmed: email_verified,
                image: picture,
                provider: providerTypes.google
            }
        })
    }
    if (user.provider != providerTypes.google) {
        return next(new AppError("Please login with in system"))
    }

    // generate token
    const access_token = await generateToken({
        payload: {email, id: user._id}, 
        SIGNETURE: 
        user.role == roleTypes.user ? 
        process.env.SIGNETURE_KEY_USER : 
        process.env.SIGNETURE_KEY_ADMIN,
        option: {expiresIn: "1d"}
    })

    return res.status(201).json({msg: "Done", Token : access_token})
})

//---------------------------------------------------------------------------------------------------------------

// refreshToken
export const refreshToken = asyncHandler(async(req, res, next) => {
    const { authorization } = req.body;
    const user = await decodedToken({authorization, tokenType: tokenTypes.refresh, next});
    
    // generate tokens
    const access_token = await generateToken({
        payload: {email: user.email, id: user._id}, 
        SIGNETURE: 
        user.role == roleTypes.user ? 
        process.env.ACCESS_SIGNETURE_USER : 
        process.env.ACCESS_SIGNETURE_ADMIN,
        option: {expiresIn: "1d"}
    })
    return res.status(201).json({msg: "Token refresed successfully", Token: {access_token}})
})

//---------------------------------------------------------------------------------------------------------------

// forgetPassword
export const forgetPassword = asyncHandler(async(req, res, next) => {
    const {email} = req.body;

    // check email
    if (!await dbService.findOne({model: userModel, filter: {email, isDeleted: false}})) {
        return next (new AppError("Email not exists or deleted", 404))
    }

    // send email
    eventEmitter.emit("forgetPassword", {email})
    return res.status(201).json({msg: "OTP sent successfully please check your email"})
})

//---------------------------------------------------------------------------------------------------------------

// resetPassword
export const resetPassword = asyncHandler(async(req, res, next) => {
    const {email, code, newPassword} = req.body;

    // check email
    const user = await dbService.findOne({model: userModel, filter: {email, isDeleted: false}})
    if (!user) {
        return next (new AppError("Email not exists or deleted", 404))
    }

    // check if OTP is expired or not
    if (user?.otpExpiresAt < Date.now()) {
        return next(new AppError("OTP is expired", 401))
    }

    // compare code
    if (!await Compare({key: code, hashed: user.otpPassword})) {
        return next(new AppError("Invalid code", 401))
    }
    
    // hash password
    const hash = await Hash({key: newPassword, SALT_ROUNDS: process.env.SALT_ROUNDS})

    // update password
    await dbService.updateOne({
        model: userModel, 
        filter: {email}, 
        update: {
            password: hash, 
            confirmed: true, 
            passwordChangedAt: Date.now(), 
            $unset: {otpPassword: 0, otpExpiresAt: 0}
        }
    })
    return res.status(201).json({msg: "Password reset successfully"})
})

//---------------------------------------------------------------------------------------------------------------

// updateProfile
export const updateProfile = asyncHandler(async(req, res, next) => {

    if (req.body.phone) {
        req.body.phone = await Encrypt({key: req.body.phone, SECRET_KEY: process.env.SECRET_KEY})
    }

    // update profile
    const user = await dbService.findOneAndUpdate({
        model: userModel, 
        filter: {_id: req.user._id, isDeleted: false}, 
        update: req.body,
        options: {new: true}
    })

    if (!user) {
        return next(new AppError("User not found or deleted", 404))
    }
    return res.status(201).json({msg: "Profile updated successfully", user})
})

//---------------------------------------------------------------------------------------------------------------

// update profile image
export const updateProfileImage = asyncHandler(async(req, res, next) => {
    if (!req.file) {
        return next(new AppError("Please upload an image", 400))
    }
    await cloudinary.uploader.destroy(req.user.profileImage.public_id)
    const {public_id, secure_url} = await cloudinary.uploader.upload(req.file.path, {
        folder: "socialMediaApp/users/profileImage"
    })
    await dbService.updateOne({
        model: userModel, 
        filter: {_id: req.user._id}, 
        update: {profileImage: {public_id, secure_url}}
    })
    return res.status(201).json({msg: "Profile image updated successfully"})
})

//---------------------------------------------------------------------------------------------------------------

// update cover image
export const updateCoverImage = asyncHandler(async(req, res, next) => {
    if (!req.file) {
        return next(new AppError("Please upload an image", 400))
    }
    await cloudinary.uploader.destroy(req.user.coverImage.public_id)
    const {public_id, secure_url} = await cloudinary.uploader.upload(req.file.path, {
        folder: "socialMediaApp/users/coverImage"
    })
    await dbService.updateOne({
        model: userModel, 
        filter: {_id: req.user._id}, 
        update: {coverImage: {public_id, secure_url}}
    })
    return res.status(201).json({msg: "Cover image updated successfully"})
})

//---------------------------------------------------------------------------------------------------------------

// delete profile image
export const deleteProfileImage = asyncHandler(async(req, res, next) => {
    if (!req.user?.profileImage?.public_id) {
        return next(new AppError("Profile image already deleted", 409))
    }
    await cloudinary.uploader.destroy(req.user.profileImage.public_id)
    await dbService.updateOne({
        model: userModel, 
        filter: {_id: req.user._id}, 
        update: {$unset: {profileImage: 0}}
    })
    return res.status(201).json({msg: "Profile image deleted successfully"})
})

//---------------------------------------------------------------------------------------------------------------

// delete profile image
export const deleteCoverImage = asyncHandler(async(req, res, next) => {
    if (!req.user?.coverImage?.public_id) {
        return next(new AppError("Cover image already deleted", 409))
    }
    await cloudinary.uploader.destroy(req.user.coverImage.public_id)
    await dbService.updateOne({
        model: userModel, 
        filter: {_id: req.user._id}, 
        update: {$unset: {coverImage: 0}}
    })
    return res.status(201).json({msg: "Cover image deleted successfully"})
})

//---------------------------------------------------------------------------------------------------------------

// updatePassword
export const updatePassword = asyncHandler(async(req, res, next) => {
    const{oldPassword, newPassword} = req.body;

    // check password
    if (!await Compare({key: oldPassword, hashed: req.user.password})) {
        return next(new AppError("Invalid old password", 401))
    }

    // hash password
    const hash = await Hash({key: newPassword, SALT_ROUNDS: process.env.SALT_ROUNDS})
    
    // update password
    await dbService.updateOne({
        model: userModel, 
        filter: {_id: req.user._id}, 
        update: {password: hash, passwordChangedAt: Date.now()}
    })
    return res.status(201).json({msg: "Password updated successfully"})
})

//---------------------------------------------------------------------------------------------------------------

// shareProfile
export const shareProfile = asyncHandler(async(req, res, next) => {
    const {id} = req.params;

    const user = await dbService.findOne({
        model: userModel, 
        filter: {_id: id, isDeleted: false}
    })
    if (!user) {
        return next(new AppError("User not found or deleted", 404))
    }
    if (req.user._id.toString() === id) {
    return res.status(201).json({msg: "Your profile : ", user: req.user})
    }

    const emailExist = user.viewers.find(viewer=> {
        return viewer.userId.toString() === req.user._id.toString()
    })
    if (emailExist) {
        emailExist.time.push(Date.now())
        if (emailExist.time.length > 5) {
            emailExist.time = emailExist.time.slice(-5)
        }
    } else {
        user.viewers.push({userId: req.user._id, time: [Date.now()]})
    }
    await user.save()

    const userToView = await dbService.findOne({
        model: userModel, 
        filter: {_id: id, isDeleted: false},
        select: "fName lName email profileImage coverImage -_id"
    })

    return res.status(201).json({msg: `The profile of ${user.fName} ${user.lName}:`, user: userToView})
})

//---------------------------------------------------------------------------------------------------------------

// updateEmail
export const updateEmail = asyncHandler(async(req, res, next) => {
    const {newEmail} = req.body;

    const user = await dbService.findOne({model: userModel, filter: {email: newEmail}})
    if (user) {
        return next(new AppError("Email already existe", 409))
    }
    await dbService.updateOne({
        model: userModel, 
        filter: {_id: req.user._id}, 
        update: {tempEmail: newEmail}
    })
    
    // send OTP to current email
    eventEmitter.emit("oldEmailMessage", {email: req.user.email, id: req.user._id})
    
    // send OTP to new email
    eventEmitter.emit("newEmailMessage", {email: newEmail, id: req.user._id})

    return res.status(201).json({msg: "Two OTPs are sent to your current and new email successfully please check your messages"})
})

//---------------------------------------------------------------------------------------------------------------

// replaceEmail
export const replaceEmail = asyncHandler(async(req, res, next) => {
    const {oldEmailCode, newEmailCode} = req.body;

    const user = await dbService.findOne({
        model: userModel, 
        filter: {_id: req.user._id, isDeleted: false}
    })
    if (!user) {
        return next(new AppError("User not found or deleted", 404))
    }

    // check if OTPs are expired or not
    if (user?.otpExpiresAt < Date.now()) {
        return next(new AppError("OTP is expired", 401))
    }
    
    if (!await Compare({key: oldEmailCode, hashed: user.otpOldEmail})) {
        return next (new AppError("Invalid old email code", 401))
    }

    if (!await Compare({key: newEmailCode, hashed: user.otpNewEmail})) {
        return next (new AppError("Invalid new email code", 401))        
    }

    await dbService.updateOne({
        model: userModel, 
        filter: {_id: req.user._id}, 
        update: {
            email: user.tempEmail,
            $unset: {
                otpOldEmail: 0, 
                otpNewEmail: 0, 
                tempEmail: 0,
                otpExpiresAt: 0
            },
            emailChangedAt: Date.now()
        }
    })

    return res.status(201).json({msg: "Email replaced successfully"})
})

//---------------------------------------------------------------------------------------------------------------

// Admin Dashboard
// dashboard
export const dashboard = asyncHandler(async(req, res, next) => {

    const data = await Promise.all([
        userModel.find(),
        postModel.find()
    ])

    return res.status(201).json({msg: "Dashboard", data})
})


// updateRole
export const updateRole = asyncHandler(async(req, res, next) => {
    const {userId} = req.params;
    const {role} = req.body;

    const data = req.user.role == roleTypes.superAdmin ? {role: {$nin: [roleTypes.superAdmin]}} 
    : {role: {$nin: [roleTypes.admin, roleTypes.superAdmin]}}

    const user = await dbService.findOneAndUpdate({
        model: userModel, 
        filter: {
            _id: userId, 
            isDeleted: false, 
            ...data
        }, 
        update: {role, roleUpdatedBy: req.user._id},
        options: {new: true}
    })

    if (!user) {
        return next(new AppError("User not found or deleted or unauthorized", 404))
    }

    return res.status(201).json({msg: "Role updated successfully"})
})

//---------------------------------------------------------------------------------------------------------------

// add friend
export const addFriend = asyncHandler(async(req, res, next) => {
    const {userId} = req.params;

    const user = await dbService.findOne({
        model: userModel, 
        filter: {_id: userId, isDeleted: false}
    })
    if (!user) {
        return next(new AppError("User not found or deleted", 404))
    }
    
    const currentUser = await dbService.findOne({
        model: userModel,
        filter: { _id: req.user._id, isDeleted: false }
    });
    if (currentUser.friends.includes(user._id)) {
        return next(new AppError("You already added this user", 401));
    }

    await dbService.findOneAndUpdate({
        model: userModel, 
        filter: {_id: req.user._id, isDeleted: false},
        update: {$addToSet: {friends: userId}},
        options: {new: true}
    })

    await dbService.findOneAndUpdate({
        model: userModel,
        filter: {_id: userId, isDeleted: false},
        update: {$addToSet: {friends: req.user._id}},
        options: {new: true}
    })
    return res.status(201).json({msg: `${user.fName} ${user.lName} is your friend now`})
})

//---------------------------------------------------------------------------------------------------------------

// remove friend 
export const removeFriend = asyncHandler(async(req, res, next) => {
    const {userId} = req.params;

    const user = await dbService.findOne({
        model: userModel, 
        filter: {_id: userId, isDeleted: false}
    })
    if (!user) {
        return next(new AppError("User not found or deleted", 404))
    }

    const currentUser = await dbService.findOne({
        model: userModel,
        filter: { _id: req.user._id, isDeleted: false }
    });
    if (!currentUser.friends.includes(user._id)) {
        return next(new AppError("This user is not your friend to remove him", 401));
    }

    await dbService.findOneAndUpdate({
        model: userModel, 
        filter: {_id: req.user._id, isDeleted: false},
        update: {$pull: {friends: userId}},
        options: {new: true}
    })

    await dbService.findByIdAndUpdate({
        model: userModel,
        filter: {_id: userId, isDeleted: false},
        update: {$pull: {friends: req.user._id}},
        options: {new: true}
    })

    return res.status(201).json({msg: `${user.fName} ${user.lName} is not your friend now`})
    })

//---------------------------------------------------------------------------------------------------------------

// get profile
export const getProfile = asyncHandler(async(req, res, next) => {
    const user = await dbService.findOne({
        model: userModel, 
        filter: {_id: req.user._id, isDeleted: false},
        populate: [{path: "friends"}]
    })
    if (!user) {
        return next(new AppError("User not found or deleted", 404));
        
    }
    return res.status(201).json({msg: "done", user})
});

//---------------------------------------------------------------------------------------------------------------

// block user
export const blockUser = asyncHandler(async(req, res, next) => {
    const {userId} = req.params;

    const user = await dbService.findOne({
        model: userModel, 
        filter: {_id: userId, isDeleted: false},
    })
    if (!user) {
        return next(new AppError("User not found or deleted", 404));
    }

    if (user._id.toString() === req.user._id.toString()) {
    return next(new AppError("You can't block yourself", 401));
    }
    
    const currentUser = await dbService.findOne({
        model: userModel,
        filter: { _id: req.user._id, isDeleted: false }
    });
    if (currentUser.blockedUsers.includes(user._id)) {
        return next(new AppError("You already blocked this user", 401));
    }

    await dbService.findOneAndUpdate({
        model: userModel, 
        filter: {_id: req.user._id, isDeleted: false},
        update: {$addToSet: {blockedUsers: user._id}, $pull: { friends: user._id }}
    })

    await dbService.findOneAndUpdate({
        model: userModel,
        filter: {_id: userId, isDeleted: false},
        update: {$pull: { friends: req.user._id }}
    })

    return res.status(201).json({msg: `${user.fName} ${user.lName} Blocked successfully`})
})

//---------------------------------------------------------------------------------------------------------------

// unBlock user
export const unBlockUser = asyncHandler(async(req, res, next) => {
    const {userId} = req.params;

    const user = await dbService.findOne({
        model: userModel, 
        filter: {_id: userId, isDeleted: false},
    })
    if (!user) {
        return next(new AppError("User not found or deleted", 404));
    }

    if (user._id.toString() === req.user._id.toString()) {
    return next(new AppError("You can't unBlock yourself", 401));
    }
    
    const currentUser = await dbService.findOne({
        model: userModel,
        filter: { _id: req.user._id, isDeleted: false }
    });
    if (!currentUser.blockedUsers.includes(user._id)) {
        return next(new AppError("You haven't blocked this user to unblock him", 401));
    }

    await dbService.findOneAndUpdate({
        model: userModel, 
        filter: {_id: req.user._id, isDeleted: false},
        update: {$pull: {blockedUsers: user._id}}
    })
    return res.status(201).json({msg: `${user.fName} ${user.lName} unBlocked successfully`})
    })