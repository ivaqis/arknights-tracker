import { database } from "@/serviceInstances.js";
import { ResponseBody } from "@api/contracts/ResponseBody.js";
import { UserExistQuery } from "@api/contracts/userExist/UserExistQuery.js";
import { UserExistResponse } from "@api/contracts/userExist/UserExistResponse.js";
import { Controller } from "@api/controllers/Controller.js";
import { Database } from "@database/Database.js";
import e from "express";

export class UserExist extends Controller<
    {},
    UserExistResponse,
    undefined,
    UserExistQuery
> {
    private readonly _database: Database = database;

    private readonly _uid: string;

    public constructor(req: e.Request<{}, ResponseBody<UserExistResponse>, undefined, UserExistQuery>, res: e.Response<ResponseBody<UserExistResponse>>) {
        super(req, res);

        this._uid = req.query.uid;
    }

    public get name(): string {
        return "UserExist";
    }

    protected async execute(): Promise<void> {
        const exists = await this._database.users.isUserExist(this._uid);

        this.data = {
            exists
        };
    }
}