import { RankingDataQuery } from "@api/contracts/rankings/RankingDataQuery";
import { ResponseBody } from "@api/contracts/ResponseBody";
import { RankingDataQueryValidator } from "@api/middleware/validators/rankings/RankingDataQueryValidator";
import { RequestValidator } from "@api/middleware/validators/RequestValidator";
import e from "express";

export class RankingDataRequestValidator extends RequestValidator<{}, undefined, RankingDataQuery> {
    public readonly name = "RankingDataRequestValidator";

    public constructor(req: e.Request<{}, ResponseBody<unknown>, undefined, RankingDataQuery>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        super(req, res, next, {
            queryValidatorConstructor: RankingDataQueryValidator
        });
    }
}