import { DeleteGameAccountQuery } from "@api/contracts/gameAccount/DeleteGameAccountQuery.js";
import { ResponseBody } from "@api/contracts/ResponseBody.js";
import {
    DeleteGameAccountQueryValidator
} from "@api/middleware/validators/gameAccount/DeleteGameAccountQueryValidator.js";
import { RequestValidator } from "@api/middleware/validators/RequestValidator.js";
import e from "express";

export class DeleteGameAccountRequestValidator extends RequestValidator<{}, {}, DeleteGameAccountQuery> {
    public readonly name = "DeleteGameAccountRequestValidator";

    private constructor(req: e.Request<{}, ResponseBody<unknown>, {}, DeleteGameAccountQuery>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        super(req, res, next, {
            queryValidatorConstructor: DeleteGameAccountQueryValidator
        });
    }

    public static async validate(req: e.Request<{}, ResponseBody<unknown>, {}, DeleteGameAccountQuery>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        const validator = new DeleteGameAccountRequestValidator(req, res, next);

        await validator.safeExecute();
    }
}