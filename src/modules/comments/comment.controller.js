import { Router } from "express";
import * as CS from "./comment.service.js";
import * as CV from "./comment.validation.js";
import { authentication } from "../../middleware/auth.js";
import { validation } from "../../middleware/validation.js";
import { multerHost } from "../../middleware/multer.js";
import { fileTypes } from "../../DB/enums.js";

//---------------------------------------------------------------------------------------------------------------

// marge params
const commentRouter =  Router({ mergeParams: true });

//---------------------------------------------------------------------------------------------------------------

// routes
commentRouter.post("/create", 
    multerHost([...fileTypes.image, ...fileTypes.video]).single("commentAttachment"),
    validation(CV.createCommentSchema), 
    authentication,
    CS.createComment
);

commentRouter.patch("/update/:commentId", 
    multerHost([...fileTypes.image, ...fileTypes.video]).single("commentAttachment"),
    validation(CV.updateCommentSchema), 
    authentication,
    CS.updateComment
);

commentRouter.delete("/freeze/:commentId", 
    validation(CV.freezeCommentSchema), 
    authentication,
    CS.freezeComment
);

commentRouter.patch("/unFreeze/:commentId", 
    validation(CV.freezeCommentSchema), 
    authentication,
    CS.unFreezeComment
);

commentRouter.patch("/likeComment/:commentId", 
    validation(CV.likeCommentSchema), 
    authentication,
    CS.likeComment
);

export default commentRouter