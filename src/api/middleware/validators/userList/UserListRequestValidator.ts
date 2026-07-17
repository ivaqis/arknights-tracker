import { ResponseBody } from "@api/contracts/ResponseBody";
import { UserListQuery } from "@api/contracts/userList/UserListQuery";
import { RequestValidator } from "@api/middleware/validators/RequestValidator";
import { UserListQueryValidator } from "@api/middleware/validators/userList/UserListQueryValidator";
import e from "express";

export class UserListRequestValidator extends RequestValidator<{}, undefined, UserListQuery> {
    public readonly name = "UserListRequestValidator";

    public constructor(req: e.Request<{}, ResponseBody<unknown>, undefined, UserListQuery>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        super(req, res, next, {
            queryValidatorConstructor: UserListQueryValidator
        });
    }
}