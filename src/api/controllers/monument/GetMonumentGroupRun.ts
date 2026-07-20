import { database, firebase } from "@/serviceInstances";
import { GetMonumentGroupRunQuery } from "@api/contracts/monument/GetMonumentGroupRunQuery";
import { GetMonumentGroupRunResponse } from "@api/contracts/monument/GetMonumentGroupRunResponse";
import { ResponseBody } from "@api/contracts/ResponseBody";
import { Controller } from "@api/controllers/Controller";
import { Database } from "@database/Database";
import { FirebaseAuthenticator } from "@services/firebaseAuth/FirebaseAuthenticator";
import e from "express";

export class GetMonumentGroupRun extends Controller<
    {},
    GetMonumentGroupRunResponse,
    undefined,
    GetMonumentGroupRunQuery
> {
    public readonly name = "GetMonumentGroupRun";

    private readonly _database: Database = database;
    private readonly _firebase: FirebaseAuthenticator = firebase;

    private readonly _firebaseToken: string;
    private readonly _gameUid: string;
    private readonly _groupId: string;
    private readonly _isHard: boolean;

    public constructor(req: e.Request<{}, ResponseBody<GetMonumentGroupRunResponse>, undefined, GetMonumentGroupRunQuery>, res: e.Response<ResponseBody<GetMonumentGroupRunResponse>>) {
        super(req, res);

        this._firebaseToken = req.query.firebaseToken;
        this._gameUid = req.query.gameUid;
        this._groupId = req.query.groupId;
        this._isHard = req.query.isHard === "true"
    }

    protected async execute(): Promise<void> {
        const records = await this._database.monumentLeaderboard.findByGroupId(this._groupId, this._isHard, this._gameUid);

        if (records.length === 0) {
            this.status = 404;
            this.message = "No records found";

            return;
        }

        const firebaseUid = await this._firebase.getFirebaseUid(this._firebaseToken);

        const gameProfile = await this._database.gameProfiles.find(this._gameUid);

        if (!gameProfile) {
            throw new Error(`Found records but not found game profile: ${this._gameUid}`);
        }

        const profile = await this._database.users.findUser(gameProfile.uid);

        if (!profile) {
            throw new Error(`Found game profile but not found user profile: gameUid: ${this._gameUid} / uid: ${gameProfile.uid}`);
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
            recordsData: records.map(record => record.data.getEntity()) // todo publicId
        };
    }
}