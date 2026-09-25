import { ResponseBody } from "@api/contracts/ResponseBody.js";
import { UpdateUserProfileQuery } from "@api/contracts/userProfile/UpdateUserProfileQuery.js";
import { UpdateUserProfileRequest } from "@api/contracts/userProfile/UpdateUserProfileRequest.js";
import { RequestValidator } from "@api/middleware/validators/RequestValidator.js";
import { UpdateUserProfileBodyValidator } from "@api/middleware/validators/userProfile/UpdateUserProfileBodyValidator.js";
import {
    UpdateUserProfileQueryValidator
} from "@api/middleware/validators/userProfile/UpdateUserProfileQueryValidator.js";
import e from "express";

export class UpdateUserProfileRequestValidator
    extends RequestValidator<
        {},
        UpdateUserProfileRequest,
        UpdateUserProfileQuery
    > {
    public readonly name = "UpdateUserProfileRequestValidator";

    private constructor(req: e.Request<{}, ResponseBody<unknown>, UpdateUserProfileRequest, UpdateUserProfileQuery>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        super(req, res, next, {
            bodyValidatorConstructor: UpdateUserProfileBodyValidator,
            queryValidatorConstructor: UpdateUserProfileQueryValidator
        });
    }

    public static async validate(req: e.Request<{}, ResponseBody<unknown>, UpdateUserProfileRequest, UpdateUserProfileQuery>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        const validator = new UpdateUserProfileRequestValidator(req, res, next);

        await validator.safeExecute();
    }
}