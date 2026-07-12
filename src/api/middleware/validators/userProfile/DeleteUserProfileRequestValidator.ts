import { ResponseBody } from "@api/contracts/ResponseBody";
import { DeleteUserProfileQuery } from "@api/contracts/userProfile/DeleteUserProfileQuery";
import { RequestValidator } from "@api/middleware/validators/RequestValidator";
import {
    DeleteUserProfileQueryValidator
} from "@api/middleware/validators/userProfile/DeleteUserProfileQueryValidator";
import e from "express";

export class DeleteUserProfileRequestValidator extends RequestValidator<{}, {}, DeleteUserProfileQuery> {

    private constructor(req: e.Request<{}, ResponseBody<unknown>, {}, DeleteUserProfileQuery>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        super(req, res, next, {
            queryValidatorConstructor: DeleteUserProfileQueryValidator
        });
    }

    public static async validate(req: e.Request<{}, ResponseBody<unknown>, {}, DeleteUserProfileQuery>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        const validator = new DeleteUserProfileRequestValidator(req, res, next);

        await validator.safeExecute();
    }
}