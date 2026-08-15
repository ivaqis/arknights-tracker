import { GlobalStatsQuery } from "@api/contracts/globalStats/GlobalStatsQuery.js";
import { ResponseBody } from "@api/contracts/ResponseBody.js";
import { GlobalStatsQueryValidator } from "@api/middleware/validators/globalStats/GlobalStatsQueryValidator.js";
import { RequestValidator } from "@api/middleware/validators/RequestValidator.js";
import e from "express";

export class GlobalStatsRequestValidator extends RequestValidator<{}, undefined, GlobalStatsQuery> {
    public readonly name = "GlobalStatsRequestValidator";

    public constructor(req: e.Request<{}, ResponseBody<unknown>, undefined, GlobalStatsQuery>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        super(req, res, next, {
            queryValidatorConstructor: GlobalStatsQueryValidator
        });
    }
}