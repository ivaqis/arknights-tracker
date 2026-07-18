import { GetMonumentRunQuery } from "@api/contracts/monument/GetMonumentRunQuery";
import { ResponseBody } from "@api/contracts/ResponseBody";
import { GetMonumentRunQueryValidator } from "@api/middleware/validators/monument/GetMonumentRunQueryValidator";
import { RequestValidator } from "@api/middleware/validators/RequestValidator";
import e from "express";

export class GetMonumentRunRequestValidator extends RequestValidator<{}, undefined, GetMonumentRunQuery> {
    public readonly name = "GetMonumentRunRequestValidator";

    public constructor(req: e.Request<{}, ResponseBody<unknown>, undefined, GetMonumentRunQuery>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        super(req, res, next, {
            queryValidatorConstructor: GetMonumentRunQueryValidator
        });
    }
}