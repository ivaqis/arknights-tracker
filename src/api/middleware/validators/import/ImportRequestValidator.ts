import { ImportRequest } from "@api/contracts/import/ImportRequest";
import { ResponseBody } from "@api/contracts/ResponseBody";
import { ImportBodyValidator } from "@api/middleware/validators/import/ImportBodyValidator";
import { RequestValidator } from "@api/middleware/validators/RequestValidator";
import e from "express";

export class ImportRequestValidator extends RequestValidator<{}, ImportRequest, {}> {
    public readonly name: string = "ImportRequestValidator";

    public constructor(req: e.Request<{}, ResponseBody<unknown>, ImportRequest, {}>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        super(req, res, next, {
            bodyValidatorConstructor: ImportBodyValidator
        });
    }
}