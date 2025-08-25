import { Router } from "express";
import * as US from "./user.service.js";
import {validation} from "../../middleware/validation.js"
import * as UV from "./user.validation.js";
import { multerHost } from "../../middleware/multer.js";
import { authentication, authorization } from "../../middleware/auth.js";
import { fileTypes, roleTypes } from "../../DB/enums.js";

//---------------------------------------------------------------------------------------------------------------

const userRouter = Router();

// routes
userRouter.post("/signUp", validation(UV.signUpSchema), US.signUp);

userRouter.patch("/uploadProfileImage", 
    multerHost(fileTypes.image).single("profileImage"),
    validation(UV.uploadImageSchema), 
    authentication,
    US.uploadProfileImage
);

userRouter.patch("/uploadCoverImage", 
    multerHost(fileTypes.image).single("coverImage"),
    validation(UV.uploadImageSchema), 
    authentication,
    US.uploadCoverImage
);

userRouter.patch("/confirmEmail", validation(UV.confirmEmailSchema), US.confirmEmail);

userRouter.post("/signin", validation(UV.logInSchema), US.logIn);
userRouter.post("/loginWithGmail", US.loginWithGmail);

userRouter.get("/refreshToken", validation(UV.refreshTokenSchema), US.refreshToken);

userRouter.patch("/forgetPassword", validation(UV.forgetPasswordSchema), US.forgetPassword);
userRouter.patch("/resetPassword", validation(UV.resetPasswordSchema), US.resetPassword);

userRouter.patch("/updateProfile", 
    validation(UV.updateProfileSchema), 
    authentication, 
    US.updateProfile
);

userRouter.patch("/updateProfileImage", 
    multerHost(fileTypes.image).single("profileImage"),
    validation(UV.uploadImageSchema), 
    authentication, 
    US.updateProfileImage
);

userRouter.patch("/updateCoverImage", 
    multerHost(fileTypes.image).single("coverImage"),
    validation(UV.uploadImageSchema), 
    authentication, 
    US.updateCoverImage
);

userRouter.delete("/deleteProfileImage", authentication, US.deleteProfileImage);
userRouter.delete("/deleteCoverImage", authentication, US.deleteCoverImage);

userRouter.patch("/updatePassword", 
    validation(UV.updatePasswordSchema), 
    authentication, 
    US.updatePassword
);

userRouter.get("/shareProfile/:id", validation(UV.shareProfileSchema), authentication, US.shareProfile);

userRouter.patch("/updateEmail", validation(UV.updateEmailSchema), authentication, US.updateEmail);
userRouter.patch("/replaceEmail", validation(UV.replaceEmailSchema), authentication, US.replaceEmail);

userRouter.get("/dashboard", 
    authentication, 
    authorization([roleTypes.admin, roleTypes.superAdmin]), 
    US.dashboard
);

userRouter.patch("/dashboard/updateRole/:userId", 
    authentication, 
    authorization([roleTypes.admin, roleTypes.superAdmin]), 
    US.updateRole
);

userRouter.patch("/add/:userId", authentication, validation(UV.friendSchema), US.addFriend);
userRouter.patch("/remove/:userId", authentication, validation(UV.friendSchema), US.removeFriend);

userRouter.get("/profile", authentication, US.getProfile);


userRouter.patch("/blockUser/:userId", authentication, validation(UV.blockUserSchema), US.blockUser);
userRouter.patch("/unBlockUser/:userId", authentication, validation(UV.blockUserSchema), US.unBlockUser);

export default userRouter  