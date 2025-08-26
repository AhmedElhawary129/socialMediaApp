import * as dbService from "../../DB/dbService.js";
import { commentModel, postModel } from "../../DB/models/index.js";
import cloudinary from "../../utils/cloudinary/index.js";
import { AppError, asyncHandler } from "../../utils/index.js";
import { roleTypes } from "../../DB/enums.js";

//---------------------------------------------------------------------------------------------------------------

// create comment
export const createComment = asyncHandler(async(req, res, next) => {
    const {refId} = req.params
    const {onModel} = req.body

    let created;
    if (onModel == "Post") {
        const post = await dbService.findOne({
            model: postModel, 
            filter: {_id: refId, isDeleted: false}
        })
        if (!post) {
            return next(new AppError("Post not found or deleted", 404))
        }
        created = "Comment"
        
    } else if (onModel == "Comment") {
        const comment = await dbService.findOne({
            model: commentModel, 
            filter: {_id: refId, isDeleted: false}
        })
        if (!comment) {
            return next(new AppError("Comment not found or deleted", 404))
        }
        created = "Reply"
    }

    if (req.file) {
            const {secure_url, public_id} =  await cloudinary.uploader.upload(req.file.path, {
                folder: `socialMediaApp/comments/${req.user._id}/attachments`
            })
        req.body.commentAttachment = {secure_url, public_id}
    }

    const comment = await dbService.create({
        model: commentModel, 
        query: {...req.body, refId, userId: req.user._id}
    })
    return res.status(201).json({msg: `${created} created successfully`, comment})
})

//---------------------------------------------------------------------------------------------------------------

// update comment
export const updateComment = asyncHandler(async(req, res, next) => {
    const {commentId, refId} = req.params;

    const post = await dbService.findOne({
        model: postModel,
        filter: {
            _id: refId, 
            isDeleted: false
        }
    })
    if (!post) {
        return next(new AppError("Post not found or deleted", 404))
    }

    const comment = await dbService.findOne({
        model: commentModel,
        filter: {
            _id: commentId, 
            isDeleted: false,
            refId,
            userId: req.user._id
        }
    })
    if (!comment) {
        return next(new AppError("Comment not found or deleted", 404))
    }

    if(req.file) {
        await cloudinary.uploader.destroy(comment.commentAttachment.public_id)
        const {secure_url, public_id} =  await cloudinary.uploader.upload(req.file.path, {
            folder: `socialMediaApp/comments/${req.user._id}/attachments`
        })
        comment.commentAttachment = {secure_url, public_id}
    }

    const updatedComment =  await dbService.findByIdAndUpdate({
        model: commentModel, 
        filter: {_id: commentId}, 
        update: req.body,
        options: {new: true}
    })
    return res.status(201).json({msg: "Comment updated successfully", comment: updatedComment})
})

//---------------------------------------------------------------------------------------------------------------

// freeze comment
export const freezeComment = asyncHandler(async(req, res, next) => {
    const {commentId, refId} = req.params;

    const comment = await dbService.findOne({
        model: commentModel,
        filter: {
            _id: commentId, 
            isDeleted: false,
            refId
        } 
    })
    
    if (!comment || (
        req.user.role != roleTypes.admin 
        && 
        req.user._id.toString() != comment.userId.toString()
        &&
        req.user._id.toString() != comment.postId.userId.toString()
    )) {
        return next(new AppError("Comment already frozen or you don't have permission to freeze this comment", 403))
    }

    const frozenComment = await dbService.findByIdAndUpdate({
        model: commentModel, 
        filter: {_id: commentId}, 
        update: {isDeleted: true, deletedBy: req.user._id}, 
        options: {new: true},
        select: "content attachments isDeleted deletedBy -_id"
    })
    return res.status(201).json({msg: "Comment frozen successfully", comment: frozenComment})
})

//---------------------------------------------------------------------------------------------------------------

// unfreeze comment
export const unFreezeComment = asyncHandler(async(req, res, next) => {
    const {commentId, refId} = req.params;

    const comment = await dbService.findOneAndUpdate({
        model: commentModel, 
        filter: {
            _id: commentId, 
            isDeleted: true, 
            refId,
            deletedBy: req.user._id
        }, 
        update: {
            isDeleted: false, 
            $unset: {deletedBy: 0}
        }, options: {new: true},
        select: "content attachments isDeleted -_id"
    })

    if (!comment) {
        return next(new AppError("Comment not found or already unFrozen or unauthorized", 404))
    }
    return res.status(201).json({msg: "Comment unfrozen successfully", comment})
})

//-----------------------------------------------------------------------------------------------------------------

// like comment
export const likeComment = asyncHandler(async(req, res, next) => {
    const {commentId, refId} = req.params;

    const post = await dbService.findOne({
        model: postModel,
        filter: {
            _id: refId, 
            isDeleted: false
        }
    })
    if (!post) {
        return next(new AppError("Post not found or deleted", 404))
    }

    const commentExist = await dbService.findOne({
        model: commentModel,
        filter: {
            _id: commentId, 
            isDeleted: false,
            refId
        }
    })
    if (!commentExist) {
        return next(new AppError("Comment not found or deleted", 404))
    }

    const comment = await dbService.findOne({
        model: commentModel,
        filter: {
            _id: commentId, 
            isDeleted: false,
            likes: {$in: req.user._id}
        }
    })

    let updateComment;
    let action;
    if (comment) {
        updateComment = await dbService.findOneAndUpdate({
            model: commentModel, 
            filter: {_id: commentId, isDeleted: false}, 
            update: {$pull: {likes: req.user._id}}, 
            options: {new: true}
        })
        action = "unLike"
    } else {
        updateComment = await dbService.findOneAndUpdate({
            model: commentModel, 
            filter: {_id: commentId, isDeleted: false}, 
            update: {$addToSet: {likes: req.user._id}}, 
            options: {new: true}
        })
        action = "like"
    }
    if (!updateComment) {
        return next(new AppError("Comment not found or deleted", 404))
    }
    return res.status(201).json({msg: `${action} The comment`, comment: updateComment})
})