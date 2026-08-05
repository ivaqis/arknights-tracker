import { authenticator, database } from "@/serviceInstances";
import { ResponseBody } from "@api/contracts/ResponseBody";
import { UnlinkUserPullsQuery } from "@api/contracts/userPulls/UnlinkUserPullsQuery";
import { UnlinkUserPullsResponse } from "@api/contracts/userPulls/UnlinkUserPullsResponse";
import { Controller } from "@api/controllers/Controller";
import { Database } from "@database/Database";
import { Authenticator } from "@services/auth/Authenticator";
import e from "express";

export class UnlinkUserPulls extends Controller<
    {},
    UnlinkUserPullsResponse,
    undefined,
    UnlinkUserPullsQuery
> {
    public readonly name = "UnlinkUserPulls";

    private readonly _database: Database = database;
    private readonly _auth: Authenticator = authenticator;

    private readonly _gameUid: string;

    public constructor(req: e.Request<{}, ResponseBody<UnlinkUserPullsResponse>, undefined, UnlinkUserPullsQuery>, res: e.Response<ResponseBody<UnlinkUserPullsResponse>>) {
        super(req, res);

        this._gameUid = req.query.gameUid;
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

        const gameProfile = await this._database.gameProfiles.find(this._gameUid);

        if (!gameProfile) {
            this.status = 403;
            this.message = "No access";

            return;
        }

        const profile = await this._database.users.findUser(gameProfile.uid);

        if (!profile || profile.firebaseUid.initValue === null || profile.firebaseUid.initValue !== firebaseUid) {
            this.status = 403;
            this.message = "No access";

            return;
        }

        const currentBannerProfile = gameProfile.bannerProfileId.initValue === null
            ? null
            : await this._database.userBannerProfiles.findUserBannerProfile(gameProfile.bannerProfileId.initValue);

        if (currentBannerProfile) {
            gameProfile.bannerProfileId.value = null;
            await this._database.gameProfiles.upsert(gameProfile);
        }

        this.data = {
            unlinkedProfileId: currentBannerProfile?.publicId ?? null
        };
    }
}