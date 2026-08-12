import { GetMonumentGroupListQuery } from "@api/contracts/monument/GetMonumentGroupListQuery.js";
import { ResponseBody } from "@api/contracts/ResponseBody.js";
import {
    GetMonumentGroupListQueryValidator
} from "@api/middleware/validators/monument/GetMonumentGroupListQueryValidator.js";
import { RequestValidator } from "@api/middleware/validators/RequestValidator.js";
import e from "express";

export class GetMonumentGroupListRequestValidator extends RequestValidator<{}, undefined, GetMonumentGroupListQuery> {
    public readonly name = "GetMonumentGroupListRequestValidator";

    public constructor(req: e.Request<{}, ResponseBody<unknown>, undefined, GetMonumentGroupListQuery>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        super(req, res, next, {
            queryValidatorConstructor: GetMonumentGroupListQueryValidator
        });
    }
}