import { GetMonumentListQuery } from "@api/contracts/monument/GetMonumentListQuery.js";
import { ResponseBody } from "@api/contracts/ResponseBody.js";
import { GetMonumentListQueryValidator } from "@api/middleware/validators/monument/GetMonumentListQueryValidator.js";
import { RequestValidator } from "@api/middleware/validators/RequestValidator.js";
import e from "express";

export class GetMonumentListRequestValidator extends RequestValidator<{}, undefined, GetMonumentListQuery> {
    public readonly name = "GetMonumentListRequestValidator";

    public constructor(req: e.Request<{}, ResponseBody<unknown>, undefined, GetMonumentListQuery>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        super(req, res, next, {
            queryValidatorConstructor: GetMonumentListQueryValidator
        });
    }
}