import { GetWarEchoesGroupRunQuery } from "@api/contracts/warEchoes/GetWarEchoesGroupRunQuery.js";
import { ResponseBody } from "@api/contracts/ResponseBody.js";
import { GetWarEchoesGroupRunQueryValidator } from "@api/middleware/validators/warEchoes/GetWarEchoesGroupRunQueryValidator.js";
import { RequestValidator } from "@api/middleware/validators/RequestValidator.js";
import e from "express";

export class GetWarEchoesGroupRunResponseValidator extends RequestValidator<{}, undefined, GetWarEchoesGroupRunQuery> {
    public readonly name = "GetWarEchoesGroupRunResponseValidator";

    public constructor(req: e.Request<{}, ResponseBody<unknown>, undefined, GetWarEchoesGroupRunQuery>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        super(req, res, next, {
            queryValidatorConstructor: GetWarEchoesGroupRunQueryValidator
        });
    }
}
