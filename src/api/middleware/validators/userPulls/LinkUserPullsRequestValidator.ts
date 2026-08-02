import { ResponseBody } from "@api/contracts/ResponseBody";
import { LinkUserPullsQuery } from "@api/contracts/userPulls/LinkUserPullsQuery";
import { LinkUserPullsRequest } from "@api/contracts/userPulls/LinkUserPullsRequest";
import { RequestValidator } from "@api/middleware/validators/RequestValidator";
import { LinkUserPullsBodyValidator } from "@api/middleware/validators/userPulls/LinkUserPullsBodyValidator";
import { LinkUserPullsQueryValidator } from "@api/middleware/validators/userPulls/LinkUserPullsQueryValidator";
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