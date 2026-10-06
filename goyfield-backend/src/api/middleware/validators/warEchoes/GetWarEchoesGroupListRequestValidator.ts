import { GetWarEchoesGroupListQuery } from "@api/contracts/warEchoes/GetWarEchoesGroupListQuery.js";
import { ResponseBody } from "@api/contracts/ResponseBody.js";
import { GetWarEchoesGroupListQueryValidator } from "@api/middleware/validators/warEchoes/GetWarEchoesGroupListQueryValidator.js";
import { RequestValidator } from "@api/middleware/validators/RequestValidator.js";
import e from "express";

export class GetWarEchoesGroupListRequestValidator extends RequestValidator<{}, undefined, GetWarEchoesGroupListQuery> {
    public readonly name = "GetWarEchoesGroupListRequestValidator";

    public constructor(req: e.Request<{}, ResponseBody<unknown>, undefined, GetWarEchoesGroupListQuery>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        super(req, res, next, {
            queryValidatorConstructor: GetWarEchoesGroupListQueryValidator
        });
    }
}
