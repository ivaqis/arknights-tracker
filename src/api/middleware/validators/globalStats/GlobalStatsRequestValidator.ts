import { GlobalStatsQuery } from "@api/contracts/globalStats/GlobalStatsQuery";
import { ResponseBody } from "@api/contracts/ResponseBody";
import { GlobalStatsQueryValidator } from "@api/middleware/validators/globalStats/GlobalStatsQueryValidator";
import { RequestValidator } from "@api/middleware/validators/RequestValidator";
import e from "express";

export class GlobalStatsRequestValidator extends RequestValidator<{}, undefined, GlobalStatsQuery> {
    public readonly name = "GlobalStatsRequestValidator";

    public constructor(req: e.Request<{}, ResponseBody<unknown>, undefined, GlobalStatsQuery>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        super(req, res, next, {
            queryValidatorConstructor: GlobalStatsQueryValidator
        });
    }
}