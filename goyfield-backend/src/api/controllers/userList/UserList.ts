import { authenticator, database } from "@/serviceInstances.js";
import { ResponseBody } from "@api/contracts/ResponseBody.js";
import { UserListResponse } from "@api/contracts/userList/UserListResponse.js";
import { Controller } from "@api/controllers/Controller.js";
import { Database } from "@database/Database.js";
import { Authenticator } from "@services/auth/Authenticator.js";
import e from "express";

export class UserList extends Controller<
    {},
    UserListResponse,
    undefined,
    undefined
> {
    public readonly name = "UserList";

    private readonly _database: Database = database;
    private readonly _auth: Authenticator = authenticator;

    public constructor(req: e.Request<{}, ResponseBody<UserListResponse>, undefined, undefined>, res: e.Response<ResponseBody<UserListResponse>>) {
        super(req, res);
    }

    protected async execute(): Promise<void> {
        const cred = Authenticator.getAuthCredentials(this.req)!;
        const authData = await this._auth.authByFirebase(cred.cred);

        if (!authData) {
            this.status = 401;
            this.message = "Unauthorized";

            return;
        }

        const firebaseUid = authData.firebaseUid;

        const profiles = await this._database.users.findManyUsersByFirebaseUid(firebaseUid);

        const uids = profiles.map(profile => profile.publicUid.initValue);

        this.data = {
            list: uids,
        };
    }
}