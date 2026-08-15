import { Controller } from "@api/controllers/Controller.js";
import { LinkUserPulls } from "@api/controllers/userPulls/LinkUserPulls.js";
import { UnlinkUserPulls } from "@api/controllers/userPulls/UnlinkUserPulls.js";
import { RequireAuth } from "@api/middleware/RequireAuth.js";
import { RequestValidator } from "@api/middleware/validators/RequestValidator.js";
import { LinkUserPullsRequestValidator } from "@api/middleware/validators/userPulls/LinkUserPullsRequestValidator.js";
import { UnlinkUserPullsRequestValidator } from "@api/middleware/validators/userPulls/UnlinkUserPullsRequestValidator.js";
import { AuthType } from "@services/auth/AuthType.js";
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