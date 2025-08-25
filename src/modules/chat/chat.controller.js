import { Router } from "express";
import { authentication } from "../../middleware/auth.js";
import * as CS from "./service/chat.service.js";

const chatRouter = Router()

// routes
chatRouter.get("/:userId", authentication, CS.getChat)

export default chatRouter;