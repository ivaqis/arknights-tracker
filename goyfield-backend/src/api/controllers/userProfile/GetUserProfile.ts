import { authenticator, database } from "@/serviceInstances.js";
import { ResponseBody } from "@api/contracts/ResponseBody.js";
import { GetUserProfileQuery } from "@api/contracts/userProfile/GetUserProfileQuery.js";
import { GetUserProfileResponse } from "@api/contracts/userProfile/GetUserProfileResponse.js";
import { IGameProfile, IMonumentProfileRun, IWarEchoesProfileRun } from "@api/contracts/userProfile/IGameProfile.js";
import { Controller } from "@api/controllers/Controller.js";
import { Database } from "@database/Database.js";
import { UserGameProfileRecord } from "@database/records/UserGameProfileRecord.js";
import { UserRecord } from "@database/records/UserRecord.js";
import { ContractRecord } from "@models/contingencyContract/ContractRecord.js";
import { GameProfileEntity } from "@models/gameProfile/entities/GameProfileEntity.js";
import { PullProfileEntity } from "@models/pullProfile/entities/PullProfileEntity.js";
import { PullProfileSearcher } from "@models/pullProfile/PullProfileSearcher.js";
import { Authenticator } from "@services/auth/Authenticator.js";
import { crisisContractRecords } from "@staticModels/instances.js";
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
                              pullsStats: Record<string, PullProfileEntity | null>,
                              monumentMap: Record<string, IMonumentProfileRun[]> = {},
                              warEchoesMap: Record<string, IWarEchoesProfileRun[]> = {}
    ): GetUserProfileResponse {
        return {
            publicUid: record.publicUid.initValue,
            isPrivate: record.isPrivate.initValue,
            hideLeaderboard: record.hideLeaderboard.initValue,
            hideUid: record.hideUid.initValue,
            avatarId: record.avatarId.initValue,
            backgroundId: record.backgroundId.initValue,
            favoriteChars: (() => {
                try {
                    return record.favoriteChars.initValue ? JSON.parse(record.favoriteChars.initValue) : [];
                } catch {
                    return [];
                }
            })(),
            gameProfiles: this.getGameProfiles(gameProfiles, contractRecords, pullsStats, monumentMap, warEchoesMap)
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

    public static async getMonumentRuns(database: Database, gameUids: string[]): Promise<Record<string, IMonumentProfileRun[]>> {
        if (gameUids.length === 0) return {};
        const runs = await database.monumentLeaderboard.findRunsWithRanksByGameUids(gameUids);
        const map: Record<string, IMonumentProfileRun[]> = {};
        for (const run of runs) {
            if (!map[run.gameUid]) map[run.gameUid] = [];
            let parsedChars: any[] = [];
            let parsedTs = "";
            try {
                const parsed = JSON.parse(run.data);
                parsedChars = parsed.chars || [];
                parsedTs = parsed.ts || "";
            } catch {}
            map[run.gameUid].push({
                id: run.id,
                dungeonId: run.dungeonId,
                groupId: run.groupId,
                isHard: run.isHard,
                clearTimeSec: run.clearTimeSec,
                rank: run.rank,
                totalCount: run.totalCount,
                ts: parsedTs,
                chars: parsedChars,
                updatedAt: run.updatedAt
            });
        }
        return map;
    }

    public static async getWarEchoesRuns(database: Database, gameUids: string[]): Promise<Record<string, IWarEchoesProfileRun[]>> {
        if (gameUids.length === 0) return {};
        const runs = await database.warEchoesLeaderboard.findRunsWithRanksByGameUids(gameUids);
        const map: Record<string, IWarEchoesProfileRun[]> = {};
        for (const run of runs) {
            if (!map[run.gameUid]) map[run.gameUid] = [];
            let parsedChars: any[] = [];
            let parsedTs = "";
            try {
                const parsed = JSON.parse(run.data);
                parsedChars = parsed.chars || [];
                parsedTs = parsed.ts || "";
            } catch {}
            map[run.gameUid].push({
                id: run.id,
                dungeonId: run.dungeonId,
                groupId: run.groupId,
                difficulty: run.difficulty,
                clearTimeSec: run.clearTimeSec,
                rank: run.rank,
                totalCount: run.totalCount,
                ts: parsedTs,
                chars: parsedChars,
                updatedAt: run.updatedAt
            });
        }
        return map;
    }

    private static getGameProfiles(gameProfiles: GameProfileEntity[],
                                   contractRecords: Record<string, ContractRecord | null>,
                                   pullsStats: Record<string, PullProfileEntity | null>,
                                   monumentMap: Record<string, IMonumentProfileRun[]> = {},
                                   warEchoesMap: Record<string, IWarEchoesProfileRun[]> = {}
    ): IGameProfile[] {
        const result: IGameProfile[] = [];

        for (const gameProfile of gameProfiles) {
            const roleId = gameProfile.base.roleId;
            const record = contractRecords[roleId];
            const pulls = pullsStats[roleId];

            result.push({
                gameProfile: gameProfile,
                contract: record?.getEntity() ?? null,
                pulls: pulls,
                monument: monumentMap[roleId] || [],
                warEchoes: warEchoesMap[roleId] || []
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

        const isOwner = !!firebaseUid && profile.firebaseUid.initValue === firebaseUid;

        if (profile.isPrivate.initValue && !isOwner) {
            this.status = 403;
            this.message = "User profile is private";

            return;
        }

        const hideLeaderboard = (profile.isPrivate.initValue || profile.hideLeaderboard.initValue) && !isOwner;

        const gameProfiles = await this._database.gameProfiles.findByUid(profile.uid);
        const gameProfilesData = gameProfiles.map(profile => profile.data.getEntity());
        const gameUids = gameProfilesData.map(profile => profile.base.roleId);
        const bestRecords = hideLeaderboard ? {} : await this.getBestRecords(gameUids);
        const pullStats = await GetUserProfile.getPullsStats(this._database, gameProfiles);
        const monumentMap = hideLeaderboard ? {} : await GetUserProfile.getMonumentRuns(this._database, gameUids);
        const warEchoesMap = hideLeaderboard ? {} : await GetUserProfile.getWarEchoesRuns(this._database, gameUids);

        this.data = GetUserProfile.getRespData(profile, gameProfilesData, bestRecords, pullStats, monumentMap, warEchoesMap);
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