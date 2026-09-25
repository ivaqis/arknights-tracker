import { GetContractRunQuery } from "@api/contracts/contract/GetContractRunQuery.js";
import { ResponseBody } from "@api/contracts/ResponseBody.js";
import { GetContractRunQueryValidator } from "@api/middleware/validators/contract/GetContractRunQueryValidator.js";
import { RequestValidator } from "@api/middleware/validators/RequestValidator.js";
import e from "express";

export class GetContractRunRequestValidator extends RequestValidator<{}, undefined, GetContractRunQuery> {
    public readonly name = "GetContractRunRequestValidator";

    public constructor(req: e.Request<{}, ResponseBody<unknown>, undefined, GetContractRunQuery>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        super(req, res, next, {
            queryValidatorConstructor: GetContractRunQueryValidator
        });
    }
}