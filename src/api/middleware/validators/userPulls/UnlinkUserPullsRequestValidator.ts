import { ResponseBody } from "@api/contracts/ResponseBody";
import { UnlinkUserPullsQuery } from "@api/contracts/userPulls/UnlinkUserPullsQuery";
import { RequestValidator } from "@api/middleware/validators/RequestValidator";
import { UnlinkUserPullsQueryValidator } from "@api/middleware/validators/userPulls/UnlinkUserPullsQueryValidator";
import e from "express";

export class UnlinkUserPullsRequestValidator extends RequestValidator<{}, undefined, UnlinkUserPullsQuery> {
    public readonly name = "UnlinkUserPullsRequestValidator";

    public constructor(req: e.Request<{}, ResponseBody<unknown>, undefined, UnlinkUserPullsQuery>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        super(req, res, next, {
            queryValidatorConstructor: UnlinkUserPullsQueryValidator
        });
    }
}