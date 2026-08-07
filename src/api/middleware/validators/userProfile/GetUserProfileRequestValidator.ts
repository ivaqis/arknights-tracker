import { ResponseBody } from "@api/contracts/ResponseBody.js";
import { GetUserProfileQuery } from "@api/contracts/userProfile/GetUserProfileQuery.js";
import { RequestValidator } from "@api/middleware/validators/RequestValidator.js";
import { GetUserProfileQueryValidator } from "@api/middleware/validators/userProfile/GetUserProfileQueryValidator.js";
import e from "express";

export class GetUserProfileRequestValidator extends RequestValidator<
    {},
    {},
    GetUserProfileQuery
> {
    public readonly name = "GetUserProfileRequestValidator";

    private constructor(req: e.Request<{}, ResponseBody<unknown>, {}, GetUserProfileQuery>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        super(req, res, next, {
            queryValidatorConstructor: GetUserProfileQueryValidator
        });
    }

    public static async validate(req: e.Request<{}, ResponseBody<unknown>, {}, GetUserProfileQuery>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        const validator = new GetUserProfileRequestValidator(req, res, next);

        await validator.safeExecute();
    }
}