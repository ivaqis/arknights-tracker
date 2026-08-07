import { authenticator, database } from "@/serviceInstances.js";
import { GetImportErrorsResponse } from "@api/contracts/importErrors/GetImportErrorsResponse.js";
import { ResponseBody } from "@api/contracts/ResponseBody.js";
import { Controller } from "@api/controllers/Controller.js";
import { Database } from "@database/Database.js";
import { Authenticator } from "@services/auth/Authenticator.js";
import e from "express";

export class GetImportErrors extends Controller<
    {},
    GetImportErrorsResponse,
    undefined,
    undefined
> {
    public readonly name: string = "GetImportErrors";

    private readonly _database: Database = database;
    private readonly _auth: Authenticator = authenticator;

    public constructor(req: e.Request<{}, ResponseBody<GetImportErrorsResponse>, undefined, undefined>, res: e.Response<ResponseBody<GetImportErrorsResponse>>, errorCallbackFn?: (e: Error) => Promise<void>) {
        super(req, res, errorCallbackFn);
    }

    protected async execute(): Promise<void> {
        const cred = Authenticator.getAuthCredentials(this.req)!;
        const isAdmin = this._auth.authByAdminSecretCred(cred);

        if (!isAdmin) {
            this.status = 403;

            return;
        }

        const records = await this._database.errors.findManyImportErrors(50);

        this.data = {
            list: records
        };
    }
}