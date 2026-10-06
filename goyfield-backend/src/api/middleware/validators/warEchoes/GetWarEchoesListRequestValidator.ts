import { GetWarEchoesListQuery } from "@api/contracts/warEchoes/GetWarEchoesListQuery.js";
import { ResponseBody } from "@api/contracts/ResponseBody.js";
import { GetWarEchoesListQueryValidator } from "@api/middleware/validators/warEchoes/GetWarEchoesListQueryValidator.js";
import { RequestValidator } from "@api/middleware/validators/RequestValidator.js";
import e from "express";

export class GetWarEchoesListRequestValidator extends RequestValidator<{}, undefined, GetWarEchoesListQuery> {
    public readonly name = "GetWarEchoesListRequestValidator";

    public constructor(req: e.Request<{}, ResponseBody<unknown>, undefined, GetWarEchoesListQuery>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        super(req, res, next, {
            queryValidatorConstructor: GetWarEchoesListQueryValidator
        });
    }
}
