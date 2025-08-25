import cors from "cors"
import connectionDB from "./DB/connectionDB.js";
import userRouter from "./modules/users/user.controller.js";
import { AppError, globalErrorHandler } from "./utils/error/index.js";
import path from "path";
import postRouter from "./modules/posts/post.controller.js";
import commentRouter from "./modules/comments/comment.controller.js";
import {rateLimit} from "express-rate-limit";
import chatRouter from "./modules/chat/chat.controller.js";


// limiter
const limiter = rateLimit({
    limit: 50,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: {error: "Too many requests, please try again after 15 minutes"},
    statusCode: 429,
    handler: (req, res, next) => {
            return next(new AppError("Too many requests, please try again after 15 minutes", 429));
    }
})

//---------------------------------------------------------------------------------------------------------------

// bootstrap
const bootstrap = (app, express) => {

    // cors
    app.use(cors())

    // limiter
    app.use(limiter)

    
    // static files
    app.use("/uploads", express.static(path.resolve("src/uploads")));

    // parse incoming data
    app.use(express.json());

    // home route
    app.get("/", (req, res, next) => {
        return res.status(200).json({ msg: "Welcome to my social media app" });
    });

    // DB connection
    connectionDB();

    // routes
    app.use("/users", userRouter);
    app.use("/posts", postRouter);
    app.use("/comments", commentRouter);
    app.use("/chat", chatRouter);


    // handle URL errors
    app.use("*", (req, res, next) => {
        return next(new AppError(`Invalid URL ${req.originalUrl}`, 404));
    });

    // global error handler
    app.use(globalErrorHandler);
};

export default bootstrap;