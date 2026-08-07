import { ResponseBody } from "@api/contracts/ResponseBody.js";
import { LinkUserPullsQuery } from "@api/contracts/userPulls/LinkUserPullsQuery.js";
import { LinkUserPullsRequest } from "@api/contracts/userPulls/LinkUserPullsRequest.js";
import { RequestValidator } from "@api/middleware/validators/RequestValidator.js";
import { LinkUserPullsBodyValidator } from "@api/middleware/validators/userPulls/LinkUserPullsBodyValidator.js";
import { LinkUserPullsQueryValidator } from "@api/middleware/validators/userPulls/LinkUserPullsQueryValidator.js";
import e from "express";

export class LinkUserPullsRequestValidator extends RequestValidator<{}, LinkUserPullsRequest, LinkUserPullsQuery> {
    public readonly name: string = "LinkUserPullsRequest";

    public constructor(req: e.Request<{}, ResponseBody<unknown>, LinkUserPullsRequest, LinkUserPullsQuery>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        super(req, res, next, {
            queryValidatorConstructor: LinkUserPullsQueryValidator,
            bodyValidatorConstructor: LinkUserPullsBodyValidator
        });
    }
}