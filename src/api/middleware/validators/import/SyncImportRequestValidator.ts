import { SyncImportQuery } from "@api/contracts/import/SyncImportQuery.js";
import { SyncImportRequest } from "@api/contracts/import/SyncImportRequest.js";
import { ResponseBody } from "@api/contracts/ResponseBody.js";
import { SyncImportBodyValidator } from "@api/middleware/validators/import/SyncImportBodyValidator.js";
import { SyncImportQueryValidator } from "@api/middleware/validators/import/SyncImportQueryValidator.js";
import { RequestValidator } from "@api/middleware/validators/RequestValidator.js";
import e from "express";

export class SyncImportRequestValidator extends RequestValidator<{}, SyncImportRequest, SyncImportQuery> {
    public readonly name: string = "SyncImportRequestValidator";

    public constructor(req: e.Request<{}, ResponseBody<unknown>, SyncImportRequest, SyncImportQuery>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        super(req, res, next, {
            queryValidatorConstructor: SyncImportQueryValidator,
            bodyValidatorConstructor: SyncImportBodyValidator
        });
    }
}