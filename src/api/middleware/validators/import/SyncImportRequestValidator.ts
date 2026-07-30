import { SyncImportQuery } from "@api/contracts/import/SyncImportQuery";
import { SyncImportRequest } from "@api/contracts/import/SyncImportRequest";
import { ResponseBody } from "@api/contracts/ResponseBody";
import { SyncImportBodyValidator } from "@api/middleware/validators/import/SyncImportBodyValidator";
import { SyncImportQueryValidator } from "@api/middleware/validators/import/SyncImportQueryValidator";
import { RequestValidator } from "@api/middleware/validators/RequestValidator";
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