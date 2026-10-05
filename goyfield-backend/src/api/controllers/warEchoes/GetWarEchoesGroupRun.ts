import { authenticator, database } from "@/serviceInstances.js";
import { GetWarEchoesGroupRunQuery } from "@api/contracts/warEchoes/GetWarEchoesGroupRunQuery.js";
import { GetWarEchoesGroupRunResponse } from "@api/contracts/warEchoes/GetWarEchoesGroupRunResponse.js";
import { ResponseBody } from "@api/contracts/ResponseBody.js";
import { Controller } from "@api/controllers/Controller.js";
import { Database } from "@database/Database.js";
import { WarEchoesLeaderboardRun } from "@models/warEchoesLeaderboard/WarEchoesLeaderboardRun.js";
import { Authenticator } from "@services/auth/Authenticator.js";
import e from "express";

export class GetWarEchoesGroupRun extends Controller<
    {},
    GetWarEchoesGroupRunResponse,
    undefined,
    GetWarEchoesGroupRunQuery
> {
    public readonly name = "GetWarEchoesGroupRun";

    private readonly _database: Database = database;
    private readonly _auth: Authenticator = authenticator;

    private readonly _groupId: string;

    public constructor(req: e.Request<{}, ResponseBody<GetWarEchoesGroupRunResponse>, undefined, GetWarEchoesGroupRunQuery>, res: e.Response<ResponseBody<GetWarEchoesGroupRunResponse>>) {
        super(req, res);

        this._groupId = req.query.groupId;
    }

    protected async execute(): Promise<void> {
        const records = await this._database.warEchoesLeaderboard.findByUserGroupId(this._groupId);

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
            recordsData: records.map(record => WarEchoesLeaderboardRun.createFromRecord(record.id, record.data).getEntity())
        };
    }
}
