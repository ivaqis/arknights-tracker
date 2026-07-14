import { ResponseBody } from "@api/contracts/ResponseBody";
import { SyncProfileQuery } from "@api/contracts/syncProfile/SyncProfileQuery";
import { SyncProfileRequest } from "@api/contracts/syncProfile/SyncProfileRequest";
import { RequestValidator } from "@api/middleware/validators/RequestValidator";
import { SyncProfileBodyValidator } from "@api/middleware/validators/syncProfile/SyncProfileBodyValidator";
import { SyncProfileQueryValidator } from "@api/middleware/validators/syncProfile/SyncProfileQueryValidator";
import e from "express";

export class SyncProfileRequestValidator extends RequestValidator<{}, SyncProfileRequest, SyncProfileQuery> {

    private constructor(req: e.Request<{}, ResponseBody<unknown>, SyncProfileRequest, SyncProfileQuery>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        super(req, res, next, {
            queryValidatorConstructor: SyncProfileQueryValidator,
            bodyValidatorConstructor: SyncProfileBodyValidator
        });
    }

    public static async validate(req: e.Request<{}, ResponseBody<unknown>, SyncProfileRequest, SyncProfileQuery>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        const validator = new SyncProfileRequestValidator(req, res, next);

        await validator.safeExecute();
    }
}