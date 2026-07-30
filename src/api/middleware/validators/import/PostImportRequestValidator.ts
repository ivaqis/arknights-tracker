import { PostImportQuery } from "@api/contracts/import/PostImportQuery";
import { PostImportRequest } from "@api/contracts/import/PostImportRequest";
import { ResponseBody } from "@api/contracts/ResponseBody";
import { PostImportBodyValidator } from "@api/middleware/validators/import/PostImportBodyValidator";
import { PostImportQueryValidator } from "@api/middleware/validators/import/PostImportQueryValidator";
import { RequestValidator } from "@api/middleware/validators/RequestValidator";
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