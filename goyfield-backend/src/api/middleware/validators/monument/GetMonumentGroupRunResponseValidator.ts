import { GetMonumentGroupRunQuery } from "@api/contracts/monument/GetMonumentGroupRunQuery.js";
import { ResponseBody } from "@api/contracts/ResponseBody.js";
import {
    GetMonumentGroupRunQueryValidator
} from "@api/middleware/validators/monument/GetMonumentGroupRunQueryValidator.js";
import { RequestValidator } from "@api/middleware/validators/RequestValidator.js";
import e from "express";

export class GetMonumentGroupRunResponseValidator extends RequestValidator<{}, undefined, GetMonumentGroupRunQuery> {
    public readonly name = "GetMonumentGroupRunResponseValidator";

    public constructor(req: e.Request<{}, ResponseBody<unknown>, undefined, GetMonumentGroupRunQuery>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        super(req, res, next, {
            queryValidatorConstructor: GetMonumentGroupRunQueryValidator
        });
    }
}