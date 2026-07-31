import { RankingRateQuery } from "@api/contracts/rankings/RankingRateQuery";
import { ResponseBody } from "@api/contracts/ResponseBody";
import { RankingRateQueryValidator } from "@api/middleware/validators/rankings/RankingRateQueryValidator";
import { RequestValidator } from "@api/middleware/validators/RequestValidator";
import e from "express";

export class RankingRateRequestValidator extends RequestValidator<{}, undefined, RankingRateQuery> {
    public readonly name = "RankingDataRequestValidator";

    public constructor(req: e.Request<{}, ResponseBody<unknown>, undefined, RankingRateQuery>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        super(req, res, next, {
            queryValidatorConstructor: RankingRateQueryValidator
        });
    }
}