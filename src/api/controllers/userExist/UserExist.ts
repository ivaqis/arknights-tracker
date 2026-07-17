import { database } from "@/serviceInstances";
import { ResponseBody } from "@api/contracts/ResponseBody";
import { UserExistQuery } from "@api/contracts/userExist/UserExistQuery";
import { UserExistResponse } from "@api/contracts/userExist/UserExistResponse";
import { Controller } from "@api/controllers/Controller";
import { Database } from "@database/Database";
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

    public static async get(req: e.Request<{}, ResponseBody<UserExistResponse>, undefined, UserExistQuery>, res: e.Response<ResponseBody<UserExistResponse>>) {
        return await Controller.execute(UserExist, req, res);
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