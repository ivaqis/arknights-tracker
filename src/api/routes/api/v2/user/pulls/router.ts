import { Controller } from "@api/controllers/Controller";
import { LinkUserPulls } from "@api/controllers/userPulls/LinkUserPulls";
import { RequestValidator } from "@api/middleware/validators/RequestValidator";
import { LinkUserPullsRequestValidator } from "@api/middleware/validators/userPulls/LinkUserPullsRequestValidator";
import { UnlinkUserPullsRequestValidator } from "@api/middleware/validators/userPulls/UnlinkUserPullsRequestValidator";
import { Router } from "express";

export const userPullsRouter = Router();

userPullsRouter.post("/link",
    RequestValidator.with(LinkUserPullsRequestValidator),
    Controller.with(LinkUserPulls)
); // todo
userPullsRouter.delete("/unlink",
    RequestValidator.with(UnlinkUserPullsRequestValidator)
); // todo