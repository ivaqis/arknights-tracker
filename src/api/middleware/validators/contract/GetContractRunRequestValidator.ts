import { GetContractRunQuery } from "@api/contracts/contract/GetContractRunQuery";
import { ResponseBody } from "@api/contracts/ResponseBody";
import { GetContractRunQueryValidator } from "@api/middleware/validators/contract/GetContractRunQueryValidator";
import { RequestValidator } from "@api/middleware/validators/RequestValidator";
import e from "express";

export class GetContractRunRequestValidator extends RequestValidator<{}, undefined, GetContractRunQuery> {
    public readonly name = "GetContractRunRequestValidator";

    public constructor(req: e.Request<{}, ResponseBody<unknown>, undefined, GetContractRunQuery>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        super(req, res, next, {
            queryValidatorConstructor: GetContractRunQueryValidator
        });
    }
}