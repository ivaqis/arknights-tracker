import { ResponseBody } from "@api/contracts/ResponseBody";
import { GetUserProfileQuery } from "@api/contracts/userProfile/GetUserProfileQuery";
import { RequestValidator } from "@api/middleware/validators/RequestValidator";
import { GetUserProfileQueryValidator } from "@api/middleware/validators/userProfile/GetUserProfileQueryValidator";
import e from "express";

export class GetUserProfileRequestValidator extends RequestValidator<
    {},
    {},
    GetUserProfileQuery
> {

    private constructor(req: e.Request<{}, ResponseBody<unknown>, {}, GetUserProfileQuery>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        super(req, res, next);
    }

    public static validate(req: e.Request<{}, ResponseBody<unknown>, {}, GetUserProfileQuery>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        const validator = new GetUserProfileRequestValidator(req, res, next);

        validator.safeExecute();
    }

    protected execute(): void {
        const query = this.req.query;

        const validator = new GetUserProfileQueryValidator(query);

        if (!validator.isValid) {
            this.status = 400;
            this.message = validator.messages.join("\n");
        }
    }
}