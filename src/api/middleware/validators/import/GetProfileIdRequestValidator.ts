import { GetProfileIdQuery } from "@api/contracts/import/GetProfileIdQuery";
import { ResponseBody } from "@api/contracts/ResponseBody";
import { GetProfileIdQueryValidator } from "@api/middleware/validators/import/GetProfileIdQueryValidator";
import { RequestValidator } from "@api/middleware/validators/RequestValidator";
import e from "express";

export class GetProfileIdRequestValidator extends RequestValidator<{}, undefined, GetProfileIdQuery> {
    public readonly name: string = "GetProfileIdRequestValidator";

    public constructor(req: e.Request<{}, ResponseBody<unknown>, undefined, GetProfileIdQuery>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        super(req, res, next, {
            queryValidatorConstructor: GetProfileIdQueryValidator
        });
    }
}