import { GetImportQuery } from "@api/contracts/import/GetImportQuery.js";
import { ResponseBody } from "@api/contracts/ResponseBody.js";
import { GetImportQueryValidator } from "@api/middleware/validators/import/GetImportQueryValidator.js";
import { RequestValidator } from "@api/middleware/validators/RequestValidator.js";
import e from "express";

export class GetImportRequestValidator extends RequestValidator<{}, undefined, GetImportQuery> {
    public readonly name: string = "ImportRequestValidator";

    public constructor(req: e.Request<{}, ResponseBody<unknown>, undefined, GetImportQuery>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        super(req, res, next, {
            queryValidatorConstructor: GetImportQueryValidator,
        });
    }
}