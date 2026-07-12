import { ResponseBody } from "@api/contracts/ResponseBody";
import { UpdateUserProfileQuery } from "@api/contracts/userProfile/UpdateUserProfileQuery";
import { UpdateUserProfileRequest } from "@api/contracts/userProfile/UpdateUserProfileRequest";
import { RequestValidator } from "@api/middleware/validators/RequestValidator";
import { UpdateUserProfileBodyValidator } from "@api/middleware/validators/userProfile/UpdateUserProfileBodyValidator";
import {
    UpdateUserProfileQueryValidator
} from "@api/middleware/validators/userProfile/UpdateUserProfileQueryValidator";
import e from "express";

export class UpdateUserProfileRequestValidator
    extends RequestValidator<
        {},
        UpdateUserProfileRequest,
        UpdateUserProfileQuery
    > {
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