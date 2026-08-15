import { ResponseBody } from "@api/contracts/ResponseBody.js";
import { DeleteAvatarQuery } from "@api/contracts/uploadAvatar/DeleteAvatarQuery.js";
import { RequestValidator } from "@api/middleware/validators/RequestValidator.js";
import { DeleteAvatarQueryValidator } from "@api/middleware/validators/uploadAvatar/DeleteAvatarQueryValidator.js";
import e from "express";

export class DeleteAvatarRequestValidator extends RequestValidator<{}, {}, DeleteAvatarQuery> {
    public readonly name = "DeleteAvatarRequestValidator";

    private constructor(req: e.Request<{}, ResponseBody<unknown>, {}, DeleteAvatarQuery>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        super(req, res, next, {
            queryValidatorConstructor: DeleteAvatarQueryValidator
        });
    }

    public static async validate(req: e.Request<{}, ResponseBody<unknown>, {}, DeleteAvatarQuery>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        const validator = new DeleteAvatarRequestValidator(req, res, next);

        await validator.safeExecute();
    }
}