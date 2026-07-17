import { database, firebase } from "@/serviceInstances";
import { ResponseBody } from "@api/contracts/ResponseBody";
import { UserListQuery } from "@api/contracts/userList/UserListQuery";
import { UserListResponse } from "@api/contracts/userList/UserListResponse";
import { Controller } from "@api/controllers/Controller";
import { Database } from "@database/Database";
import { FirebaseAuthenticator } from "@services/firebaseAuth/FirebaseAuthenticator";
import e from "express";

export class UserList extends Controller<
    {},
    UserListResponse,
    undefined,
    UserListQuery
> {
    public readonly name = "UserList";

    private readonly _database: Database = database;
    private readonly _firebase: FirebaseAuthenticator = firebase;

    private readonly _firebaseToken: string;

    public constructor(req: e.Request<{}, ResponseBody<UserListResponse>, undefined, UserListQuery>, res: e.Response<ResponseBody<UserListResponse>>) {
        super(req, res);

        this._firebaseToken = req.query.firebaseToken;
    }

    protected async execute(): Promise<void> {
        return Promise.resolve(undefined);
    }
}