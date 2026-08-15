import { RankingRateQuery } from "@api/contracts/rankings/RankingRateQuery.js";
import { ResponseBody } from "@api/contracts/ResponseBody.js";
import { RankingRateQueryValidator } from "@api/middleware/validators/rankings/RankingRateQueryValidator.js";
import { RequestValidator } from "@api/middleware/validators/RequestValidator.js";
import e from "express";

export class RankingRateRequestValidator extends RequestValidator<{}, undefined, RankingRateQuery> {
    public readonly name = "RankingDataRequestValidator";

    public constructor(req: e.Request<{}, ResponseBody<unknown>, undefined, RankingRateQuery>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        super(req, res, next, {
            queryValidatorConstructor: RankingRateQueryValidator
        });
    }
}