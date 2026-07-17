import { database, firebase } from "@/serviceInstances";
import { GetContractRunQuery } from "@api/contracts/contract/GetContractRunQuery";
import { GetContractRunResponse } from "@api/contracts/contract/GetContractRunResponse";
import { ResponseBody } from "@api/contracts/ResponseBody";
import { Controller } from "@api/controllers/Controller";
import { Database } from "@database/Database";
import { FirebaseAuthenticator } from "@services/firebaseAuth/FirebaseAuthenticator";
import e from "express";

export class GetContractRun extends Controller<
    {},
    GetContractRunResponse,
    undefined,
    GetContractRunQuery
> {
    public readonly name = "GetContractRun";

    private readonly _database: Database = database;
    private readonly _firebase: FirebaseAuthenticator = firebase;

    private readonly _firebaseToken: string;
    private readonly _recordId: string;

    public constructor(req: e.Request<{}, ResponseBody<GetContractRunResponse>, undefined, GetContractRunQuery>, res: e.Response<ResponseBody<GetContractRunResponse>>) {
        super(req, res);

        this._firebaseToken = req.query.firebaseToken;
        this._recordId = req.query.recordId;
    }

    protected async execute(): Promise<void> {
        const record = await this._database.gameProfiles.contractTable.find(this._recordId);

        if (!record) {
            this.status = 404;
            this.message = "Record not found";

            return;
        }

        const firebaseUid = await this._firebase.getFirebaseUid(this._firebaseToken);

        const gameProfile = await this._database.gameProfiles.gameProfilesTable.find(record.gameUid);

        if (!gameProfile) {
            throw new Error(`Cannot find game profile for ${JSON.stringify(record, null, 2)}`);
        }

        const profile = await this._database.users.findUser(gameProfile.uid);

        if (!profile) {
            throw new Error(`Cannot find user profile for ${JSON.stringify(gameProfile, null, 2)}`);
        }

        if (profile.isPrivate && (!firebaseUid || firebaseUid !== profile.firebaseUid.initValue)) {
            this.status = 403;
            this.message = "No access";

            return;
        }

        this.data = {
            uid: profile.publicUid.initValue,
            avatarId: profile.avatarId.initValue,
            level: gameProfile.data.base.level,
            serverId: gameProfile.serverId,
            recordData: record.data.getEntity()
        };
    }
}