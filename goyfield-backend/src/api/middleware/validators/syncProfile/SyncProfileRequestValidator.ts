import { ResponseBody } from "@api/contracts/ResponseBody.js";
import { SyncProfileQuery } from "@api/contracts/syncProfile/SyncProfileQuery.js";
import { SyncProfileRequest } from "@api/contracts/syncProfile/SyncProfileRequest.js";
import { RequestValidator } from "@api/middleware/validators/RequestValidator.js";
import { SyncProfileBodyValidator } from "@api/middleware/validators/syncProfile/SyncProfileBodyValidator.js";
import { SyncProfileQueryValidator } from "@api/middleware/validators/syncProfile/SyncProfileQueryValidator.js";
import e from "express";

export class SyncProfileRequestValidator extends RequestValidator<{}, SyncProfileRequest, SyncProfileQuery> {
    public readonly name = "SyncProfileRequestValidator";

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