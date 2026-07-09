import { gameAccountRouter } from "@api/routes/api/user/gameAccount/router";
import { profileRouter } from "@api/routes/api/user/profile/router";
import { syncRouter } from "@api/routes/api/user/sync/router";
import { uploadAvatarRouter } from "@api/routes/api/user/uploadAvatar/router";
import { Router } from "express";

export const userRouter = Router();

userRouter.use("/game-account", gameAccountRouter);
userRouter.use("/profile", profileRouter);
userRouter.use("/sync", syncRouter);
userRouter.use("/upload-avatar", uploadAvatarRouter);