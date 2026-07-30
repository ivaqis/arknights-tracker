import { ImportProgressResponse } from "@api/contracts/import/ImportProgressResponse";
import { PostImportCompleteResponse } from "@api/contracts/import/PostImportCompleteResponse";
import { PostImportQuery } from "@api/contracts/import/PostImportQuery";
import { PostImportRequest } from "@api/contracts/import/PostImportRequest";
import { StreamController } from "@api/controllers/StreamController";
import e from "express";

export class PostImport extends StreamController<
    {},
    ImportProgressResponse | PostImportCompleteResponse,
    PostImportRequest,
    PostImportQuery
> {
    public readonly name: string = "PostImport";

    public constructor(req: e.Request<{}, {}, PostImportRequest, PostImportQuery>, res: e.Response<{}>) {
        super(req, res);
    }

    protected execute(): Promise<void> {
        return Promise.resolve(undefined); // todo
    }
}