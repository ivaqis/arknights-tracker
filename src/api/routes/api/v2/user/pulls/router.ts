import { Controller } from "@api/controllers/Controller";
import { LinkUserPulls } from "@api/controllers/userPulls/LinkUserPulls";
import { UnlinkUserPulls } from "@api/controllers/userPulls/UnlinkUserPulls";
import { RequireAuth } from "@api/middleware/RequireAuth";
import { RequestValidator } from "@api/middleware/validators/RequestValidator";
import { LinkUserPullsRequestValidator } from "@api/middleware/validators/userPulls/LinkUserPullsRequestValidator";
import { UnlinkUserPullsRequestValidator } from "@api/middleware/validators/userPulls/UnlinkUserPullsRequestValidator";
import { AuthType } from "@services/auth/AuthType";
import { Router } from "express";

export const userPullsRouter = Router();

userPullsRouter.post("/link",
    RequireAuth.require(AuthType.FIREBASE),
    RequestValidator.with(LinkUserPullsRequestValidator),
    Controller.with(LinkUserPulls)
);
userPullsRouter.delete("/unlink",
    RequireAuth.require(AuthType.FIREBASE),
    RequestValidator.with(UnlinkUserPullsRequestValidator),
    Controller.with(UnlinkUserPulls)
);