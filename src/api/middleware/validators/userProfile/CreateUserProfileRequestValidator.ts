import { ResponseBody } from "@api/contracts/ResponseBody";
import { CreateUserProfileQuery } from "@api/contracts/userProfile/CreateUserProfileQuery";
import { CreateUserProfileRequest } from "@api/contracts/userProfile/CreateUserProfileRequest";
import { RequestValidator } from "@api/middleware/validators/RequestValidator";
import { CreateUserProfileBodyValidator } from "@api/middleware/validators/userProfile/CreateUserProfileBodyValidator";
import {
    CreateUserProfileQueryValidator
} from "@api/middleware/validators/userProfile/CreateUserProfileQueryValidator";
import e from "express";

export class CreateUserProfileRequestValidator extends RequestValidator<
    {},
    CreateUserProfileRequest,
    CreateUserProfileQuery
> {
    public readonly name = "CreateUserProfileRequestValidator";

    private constructor(req: e.Request<{}, ResponseBody<unknown>, CreateUserProfileRequest, CreateUserProfileQuery>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        super(req, res, next, {
            queryValidatorConstructor: CreateUserProfileQueryValidator,
            bodyValidatorConstructor: CreateUserProfileBodyValidator
        });
    }

    public static async validate(req: e.Request<{}, ResponseBody<unknown>, CreateUserProfileRequest, CreateUserProfileQuery>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        const validator = new CreateUserProfileRequestValidator(req, res, next);

        await validator.safeExecute();
    }
}