import { logger } from "@/logger";
import { database } from "@/main";
import { ResponseBody } from "@api/contracts/ResponseBody";
import { GetUserProfileQuery } from "@api/contracts/userProfile/GetUserProfileQuery";
import { GetUserProfileResponse } from "@api/contracts/userProfile/GetUserProfileResponse";
import { Controller } from "@api/controllers/Controller";
import { UserRecord } from "@database/records/UserRecord";
import { GameProfileEntity } from "@models/gameProfile/entities/GameProfileEntity";
import e from "express";

export class GetUserProfile extends Controller<
    {},
    GetUserProfileResponse,
    {},
    GetUserProfileQuery
> {
    private readonly _publicUid: string;
    private readonly _firebaseUid?: string;

    private constructor(req: e.Request<{}, ResponseBody<GetUserProfileResponse>, {}, GetUserProfileQuery>, res: e.Response<ResponseBody<GetUserProfileResponse>>) {
        super(req, res);

        const { uid, firebaseUid } = req.query;

        this._publicUid = uid;
        this._firebaseUid = firebaseUid;
    }

    public static async get(req: e.Request<{}, ResponseBody<GetUserProfileResponse>, {}, GetUserProfileQuery>, res: e.Response<ResponseBody<GetUserProfileResponse>>) {
        const controller = new GetUserProfile(req, res);

        await controller.safeExecute();
    }

    private static getRespData(record: UserRecord, gameProfiles: GameProfileEntity[]): GetUserProfileResponse {
        return {
            publicUid: record.publicUid,
            isPrivate: record.isPrivate.initValue,
            avatarId: record.avatarId.initValue,
            backgroundId: record.backgroundId.initValue,
            gameProfiles: gameProfiles
        };
    }

    protected async execute() {
        if (!this._firebaseUid) {
            return this.getPublicProfile();
        }

        return this.getSelfProfile();
    }

    private async getPublicProfile() {
        const profile = await this.getProfile();

        if (!profile) {
            this.status = 404;
            this.message = "User profile not found";

            return;
        }

        if (profile.isPrivate) {
            this.status = 403;
            this.message = "User profile is private";

            return;
        }

        const gameProfiles = await this.getGameProfiles(profile.uid);

        this.data = GetUserProfile.getRespData(profile, gameProfiles);
    }

    private async getSelfProfile() {
        const profile = await this.getProfile();

        if (!profile) {
            this.status = 404;
            this.message = "User profile not found";

            return;
        }

        if (profile.firebaseUid.initValue !== this._firebaseUid) {
            logger.info(`Failed authorization attempt:\nfirebase: ${this._firebaseUid}\npublicUid: ${this._publicUid}`);

            this.status = 403;
            this.message = "Unauthorized";

            return;
        }

        const gameProfiles = await this.getGameProfiles(profile.uid);

        this.data = GetUserProfile.getRespData(profile, gameProfiles);
    }

    private async getProfile(): Promise<UserRecord | null> {
        return database.users.findUserByPublicUid(this._publicUid);
    }

    private async getGameProfiles(uid: bigint): Promise<GameProfileEntity[]> {
        const profiles = await database.gameProfiles.gameProfilesTable.findByUid(uid);

        return profiles.map(profile => profile.data.getEntity());
    }
}