import { GetContractListQuery } from "@api/contracts/contract/GetContractListQuery.js";
import { ResponseBody } from "@api/contracts/ResponseBody.js";
import { GetContractListQueryValidator } from "@api/middleware/validators/contract/GetContractListQueryValidator.js";
import { RequestValidator } from "@api/middleware/validators/RequestValidator.js";
import e from "express";

export class GetContractListRequestValidator extends RequestValidator<{}, undefined, GetContractListQuery> {
    public readonly name = "GetContractListRequestValidator";

    public constructor(req: e.Request<{}, ResponseBody<unknown>, undefined, GetContractListQuery>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        super(req, res, next, {
            queryValidatorConstructor: GetContractListQueryValidator
        });
    }
}