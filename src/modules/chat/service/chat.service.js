import * as dbService from "../../../DB/dbService.js";
import { chatModel } from "../../../DB/models/index.js";
import { asyncHandler } from "../../../utils/index.js";

// get chat
export const getChat = asyncHandler (async(req, res, next) => {
    const {userId} = req.params;

    const chat = await dbService.findOne({
        model: chatModel,
        filter: {
            $or: [
                {mainUser: req.user._id, subParticipant: userId},
                {mainUser: userId, subParticipant: req.user._id}
            ]
        },
        populate: [
            {path: "mainUser"},
            {path: "messages.senderId"}
        ]
    })
    return res.status(200).json({message: "done", chat})
})