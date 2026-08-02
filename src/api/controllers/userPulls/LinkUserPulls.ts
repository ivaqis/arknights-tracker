import { database, firebase } from "@/serviceInstances";
import { ResponseBody } from "@api/contracts/ResponseBody";
import { LinkUserPullsQuery } from "@api/contracts/userPulls/LinkUserPullsQuery";
import { LinkUserPullsRequest } from "@api/contracts/userPulls/LinkUserPullsRequest";
import { LinkUserPullsResponse } from "@api/contracts/userPulls/LinkUserPullsResponse";
import { Controller } from "@api/controllers/Controller";
import { Database } from "@database/Database";
import { FirebaseAuthenticator } from "@services/firebaseAuth/FirebaseAuthenticator";
import e from "express";

export class LinkUserPulls extends Controller<
    {},
    LinkUserPullsResponse,
    LinkUserPullsRequest,
    LinkUserPullsQuery
> {
    public readonly name = "LinkUserPulls";

    private readonly _database: Database = database;
    private readonly _firebase: FirebaseAuthenticator = firebase;

    private readonly _firebaseToken: string;
    private readonly _gameUid: string;
    private readonly _profileId: string;

    public constructor(req: e.Request<{}, ResponseBody<LinkUserPullsResponse>, LinkUserPullsRequest, LinkUserPullsQuery>, res: e.Response<ResponseBody<LinkUserPullsResponse>>) {
        super(req, res);

        this._firebaseToken = req.query.firebaseToken;
        this._gameUid = req.query.gameUid;
        this._profileId = req.body.profileId;
    }

    protected async execute(): Promise<void> {
        const firebaseUid = await this._firebase.getFirebaseUid(this._firebaseToken);

        if (!firebaseUid) {
            this.status = 401;
            this.message = "Unauthorized";

            return;
        }

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

        const bannerProfile = await this._database.userBannerProfiles.findUserBannerProfileByPublicId(this._profileId);

        if (!bannerProfile) {
            this.status = 404;
            this.message = "Banner profile not found";

            return;
        }

        const bannerGameProfile = await this._database.gameProfiles.findByBannerProfileId(bannerProfile.profileId);

        if (bannerGameProfile && bannerGameProfile.uid !== profile.uid) {
            this.status = 403;
            this.message = "No access";

            return;
        }

        const currentBannerProfile = gameProfile.bannerProfileId.initValue === null
            ? null
            : await this._database.userBannerProfiles.findUserBannerProfile(gameProfile.bannerProfileId.initValue);

        if (bannerGameProfile) {
            bannerGameProfile.bannerProfileId.value = null;
            await this._database.gameProfiles.upsert(bannerGameProfile);
        }

        gameProfile.bannerProfileId.value = bannerProfile.profileId;
        await this._database.gameProfiles.upsert(gameProfile);

        this.data = {
            unlinkedProfileId: currentBannerProfile?.publicId ?? null,
            unlinkedGameUid: bannerGameProfile?.gameUid ?? null
        };
    }
}