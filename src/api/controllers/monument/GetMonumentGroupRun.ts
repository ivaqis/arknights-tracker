import { authenticator, database } from "@/serviceInstances";
import { GetMonumentGroupRunQuery } from "@api/contracts/monument/GetMonumentGroupRunQuery";
import { GetMonumentGroupRunResponse } from "@api/contracts/monument/GetMonumentGroupRunResponse";
import { ResponseBody } from "@api/contracts/ResponseBody";
import { Controller } from "@api/controllers/Controller";
import { Database } from "@database/Database";
import { MonumentLeaderboardRun } from "@models/monumentLeaderboard/MonumentLeaderboardRun";
import { Authenticator } from "@services/auth/Authenticator";
import e from "express";

export class GetMonumentGroupRun extends Controller<
    {},
    GetMonumentGroupRunResponse,
    undefined,
    GetMonumentGroupRunQuery
> {
    public readonly name = "GetMonumentGroupRun";

    private readonly _database: Database = database;
    private readonly _auth: Authenticator = authenticator;

    private readonly _groupId: string;

    public constructor(req: e.Request<{}, ResponseBody<GetMonumentGroupRunResponse>, undefined, GetMonumentGroupRunQuery>, res: e.Response<ResponseBody<GetMonumentGroupRunResponse>>) {
        super(req, res);

        this._groupId = req.query.groupId;
    }

    protected async execute(): Promise<void> {
        const records = await this._database.monumentLeaderboard.findByUserGroupId(this._groupId);

        if (records.length === 0) {
            this.status = 404;
            this.message = "No records found";

            return;
        }

        const cred = Authenticator.getAuthCredentials(this.req);
        const authData = cred ? await this._auth.authByFirebase(cred.cred) : null;

        const firebaseUid = authData?.firebaseUid ?? null;

        const gameUid = records[0].gameUid;

        const gameProfile = await this._database.gameProfiles.find(gameUid);

        if (!gameProfile) {
            throw new Error(`Found records but not found game profile: ${gameUid}`);
        }

        const profile = await this._database.users.findUser(gameProfile.uid);

        if (!profile) {
            throw new Error(`Found game profile but not found user profile: gameUid: ${gameUid} / uid: ${gameProfile.uid}`);
        }

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
            groupId: this._groupId,
            recordsData: records.map(record => MonumentLeaderboardRun.createFromRecord(record.id, record.data).getEntity())
        };
    }
}