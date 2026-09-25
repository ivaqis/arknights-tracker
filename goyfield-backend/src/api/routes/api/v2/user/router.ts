import { authenticator, database, firebase } from "@/serviceInstances.js";
import { Controller } from "@api/controllers/Controller.js";
import { UserExist } from "@api/controllers/userExist/UserExist.js";
import { UserList } from "@api/controllers/userList/UserList.js";
import { generalLimiter } from "@api/middleware/rateLimiters/generalLimiter.js";
import { RequireAuth } from "@api/middleware/RequireAuth.js";
import { RequireService } from "@api/middleware/RequireService.js";
import { RequestValidator } from "@api/middleware/validators/RequestValidator.js";
import { UserExistRequestValidator } from "@api/middleware/validators/userExist/UserExistRequestValidator.js";
import { gameAccountRouter } from "@api/routes/api/v2/user/gameAccount/router.js";
import { profileRouter } from "@api/routes/api/v2/user/profile/router.js";
import { userPullsRouter } from "@api/routes/api/v2/user/pulls/router.js";
import { syncRouter } from "@api/routes/api/v2/user/sync/router.js";
import { avatarRouter } from "@api/routes/api/v2/user/avatar/router.js";
import { AuthType } from "@services/auth/AuthType.js";
import { Router } from "express";

export const userRouter = Router();

userRouter.use(RequireService.require(database, firebase, authenticator));
userRouter.use(generalLimiter);

userRouter.use("/game-account", gameAccountRouter);
userRouter.use("/profile", profileRouter);
userRouter.use("/sync", syncRouter);
userRouter.use("/avatar", avatarRouter);
userRouter.use("/pulls", userPullsRouter);

userRouter.get("/exist",
    RequestValidator.with(UserExistRequestValidator),
    Controller.with(UserExist)
);
userRouter.get("/list",
    RequireAuth.require(AuthType.FIREBASE),
    Controller.with(UserList)
);