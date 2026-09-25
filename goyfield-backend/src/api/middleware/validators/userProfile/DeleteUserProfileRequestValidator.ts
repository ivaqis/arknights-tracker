import { ResponseBody } from "@api/contracts/ResponseBody.js";
import { DeleteUserProfileQuery } from "@api/contracts/userProfile/DeleteUserProfileQuery.js";
import { RequestValidator } from "@api/middleware/validators/RequestValidator.js";
import {
    DeleteUserProfileQueryValidator
} from "@api/middleware/validators/userProfile/DeleteUserProfileQueryValidator.js";
import e from "express";

export class DeleteUserProfileRequestValidator extends RequestValidator<{}, {}, DeleteUserProfileQuery> {
    public readonly name = "DeleteUserProfileRequestValidator";

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