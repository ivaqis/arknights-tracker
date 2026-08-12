import { ResponseBody } from "@api/contracts/ResponseBody.js";
import { UnlinkUserPullsQuery } from "@api/contracts/userPulls/UnlinkUserPullsQuery.js";
import { RequestValidator } from "@api/middleware/validators/RequestValidator.js";
import { UnlinkUserPullsQueryValidator } from "@api/middleware/validators/userPulls/UnlinkUserPullsQueryValidator.js";
import e from "express";

export class UnlinkUserPullsRequestValidator extends RequestValidator<{}, undefined, UnlinkUserPullsQuery> {
    public readonly name = "UnlinkUserPullsRequestValidator";

    public constructor(req: e.Request<{}, ResponseBody<unknown>, undefined, UnlinkUserPullsQuery>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        super(req, res, next, {
            queryValidatorConstructor: UnlinkUserPullsQueryValidator
        });
    }
}