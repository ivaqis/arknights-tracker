import { ResponseBody } from "@api/contracts/ResponseBody";
import { DeleteAvatarQuery } from "@api/contracts/uploadAvatar/DeleteAvatarQuery";
import { RequestValidator } from "@api/middleware/validators/RequestValidator";
import { DeleteAvatarQueryValidator } from "@api/middleware/validators/uploadAvatar/DeleteAvatarQueryValidator";
import e from "express";

export class DeleteAvatarRequestValidator extends RequestValidator<{}, {}, DeleteAvatarQuery> {

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