import { ResponseBody } from "@api/contracts/ResponseBody";
import { UserExistQuery } from "@api/contracts/userExist/UserExistQuery";
import { RequestValidator } from "@api/middleware/validators/RequestValidator";
import { UserExistQueryValidator } from "@api/middleware/validators/userExist/UserExistQueryValidator";
import e from "express";

export class UserExistRequestValidator extends RequestValidator<{}, undefined, UserExistQuery> {
    public readonly name = "UserExistRequestValidator";

    public constructor(req: e.Request<{}, ResponseBody<unknown>, undefined, UserExistQuery>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        super(req, res, next, {
            queryValidatorConstructor: UserExistQueryValidator,
        });
    }

    public static async validate(req: e.Request<{}, ResponseBody<unknown>, undefined, UserExistQuery>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        const validator = new UserExistRequestValidator(req, res, next);

        await validator.safeExecute();
    }
}