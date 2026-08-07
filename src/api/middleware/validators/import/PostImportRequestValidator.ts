import { PostImportQuery } from "@api/contracts/import/PostImportQuery.js";
import { PostImportRequest } from "@api/contracts/import/PostImportRequest.js";
import { ResponseBody } from "@api/contracts/ResponseBody.js";
import { PostImportBodyValidator } from "@api/middleware/validators/import/PostImportBodyValidator.js";
import { PostImportQueryValidator } from "@api/middleware/validators/import/PostImportQueryValidator.js";
import { RequestValidator } from "@api/middleware/validators/RequestValidator.js";
import e from "express";

export class PostImportRequestValidator extends RequestValidator<{}, PostImportRequest, PostImportQuery> {
    public readonly name = "PostImportRequestValidator";

    public constructor(req: e.Request<{}, ResponseBody<unknown>, PostImportRequest, PostImportQuery>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        super(req, res, next, {
            queryValidatorConstructor: PostImportQueryValidator,
            bodyValidatorConstructor: PostImportBodyValidator
        });
    }
}