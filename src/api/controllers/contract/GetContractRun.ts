import { authenticator, database } from "@/serviceInstances";
import { GetContractRunQuery } from "@api/contracts/contract/GetContractRunQuery";
import { GetContractRunResponse } from "@api/contracts/contract/GetContractRunResponse";
import { ResponseBody } from "@api/contracts/ResponseBody";
import { Controller } from "@api/controllers/Controller";
import { Database } from "@database/Database";
import { UserContractLeaderboardRecord } from "@database/records/UserContractLeaderboardRecord";
import { ContractRecordEntity } from "@models/contingencyContract/entities/ContractRecordEntity";
import { Authenticator } from "@services/auth/Authenticator";
import e from "express";

export class GetContractRun extends Controller<
    {},
    GetContractRunResponse,
    undefined,
    GetContractRunQuery
> {
    public readonly name = "GetContractRun";

    private readonly _database: Database = database;
    private readonly _auth: Authenticator = authenticator;

    private readonly _recordId: string;

    public constructor(req: e.Request<{}, ResponseBody<GetContractRunResponse>, undefined, GetContractRunQuery>, res: e.Response<ResponseBody<GetContractRunResponse>>) {
        super(req, res);

        this._recordId = req.query.recordId;
    }

    public static getRecordData(record: UserContractLeaderboardRecord): ContractRecordEntity {
        const data = record.data.getEntity();
        data.recordId = record.id;
        return data;
    }

    protected async execute(): Promise<void> {
        const record = await this._database.contractLeaderboard.find(this._recordId);

        if (!record) {
            this.status = 404;
            this.message = "Record not found";

            return;
        }

        const cred = Authenticator.getAuthCredentials(this.req);
        const authData = cred ? await this._auth.authByFirebase(cred.cred) : null;

        const firebaseUid = authData?.firebaseUid ?? null;

        const gameProfile = await this._database.gameProfiles.find(record.gameUid);

        if (!gameProfile) {
            throw new Error(`Cannot find game profile for ${JSON.stringify(record, null, 2)}`);
        }

        const profile = await this._database.users.findUser(gameProfile.uid);

        if (!profile) {
            throw new Error(`Cannot find user profile for ${JSON.stringify(gameProfile, null, 2)}`);
        }

        if (profile.isPrivate.initValue && (!firebaseUid || firebaseUid !== profile.firebaseUid.initValue)) {
            this.status = 403;
            this.message = "No access";

            return;
        }

        this.data = {
            uid: profile.publicUid.initValue,
            avatarId: profile.avatarId.initValue,
            level: gameProfile.data.base.level,
            serverId: gameProfile.serverId,
            recordData: GetContractRun.getRecordData(record)
        };
    }
}