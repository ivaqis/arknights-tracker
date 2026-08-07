import { GetProfileIdQuery } from "@api/contracts/import/GetProfileIdQuery.js";
import { ResponseBody } from "@api/contracts/ResponseBody.js";
import { GetProfileIdQueryValidator } from "@api/middleware/validators/import/GetProfileIdQueryValidator.js";
import { RequestValidator } from "@api/middleware/validators/RequestValidator.js";
import e from "express";

export class GetProfileIdRequestValidator extends RequestValidator<{}, undefined, GetProfileIdQuery> {
    public readonly name: string = "GetProfileIdRequestValidator";

    public constructor(req: e.Request<{}, ResponseBody<unknown>, undefined, GetProfileIdQuery>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        super(req, res, next, {
            queryValidatorConstructor: GetProfileIdQueryValidator
        });
    }
}