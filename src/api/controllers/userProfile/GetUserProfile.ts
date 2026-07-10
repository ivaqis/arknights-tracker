import { logger } from "@/logger";
import { database } from "@/main";
import { ResponseBody } from "@api/contracts/ResponseBody";
import { GetUserProfileQuery } from "@api/contracts/userProfile/GetUserProfileQuery";
import { GetUserProfileResponse } from "@api/contracts/userProfile/GetUserProfileResponse";
import { IGameProfile } from "@api/contracts/userProfile/IGameProfile";
import { Controller } from "@api/controllers/Controller";
import { UserRecord } from "@database/records/UserRecord";
import { ContractRecord } from "@models/contingencyContract/ContractRecord";
import { GameProfileEntity } from "@models/gameProfile/entities/GameProfileEntity";
import { crisisContractRecords } from "@staticModels/instances";
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

    private static getRespData(record: UserRecord, gameProfiles: GameProfileEntity[], contractRecords: Record<string, ContractRecord | null>): GetUserProfileResponse {
        return {
            publicUid: record.publicUid,
            isPrivate: record.isPrivate.initValue,
            avatarId: record.avatarId.initValue,
            backgroundId: record.backgroundId.initValue,
            gameProfiles: this.getGameProfiles(gameProfiles, contractRecords)
        };
    }

    private static getGameProfiles(gameProfiles: GameProfileEntity[], contractRecords: Record<string, ContractRecord | null>): IGameProfile[] {
        const result: IGameProfile[] = [];

        for (const gameProfile of gameProfiles) {
            let record = contractRecords[gameProfile.base.roleId];

            result.push({
                gameProfile: gameProfile,
                contract: record?.getEntity() ?? null
            });
        }

        return result;
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
        const gameUids = gameProfiles.map(profile => profile.base.roleId);
        const bestRecords = await this.getBestRecords(gameUids);

        this.data = GetUserProfile.getRespData(profile, gameProfiles, bestRecords);
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
        const gameUids = gameProfiles.map(profile => profile.base.roleId);
        const bestRecords = await this.getBestRecords(gameUids);

        this.data = GetUserProfile.getRespData(profile, gameProfiles, bestRecords);
    }

    private async getBestRecords(gameUids: string[]): Promise<Record<string, ContractRecord | null>> {
        const currentContractId = crisisContractRecords.current.id;
        const records: Record<string, ContractRecord | null> = {};

        for (const uid of gameUids) {
            const record = await database.gameProfiles.contractTable.findBestByGameUid(uid, currentContractId);

            records[uid] = record?.data ?? null;
        }

        return records;
    }

    private async getProfile(): Promise<UserRecord | null> {
        return database.users.findUserByPublicUid(this._publicUid);
    }

    private async getGameProfiles(uid: bigint): Promise<GameProfileEntity[]> {
        const profiles = await database.gameProfiles.gameProfilesTable.findByUid(uid);

        return profiles.map(profile => profile.data.getEntity());
    }
}