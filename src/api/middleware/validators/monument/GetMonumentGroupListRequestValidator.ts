import { GetMonumentGroupListQuery } from "@api/contracts/monument/GetMonumentGroupListQuery";
import { ResponseBody } from "@api/contracts/ResponseBody";
import {
    GetMonumentGroupListQueryValidator
} from "@api/middleware/validators/monument/GetMonumentGroupListQueryValidator";
import { RequestValidator } from "@api/middleware/validators/RequestValidator";
import e from "express";

export class GetMonumentGroupListRequestValidator extends RequestValidator<{}, undefined, GetMonumentGroupListQuery> {
    public readonly name = "GetMonumentGroupListRequestValidator";

    public constructor(req: e.Request<{}, ResponseBody<unknown>, undefined, GetMonumentGroupListQuery>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        super(req, res, next, {
            queryValidatorConstructor: GetMonumentGroupListQueryValidator
        });
    }
}