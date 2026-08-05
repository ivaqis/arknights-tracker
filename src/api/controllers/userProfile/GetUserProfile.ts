import { authenticator, database } from "@/serviceInstances";
import { ResponseBody } from "@api/contracts/ResponseBody";
import { GetUserProfileQuery } from "@api/contracts/userProfile/GetUserProfileQuery";
import { GetUserProfileResponse } from "@api/contracts/userProfile/GetUserProfileResponse";
import { IGameProfile } from "@api/contracts/userProfile/IGameProfile";
import { Controller } from "@api/controllers/Controller";
import { Database } from "@database/Database";
import { UserGameProfileRecord } from "@database/records/UserGameProfileRecord";
import { UserRecord } from "@database/records/UserRecord";
import { ContractRecord } from "@models/contingencyContract/ContractRecord";
import { GameProfileEntity } from "@models/gameProfile/entities/GameProfileEntity";
import { PullProfileEntity } from "@models/pullProfile/entities/PullProfileEntity";
import { PullProfileSearcher } from "@models/pullProfile/PullProfileSearcher";
import { Authenticator } from "@services/auth/Authenticator";
import { crisisContractRecords } from "@staticModels/instances";
import e from "express";

export class GetUserProfile extends Controller<
    {},
    GetUserProfileResponse,
    {},
    GetUserProfileQuery
> {
    public readonly name = "GetUserProfile";

    private readonly _database: Database = database;
    private readonly _auth: Authenticator = authenticator;

    private readonly _publicUid: string;

    private constructor(req: e.Request<{}, ResponseBody<GetUserProfileResponse>, {}, GetUserProfileQuery>,
                        res: e.Response<ResponseBody<GetUserProfileResponse>>
    ) {
        super(req, res);

        const { uid } = req.query;

        this._publicUid = uid;
    }

    public static async get(req: e.Request<{}, ResponseBody<GetUserProfileResponse>, {}, GetUserProfileQuery>,
                            res: e.Response<ResponseBody<GetUserProfileResponse>>
    ) {
        const controller = new GetUserProfile(req, res);

        await controller.safeExecute();
    }

    public static getRespData(record: UserRecord,
                              gameProfiles: GameProfileEntity[],
                              contractRecords: Record<string, ContractRecord | null>,
                              pullsStats: Record<string, PullProfileEntity | null>
    ): GetUserProfileResponse {
        return {
            publicUid: record.publicUid.initValue,
            isPrivate: record.isPrivate.initValue,
            avatarId: record.avatarId.initValue,
            backgroundId: record.backgroundId.initValue,
            gameProfiles: this.getGameProfiles(gameProfiles, contractRecords, pullsStats)
        };
    }

    public static async getPullsStats(database: Database, gameProfiles: UserGameProfileRecord[]): Promise<Record<string, PullProfileEntity | null>> {
        const searcher = new PullProfileSearcher(database);

        const result: Record<string, PullProfileEntity | null> = {};

        for (const gameProfile of gameProfiles) {
            const gameUid = gameProfile.gameUid;
            const profileId = gameProfile.bannerProfileId.initValue;

            if (profileId === null) {
                result[gameUid] = null;
                continue;
            }

            result[gameUid] = await searcher.getPullProfile(profileId);
        }

        return result;
    }

    private static getGameProfiles(gameProfiles: GameProfileEntity[],
                                   contractRecords: Record<string, ContractRecord | null>,
                                   pullsStats: Record<string, PullProfileEntity | null>
    ): IGameProfile[] {
        const result: IGameProfile[] = [];

        for (const gameProfile of gameProfiles) {
            const record = contractRecords[gameProfile.base.roleId];
            const pulls = pullsStats[gameProfile.base.roleId];

            result.push({
                gameProfile: gameProfile,
                contract: record?.getEntity() ?? null,
                pulls: pulls
            });
        }

        return result;
    }

    protected async execute() {
        const cred = Authenticator.getAuthCredentials(this.req);
        const authData = cred ? await this._auth.authByFirebase(cred.cred) : null;

        const firebaseUid = authData?.firebaseUid ?? null;

        const profile = await this.getProfile();

        if (!profile) {
            this.status = 404;
            this.message = "User profile not found";

            return;
        }

        if (profile.isPrivate.initValue && (!firebaseUid || profile.firebaseUid.initValue !== firebaseUid)) {
            this.status = 403;
            this.message = "User profile is private";

            return;
        }

        const gameProfiles = await this._database.gameProfiles.findByUid(profile.uid);
        const gameProfilesData = gameProfiles.map(profile => profile.data.getEntity());
        const gameUids = gameProfilesData.map(profile => profile.base.roleId);
        const bestRecords = await this.getBestRecords(gameUids);
        const pullStats = await GetUserProfile.getPullsStats(this._database, gameProfiles);

        this.data = GetUserProfile.getRespData(profile, gameProfilesData, bestRecords, pullStats);
    }

    private async getBestRecords(gameUids: string[]): Promise<Record<string, ContractRecord | null>> {
        const currentContractId = crisisContractRecords.current.id;
        const records: Record<string, ContractRecord | null> = {};

        for (const uid of gameUids) {
            const record = await this._database.contractLeaderboard.findBestByGameUid(uid, currentContractId);

            records[uid] = record?.data ?? null;
        }

        return records;
    }

    private async getProfile(): Promise<UserRecord | null> {
        return this._database.users.findUserByPublicUid(this._publicUid);
    }
}