import { ResponseBody } from "@api/contracts/ResponseBody.js";
import { CreateUserProfileRequest } from "@api/contracts/userProfile/CreateUserProfileRequest.js";
import { RequestValidator } from "@api/middleware/validators/RequestValidator.js";
import { CreateUserProfileBodyValidator } from "@api/middleware/validators/userProfile/CreateUserProfileBodyValidator.js";
import e from "express";

export class CreateUserProfileRequestValidator extends RequestValidator<
    {},
    CreateUserProfileRequest,
    undefined
> {
    public readonly name = "CreateUserProfileRequestValidator";

    private constructor(req: e.Request<{}, ResponseBody<unknown>, CreateUserProfileRequest, undefined>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        super(req, res, next, {
            bodyValidatorConstructor: CreateUserProfileBodyValidator
        });
    }

    public static async validate(req: e.Request<{}, ResponseBody<unknown>, CreateUserProfileRequest, undefined>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        const validator = new CreateUserProfileRequestValidator(req, res, next);

        await validator.safeExecute();
    }
}