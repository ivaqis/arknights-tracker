import { authenticator, database } from "@/serviceInstances.js";
import { GetMonumentRunQuery } from "@api/contracts/monument/GetMonumentRunQuery.js";
import { GetMonumentRunResponse } from "@api/contracts/monument/GetMonumentRunResponse.js";
import { ResponseBody } from "@api/contracts/ResponseBody.js";
import { Controller } from "@api/controllers/Controller.js";
import { Database } from "@database/Database.js";
import { MonumentLeaderboardRun } from "@models/monumentLeaderboard/MonumentLeaderboardRun.js";
import { Authenticator } from "@services/auth/Authenticator.js";
import e from "express";

export class GetMonumentRun extends Controller<
    {},
    GetMonumentRunResponse,
    undefined,
    GetMonumentRunQuery
> {
    public readonly name = "GetMonumentRun";

    private readonly _database: Database = database;
    private readonly _auth: Authenticator = authenticator;

    private readonly _recordId: string;

    public constructor(req: e.Request<{}, ResponseBody<GetMonumentRunResponse>, undefined, GetMonumentRunQuery>, res: e.Response<ResponseBody<GetMonumentRunResponse>>) {
        super(req, res);

        this._recordId = req.query.recordId;
    }

    protected async execute(): Promise<void> {
        const records = await this._database.monumentLeaderboard.findIncludeGameProfileAndUser(this._recordId);

        if (!records) {
            this.status = 404;
            this.message = "Not Found";

            return;
        }

        const cred = Authenticator.getAuthCredentials(this.req);
        const authData = cred ? await this._auth.authByFirebase(cred.cred) : null;

        const firebaseUid = authData?.firebaseUid ?? null;

        const record = records.record;
        const gameProfile = records.gameProfile;
        const profile = records.user;

        if (profile.isPrivate.initValue && (!firebaseUid || profile.firebaseUid.initValue !== firebaseUid)) {
            this.status = 403;
            this.message = "No access";

            return;
        }

        this.data = {
            uid: profile.publicUid.initValue,
            avatarId: profile.avatarId.initValue,
            level: gameProfile.level.initValue,
            serverId: gameProfile.serverId,
            recordData: MonumentLeaderboardRun.createFromRecord(record.id, record.data).getEntity()
        };
    }
}