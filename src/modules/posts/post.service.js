import * as dbService from "../../DB/dbService.js";
import { roleTypes } from "../../DB/enums.js";
import { postModel, userModel } from "../../DB/models/index.js";
import cloudinary from "../../utils/cloudinary/index.js";
import { pagination } from "../../utils/features/index.js";
import { AppError, asyncHandler } from "../../utils/index.js";

//---------------------------------------------------------------------------------------------------------------

// create post
export const createPost = asyncHandler(async(req, res, next) => {

if (req.files?.length) {
        const attachments = [];
        for (const file of req.files) {
            const {public_id, secure_url} = await cloudinary.uploader.upload(file.path, {
                folder: `socialMediaApp/posts/${req.user._id}/attachments`
            })
            attachments.push({secure_url, public_id})
        }
        req.body.postAttachments = attachments
    }

    const post = await dbService.create({
        model: postModel, 
        query: {...req.body, userId: req.user._id}
    })
    return res.status(201).json({msg: "Post created successfully", post})
})

//-----------------------------------------------------------------------------------------------------------------

// update post
export const updatePost = asyncHandler(async(req, res, next) => {
    const {postId} = req.params;

    const post = await dbService.findOne({
        model: postModel,
        filter: {_id: postId, userId: req.user._id, isDeleted: false}
    })
    if (!post) {
        return next(new AppError("Post not found or deleted or unauthorized", 404))
    }

    if (req.files?.length) {
        for (const file of post.postAttachments) {
            await cloudinary.uploader.destroy(file.public_id)
        }
        const attachments = [];
        for (const file of req.files) {
            const {public_id, secure_url} = await cloudinary.uploader.upload(file.path, {
                folder: `socialMediaApp/posts/${req.user._id}/attachments`
            })
            attachments.push({secure_url, public_id})
        }
        post.postAttachments = attachments
    }

    if (req.body.content) {
        post.content = req.body.content
    }
    await post.save()

    return res.status(201).json({msg: "Post updated successfully", post})
})

//-----------------------------------------------------------------------------------------------------------------

// freeze post
export const freezePost = asyncHandler(async(req, res, next) => {
    const {postId} = req.params;
    const condition = req.user.role === roleTypes.admin ? {} : {userId: req.user._id}
    
    const post = await dbService.findByIdAndUpdate({
        model: postModel, 
        filter: {_id: postId, ...condition, isDeleted: false}, 
        update: {isDeleted: true, deletedBy: req.user._id}, 
        options: {new: true}
    })
    if (!post) {
        return next(new AppError("Post not found or already frozen", 404))
    }
    return res.status(201).json({msg: "Post frozen successfully"})
})

//-----------------------------------------------------------------------------------------------------------------

// unfreeze post
export const unFreezePost = asyncHandler(async(req, res, next) => {
    const {postId} = req.params;

    const post = await dbService.findOneAndUpdate({
        model: postModel, 
        filter: {_id: postId, isDeleted: true, deletedBy: req.user._id}, 
        update: {isDeleted: false, $unset: {deletedBy: 0}}, 
        options: {new: true}
    })
    if (!post) {
        return next(new AppError("Post not found or already unFrozen", 404))
    }
    return res.status(201).json({msg: "Post unFrozen successfully"})
})

//-----------------------------------------------------------------------------------------------------------------

// like post
export const likePost = asyncHandler(async(req, res, next) => {
    const {postId} = req.params;

    const post = await dbService.findOne({
        model: postModel,
        filter: {
            _id: postId, 
            isDeleted: false,
            likes: {$in: req.user._id}
        }
    })

    let updatPost;
    let action;
    if (post) {
        updatPost = await dbService.findOneAndUpdate({
            model: postModel, 
            filter: {_id: postId, isDeleted: false}, 
            update: {$pull: {likes: req.user._id}}, 
            options: {new: true}
        })
        action = "unLike"
    } else {
        updatPost = await dbService.findOneAndUpdate({
            model: postModel, 
            filter: {_id: postId, isDeleted: false}, 
            update: {$addToSet: {likes: req.user._id}}, 
            options: {new: true}
        })
        action = "like"
    }
    if (!updatPost) {
        return next(new AppError("Post not found or deleted", 404))
    }
    return res.status(201).json({msg: `${action} The post`, post: updatPost})
})

//-----------------------------------------------------------------------------------------------------------------

// get posts
export const getPosts = asyncHandler(async(req, res, next) => {
    const {data, _page} = await pagination({model: postModel, page: req.query.page || 1})
    return res.status(200).json({msg: "All posts", Page: _page, Posts: data})
})

//-----------------------------------------------------------------------------------------------------------------

// user posts
export const userPosts = asyncHandler(async(req, res, next) => {
    const {userId} = req.params;

    const user = await dbService.findOne({
        model: userModel,
        filter: {_id: userId, isDeleted: false}
    })
    if (!user) {
        return next(new AppError("User not found or deleted", 404))
    }

    const {data, _page} = await pagination({
        model: postModel, 
        filter: {userId, isDeleted: false},
        page: req.query.page || 1
    })
    return res.status(200).json({msg: "All posts", Page: _page, Posts: data})
})

//-----------------------------------------------------------------------------------------------------------------

// archive post
export const archivePost = asyncHandler(async(req, res, next) => {
    const {postId} = req.params;

    const condition = req.user.role === roleTypes.admin ? {} : {userId: req.user._id}
    const post = await dbService.findOne({
        model: postModel,
        filter: {
            _id: postId,
            ...condition,
            isDeleted: false,
            isArchived: false,
            userId: req.user._id
        }
    })
    if (!post) {
        return next(new AppError("Post not found or deleted or already archived", 404))
    }

    await dbService.updateOne({
        model: postModel,
        filter: {_id: postId},
        update: {
            isArchived: true,
            archivedBy: req.user._id
        }
    })
    return res.status(201).json({msg: "Post archived successfully"})
})

//-----------------------------------------------------------------------------------------------------------------

// unArchive post
export const unArchivePost = asyncHandler(async(req, res, next) => {
    const {postId} = req.params;

    const post = await dbService.findOne({
        model: postModel,
        filter: {
            _id: postId,
            isDeleted: false,
            isArchived: true,
            archivedBy: req.user._id
        }
    })
    if (!post) {
        return next(new AppError("Post not found or deleted or already unArchived or unauthorized", 404))
    }

    await dbService.updateOne({
        model: postModel,
        filter: {_id: postId},
        update: {
            isArchived: false,
            $unset: {archivedBy: 0}
        }
    })
    return res.status(201).json({msg: "Post unArchived successfully"})
})