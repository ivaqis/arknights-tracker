import { database, firebase } from "@/serviceInstances";
import { GetMonumentRunQuery } from "@api/contracts/monument/GetMonumentRunQuery";
import { GetMonumentRunResponse } from "@api/contracts/monument/GetMonumentRunResponse";
import { ResponseBody } from "@api/contracts/ResponseBody";
import { Controller } from "@api/controllers/Controller";
import { Database } from "@database/Database";
import { MonumentLeaderboardRun } from "@models/monumentLeaderboard/MonumentLeaderboardRun";
import { FirebaseAuthenticator } from "@services/firebaseAuth/FirebaseAuthenticator";
import e from "express";

export class GetMonumentRun extends Controller<
    {},
    GetMonumentRunResponse,
    undefined,
    GetMonumentRunQuery
> {
    public readonly name = "GetMonumentRun";

    private readonly _database: Database = database;
    private readonly _firebase: FirebaseAuthenticator = firebase;

    private readonly _firebaseToken: string;
    private readonly _gameUid: string; // todo переделать контракты
    private readonly _dungeonId: string;

    public constructor(req: e.Request<{}, ResponseBody<GetMonumentRunResponse>, undefined, GetMonumentRunQuery>, res: e.Response<ResponseBody<GetMonumentRunResponse>>) {
        super(req, res);

        this._firebaseToken = req.query.firebaseToken;
        this._gameUid = req.query.gameUid;
        this._dungeonId = req.query.dungeonId;
    }

    protected async execute(): Promise<void> {
        const records = await this._database.monumentLeaderboard.findByGameUidIncludeGameProfileAndUser(this._gameUid, this._dungeonId);

        if (!records) {
            this.status = 404;
            this.message = "Not Found";

            return;
        }

        const firebaseUid = await this._firebase.getFirebaseUid(this._firebaseToken);

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