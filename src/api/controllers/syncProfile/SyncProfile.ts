import { authenticator, database } from "@/serviceInstances";
import { lastGameProfileSyncCache } from "@api/cache/lastGameProfileSyncCache";
import { ResponseBody } from "@api/contracts/ResponseBody";
import { SyncProfileQuery } from "@api/contracts/syncProfile/SyncProfileQuery";
import { SyncProfileRequest } from "@api/contracts/syncProfile/SyncProfileRequest";
import { SyncProfileResponse } from "@api/contracts/syncProfile/SyncProfileResponse";
import { Controller } from "@api/controllers/Controller";
import { Database } from "@database/Database";
import { UserGameProfileRecord } from "@database/records/UserGameProfileRecord";
import { ContractRecord } from "@models/contingencyContract/ContractRecord";
import { ContractStatus } from "@models/contingencyContract/ContractStatus";
import { Character } from "@models/gameProfile/Character";
import { GameProfile } from "@models/gameProfile/GameProfile";
import { MonumentGroup } from "@models/monument/MonumentGroup";
import { MonumentRecord } from "@models/monument/MonumentRecord";
import { Authenticator } from "@services/auth/Authenticator";
import { EndfieldDataFetcher } from "@services/endfieldDataFetcher/EndfieldDataFetcher";
import e from "express";
import { LRUCache } from "lru-cache";

export class SyncProfile extends Controller<
    {},
    SyncProfileResponse,
    SyncProfileRequest,
    SyncProfileQuery
> {
    public static readonly SYNC_COOLDOWN = 7 * 60 * 1000;

    public readonly name = "SyncProfile";

    private readonly _database: Database = database;
    private readonly _auth: Authenticator = authenticator;
    private readonly _cache: LRUCache<string, Date, unknown> = lastGameProfileSyncCache;

    private readonly _uid: string;
    private readonly _serverIds: string[];
    private readonly _token: string;

    private constructor(req: e.Request<{}, ResponseBody<SyncProfileResponse>, SyncProfileRequest, SyncProfileQuery>, res: e.Response<ResponseBody<SyncProfileResponse>>) {
        super(req, res);

        this._uid = req.query.uid;
        this._serverIds = req.body.serverIds;
        this._token = req.body.token;
    }

    public static async post(req: e.Request<{}, ResponseBody<SyncProfileResponse>, SyncProfileRequest, SyncProfileQuery>, res: e.Response<ResponseBody<SyncProfileResponse>>) {
        const controller = new SyncProfile(req, res);

        await controller.safeExecute();
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

        const cachedDate = this._cache.get(firebaseUid);
        if (cachedDate) {
            const now = Date.now();
            if (cachedDate.getTime() + SyncProfile.SYNC_COOLDOWN > now) {
                this.status = 429;
                this.message = "Sync on cooldown";

                return;
            }
        }

        const profile = await this._database.users.findUserByPublicUid(this._uid);

        if (!profile) {
            this.status = 404;
            this.message = "Profile not found";

            return;
        }

        if (profile.firebaseUid.initValue !== firebaseUid) {
            this.status = 403;
            this.message = "No access";

            return;
        }

        const endfieldDataFetcher = await EndfieldDataFetcher.create(this._token);

        if (!endfieldDataFetcher) {
            this.status = 400;
            this.message = "Gryphline auth failed";

            return;
        }

        const result: Record<string, boolean> = {};

        for (const serverId of this._serverIds) {
            const updated = await this.updateData(endfieldDataFetcher, serverId, profile.uid);

            result[serverId] = updated;
        }

        this.data = result;
        this._cache.set(firebaseUid, new Date());
    }

    private async updateData(fetcher: EndfieldDataFetcher, serverId: string, uid: bigint): Promise<boolean> {
        const profileData = await fetcher.getDetailData(serverId);

        if (!profileData) {
            return false;
        }

        const gameProfile = GameProfile.getFromData(profileData, serverId);

        const gameProfileRecord = UserGameProfileRecord.createFromData(gameProfile.base.roleId, serverId, uid, gameProfile);

        await this._database.gameProfiles.upsert(gameProfileRecord);

        const contractStatuses = ContractStatus.getList(profileData.crisisContract);

        await this.updateContractDataList(fetcher, serverId, gameProfile.base.roleId, contractStatuses, gameProfile.chars);
        await this.updateMonumentData(fetcher, serverId, gameProfile.base.roleId, gameProfile.chars);

        return true;
    }

    private async updateMonumentData(fetcher: EndfieldDataFetcher, serverId: string, gameUid: string, profileChars: Character[]): Promise<void> {
        const monumentData = await fetcher.getMonumentData(serverId);

        if (!monumentData || !monumentData.length) {
            return;
        }

        const monumentGroup = MonumentGroup.getFromDataList(monumentData, profileChars);
        const records = MonumentGroup.getRecordsFromList(monumentGroup);

        for (const record of records) {
            await this.updateMonumentRecord(record, gameUid);
        }
    }

    private async updateMonumentRecord(record: MonumentRecord, gameUid: string): Promise<void> {
        const existedRecord = (await this._database.monumentLeaderboard.findByGameUid(gameUid, record.dungeonId))[0] ?? null;
        const existedRecordData = existedRecord ? existedRecord.data : null;

        if (existedRecordData && existedRecordData.ts === record.ts) {
            return;
        }

        if (existedRecord) {
            await this._database.monumentLeaderboard.delete(existedRecord.id);
        }

        await this._database.monumentLeaderboard.create(gameUid, record);
    }

    private async updateContractDataList(fetcher: EndfieldDataFetcher, serverId: string, gameUid: string, contractStatuses: ContractStatus[], profileChars: Character[]): Promise<void> {
        for (const status of contractStatuses) {
            await this.updateContractData(fetcher, serverId, gameUid, status, profileChars);
        }
    }

    private async updateContractData(fetcher: EndfieldDataFetcher, serverId: string, gameUid: string, contractStatus: ContractStatus, profileChars: Character[]) {
        const contractData = await fetcher.getContractData(serverId, contractStatus.apiId);

        if (!contractData || !contractData.history.bestRecord) {
            return;
        }

        const bestRecordData = await fetcher.getContractRecordData(serverId, contractStatus.apiId, contractData.history.bestRecord.id);

        if (!bestRecordData) {
            return;
        }

        const bestRecord = ContractRecord.getFromData(bestRecordData, profileChars, contractStatus.id);

        const exists = await this._database.contractLeaderboard.findByRecordId(bestRecord.id) !== null;

        if (exists) {
            return;
        }

        const oldRecords = await this._database.contractLeaderboard.findByGameUid(gameUid, contractStatus.id);
        for (const record of oldRecords) {
            await this._database.contractLeaderboard.delete(record.recordId);
        }

        await this._database.contractLeaderboard.create(gameUid, bestRecord);
    }
}