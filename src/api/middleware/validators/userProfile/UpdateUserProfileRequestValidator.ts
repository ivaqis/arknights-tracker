import { ResponseBody } from "@api/contracts/ResponseBody";
import { UpdateUserProfileQuery } from "@api/contracts/userProfile/UpdateUserProfileQuery";
import { UpdateUserProfileRequest } from "@api/contracts/userProfile/UpdateUserProfileRequest";
import { RequestValidator } from "@api/middleware/validators/RequestValidator";
import { UpdateUserProfileBodyValidator } from "@api/middleware/validators/userProfile/UpdateUserProfileBodyValidator";
import {
    UpdateUserProfileQueryValidator
} from "@api/middleware/validators/userProfile/UpdateUserProfileQueryValidator";
import e from "express";

export class UpdateUserProfileRequestValidator
    extends RequestValidator<
        {},
        UpdateUserProfileRequest,
        UpdateUserProfileQuery
    > {

    private constructor(req: e.Request<{}, ResponseBody<unknown>, UpdateUserProfileRequest, UpdateUserProfileQuery>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        super(req, res, next);
    }

    public static validate(req: e.Request<{}, ResponseBody<unknown>, UpdateUserProfileRequest, UpdateUserProfileQuery>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        const validator = new UpdateUserProfileRequestValidator(req, res, next);

        validator.safeExecute();
    }

    protected execute(): void {
        const query = this.req.query;

        const queryValidator = new UpdateUserProfileQueryValidator(query);

        if (!queryValidator.isValid) {
            this.status = 400;
            this.message = queryValidator.messages.join("\n");

            return;
        }

        const body = this.req.body;

        const bodyValidator = new UpdateUserProfileBodyValidator(body);

        if (!bodyValidator.isValid) {
            this.status = 400;
            this.message = bodyValidator.messages.join("\n");

            return;
        }
    }
}