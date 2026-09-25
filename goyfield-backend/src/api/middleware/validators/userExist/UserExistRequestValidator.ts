import { ResponseBody } from "@api/contracts/ResponseBody.js";
import { UserExistQuery } from "@api/contracts/userExist/UserExistQuery.js";
import { RequestValidator } from "@api/middleware/validators/RequestValidator.js";
import { UserExistQueryValidator } from "@api/middleware/validators/userExist/UserExistQueryValidator.js";
import e from "express";

export class UserExistRequestValidator extends RequestValidator<{}, undefined, UserExistQuery> {
    public readonly name = "UserExistRequestValidator";

    public constructor(req: e.Request<{}, ResponseBody<unknown>, undefined, UserExistQuery>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        super(req, res, next, {
            queryValidatorConstructor: UserExistQueryValidator,
        });
    }
}