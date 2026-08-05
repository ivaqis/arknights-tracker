import { authenticator, database, firebase } from "@/serviceInstances";
import { Controller } from "@api/controllers/Controller";
import { UserExist } from "@api/controllers/userExist/UserExist";
import { UserList } from "@api/controllers/userList/UserList";
import { RequireAuth } from "@api/middleware/RequireAuth";
import { RequireService } from "@api/middleware/RequireService";
import { RequestValidator } from "@api/middleware/validators/RequestValidator";
import { UserExistRequestValidator } from "@api/middleware/validators/userExist/UserExistRequestValidator";
import { gameAccountRouter } from "@api/routes/api/v2/user/gameAccount/router";
import { profileRouter } from "@api/routes/api/v2/user/profile/router";
import { userPullsRouter } from "@api/routes/api/v2/user/pulls/router";
import { syncRouter } from "@api/routes/api/v2/user/sync/router";
import { avatarRouter } from "@api/routes/api/v2/user/avatar/router";
import { AuthType } from "@services/auth/AuthType";
import { Router } from "express";

export const userRouter = Router();

userRouter.use(RequireService.require(database, firebase, authenticator));

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