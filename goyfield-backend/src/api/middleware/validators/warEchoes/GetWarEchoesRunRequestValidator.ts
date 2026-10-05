import { GetWarEchoesRunQuery } from "@api/contracts/warEchoes/GetWarEchoesRunQuery.js";
import { ResponseBody } from "@api/contracts/ResponseBody.js";
import { GetWarEchoesRunQueryValidator } from "@api/middleware/validators/warEchoes/GetWarEchoesRunQueryValidator.js";
import { RequestValidator } from "@api/middleware/validators/RequestValidator.js";
import e from "express";

export class GetWarEchoesRunRequestValidator extends RequestValidator<{}, undefined, GetWarEchoesRunQuery> {
    public readonly name = "GetWarEchoesRunRequestValidator";

    public constructor(req: e.Request<{}, ResponseBody<unknown>, undefined, GetWarEchoesRunQuery>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        super(req, res, next, {
            queryValidatorConstructor: GetWarEchoesRunQueryValidator
        });
    }
}
