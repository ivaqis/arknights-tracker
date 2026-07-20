import { GetMonumentListQuery } from "@api/contracts/monument/GetMonumentListQuery";
import { ResponseBody } from "@api/contracts/ResponseBody";
import { GetMonumentListQueryValidator } from "@api/middleware/validators/monument/GetMonumentListQueryValidator";
import { RequestValidator } from "@api/middleware/validators/RequestValidator";
import e from "express";

export class GetMonumentListRequestValidator extends RequestValidator<{}, undefined, GetMonumentListQuery> {
    public readonly name = "GetMonumentListRequestValidator";

    public constructor(req: e.Request<{}, ResponseBody<unknown>, undefined, GetMonumentListQuery>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        super(req, res, next, {
            queryValidatorConstructor: GetMonumentListQueryValidator
        });
    }
}