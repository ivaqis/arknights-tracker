import { ResponseBody } from "@api/contracts/ResponseBody.js";
import { UploadAvatarQuery } from "@api/contracts/uploadAvatar/UploadAvatarQuery.js";
import { UploadAvatarRequest } from "@api/contracts/uploadAvatar/UploadAvatarRequest.js";
import { RequestValidator } from "@api/middleware/validators/RequestValidator.js";
import { UploadAvatarBodyValidator } from "@api/middleware/validators/uploadAvatar/UploadAvatarBodyValidator.js";
import { UploadAvatarQueryValidator } from "@api/middleware/validators/uploadAvatar/UploadAvatarQueryValidator.js";
import e from "express";

export class UploadAvatarRequestValidator extends RequestValidator<{}, UploadAvatarRequest, UploadAvatarQuery> {
    public readonly name = "UploadAvatarRequestValidator";

    private constructor(req: e.Request<{}, ResponseBody<unknown>, UploadAvatarRequest, UploadAvatarQuery>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        super(req, res, next, {
            queryValidatorConstructor: UploadAvatarQueryValidator,
            bodyValidatorConstructor: UploadAvatarBodyValidator
        });
    }

    public static async validate(req: e.Request<{}, ResponseBody<unknown>, UploadAvatarRequest, UploadAvatarQuery>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        const validator = new UploadAvatarRequestValidator(req, res, next);

        await validator.safeExecute();
    }
}