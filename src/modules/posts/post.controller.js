import { Router } from "express";
import * as PS from "./post.service.js";
import * as PV from "./post.validation.js";
import { validation } from "../../middleware/validation.js";
import { authentication } from "../../middleware/auth.js";
import { multerHost } from "../../middleware/multer.js";
import commentRouter from "../comments/comment.controller.js";
import { fileTypes } from "../../DB/enums.js";

//---------------------------------------------------------------------------------------------------------------

// marge params
const postRouter = Router({caseSensitive: true});
postRouter.use("/:refId/comments", commentRouter);

//---------------------------------------------------------------------------------------------------------------

// routes
postRouter.post("/create", 
    multerHost([...fileTypes.image, ...fileTypes.video]).array("postAttachments"),
    validation(PV.createPostSchema), 
    authentication,
    PS.createPost
);

postRouter.patch("/updatePost/:postId", 
    multerHost([...fileTypes.image, ...fileTypes.video]).array("postAttachments"),
    validation(PV.updatePostSchema), 
    authentication,
    PS.updatePost
);

postRouter.delete("/freezePost/:postId", 
    validation(PV.freezePostSchema), 
    authentication,
    PS.freezePost
);

postRouter.patch("/unFreezePost/:postId", 
    validation(PV.freezePostSchema), 
    authentication,
    PS.unFreezePost
);

postRouter.patch("/likePost/:postId", 
    validation(PV.likePostSchema), 
    authentication,
    PS.likePost
);

postRouter.get("/", PS.getPosts);

postRouter.get("/userPosts/:userId", validation(PV.userPostsSchema), PS.userPosts);

postRouter.patch("/archivePost/:postId", 
    authentication, 
    validation(PV.archivePostSchema), 
    PS.archivePost
)

postRouter.patch("/unArchivePost/:postId", 
    authentication, 
    validation(PV.archivePostSchema), 
    PS.unArchivePost
)

export default postRouter