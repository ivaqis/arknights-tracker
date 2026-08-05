import { authenticator, database } from "@/serviceInstances";
import { DeleteGameAccountQuery } from "@api/contracts/gameAccount/DeleteGameAccountQuery";
import { DeleteGameAccountResponse } from "@api/contracts/gameAccount/DeleteGameAccountResponse";
import { ResponseBody } from "@api/contracts/ResponseBody";
import { Controller } from "@api/controllers/Controller";
import { Database } from "@database/Database";
import { Authenticator } from "@services/auth/Authenticator";
import e from "express";

export class DeleteGameAccount extends Controller<
    {},
    DeleteGameAccountResponse,
    {},
    DeleteGameAccountQuery
> {
    public readonly name = "DeleteGameAccount";

    private readonly _database: Database = database;
    private readonly _auth: Authenticator = authenticator;

    private readonly _uid: string;
    private readonly _gameUid: string;

    public constructor(req: e.Request<{}, ResponseBody<DeleteGameAccountResponse>, {}, DeleteGameAccountQuery>, res: e.Response<ResponseBody<DeleteGameAccountResponse>>) {
        super(req, res);

        this._uid = req.query.uid;
        this._gameUid = req.query.gameUid;
    }

    public static async delete(req: e.Request<{}, ResponseBody<DeleteGameAccountResponse>, {}, DeleteGameAccountQuery>, res: e.Response<ResponseBody<DeleteGameAccountResponse>>) {
        await Controller.execute(DeleteGameAccount, req, res);
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

        const profile = await this._database.users.findUserByPublicUid(this._uid);

        if (!profile) {
            this.status = 404;
            this.message = "Not found";

            return;
        }

        if (profile.firebaseUid.initValue !== firebaseUid) {
            this.status = 403;
            this.message = "No access";

            return;
        }

        const gameProfile = await this._database.gameProfiles.find(this._gameUid);

        if (!gameProfile) {
            this.status = 404;
            this.message = "Not found";

            return;
        }

        if (gameProfile.uid !== profile.uid) {
            this.status = 403;
            this.message = "No access";

            return;
        }

        await this._database.gameProfiles.delete(gameProfile.gameUid);

        this.status = 200;
        this.data = { code: 0 };
    }
}