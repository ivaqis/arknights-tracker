import { GetMonumentRunQuery } from "@api/contracts/monument/GetMonumentRunQuery.js";
import { ResponseBody } from "@api/contracts/ResponseBody.js";
import { GetMonumentRunQueryValidator } from "@api/middleware/validators/monument/GetMonumentRunQueryValidator.js";
import { RequestValidator } from "@api/middleware/validators/RequestValidator.js";
import e from "express";

export class GetMonumentRunRequestValidator extends RequestValidator<{}, undefined, GetMonumentRunQuery> {
    public readonly name = "GetMonumentRunRequestValidator";

    public constructor(req: e.Request<{}, ResponseBody<unknown>, undefined, GetMonumentRunQuery>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        super(req, res, next, {
            queryValidatorConstructor: GetMonumentRunQueryValidator
        });
    }
}