import { logger } from "@/logger.js";
import { database } from "@/serviceInstances.js";
import { syncPullsSigner } from "@/signers.js";
import { SyncPullsCacheRecord } from "@api/cache/records/SyncPullsCacheRecord.js";
import { syncPullsCache } from "@api/cache/syncPullsCache.js";
import { ImportProgressResponse } from "@api/contracts/import/ImportProgressResponse.js";
import { PostImportCompleteResponse } from "@api/contracts/import/PostImportCompleteResponse.js";
import { PostImportQuery } from "@api/contracts/import/PostImportQuery.js";
import { PostImportRequest } from "@api/contracts/import/PostImportRequest.js";
import { StreamController } from "@api/controllers/StreamController.js";
import { Database } from "@database/Database.js";
import { BannerPullsIdRecord } from "@database/records/BannerPullsIdRecord.js";
import { UserBannerProfileRecord } from "@database/records/UserBannerProfileRecord.js";
import { ImportError } from "@errors/ImportError.js";
import { BannerType } from "@models/banners/BannerType.js";
import { BannerTokenId } from "@models/bannerTokenId/BannerTokenId.js";
import { BannersPulls } from "@models/pulls/BannersPulls.js";
import { SyncPullsSigner } from "@models/signers/syncPullsSigner/SyncPullsSigner.js";
import { StablePullId } from "@models/stablePullId/StablePullId.js";
import { UserBannerProfileVersion } from "@models/UserBannerProfileVersion.js";
import { BannerDataFetcher } from "@services/bannerDataFetcher/BannerDataFetcher.js";
import { LastPullsMap } from "@services/bannerDataFetcher/LastPullsMap.js";
import { DAY_MS, getMondayTs, getWeek, WEEK_MS } from "@utils/dateUtils.js";
import { importErrorCallback } from "@utils/errorCallbacks.js";
import { getUniqueElements } from "@utils/generalUtils.js";
import e from "express";
import { StringValue } from "ms";
import { randomUUID } from "node:crypto";

export class PostImport extends StreamController<
    {},
    ImportProgressResponse | PostImportCompleteResponse,
    PostImportRequest,
    PostImportQuery
> {
    public static readonly SIGN_LIFETIME: StringValue = "15m";

    private static readonly PULL_STORAGE_LIMIT_MS = DAY_MS * 90;

    public readonly name: string = "PostImport";

    private readonly _database: Database = database;
    private readonly _signer: SyncPullsSigner = syncPullsSigner;
    private readonly _signCache = syncPullsCache;

    private readonly _token: string;
    private readonly _serverIds: string[];
    private readonly _privateId: string | null;
    private readonly _isRecovery: boolean;

    private _currentServerId?: string;

    public constructor(req: e.Request<{}, {}, PostImportRequest, PostImportQuery>, res: e.Response<{}>) {
        const cb = async (e: Error) => {
            const err = new ImportError(e.stack ?? e.message, this._token, this._currentServerId);
            await importErrorCallback(err);
        };

        super(req, res, cb);

        this._token = req.query.token;
        this._serverIds = getUniqueElements(req.query.serverIds, ",");
        this._privateId = req.body.privateId;
        this._isRecovery = req.body.recovery === true;
    }

    private static writeOnProfile(requestedProfile: string | null,
                                  tokenProfile: string | null,
                                  pullsProfile: string | null,
                                  reachedLimit: boolean,
                                  requestedProfileVersion: number | null
    ): string | null {
        if (tokenProfile && pullsProfile && tokenProfile !== pullsProfile) {
            logger.warn(`Token profile (${tokenProfile}) differs from pulls profile (${pullsProfile}), using pulls profile`);
        }

        if (requestedProfileVersion !== null && requestedProfileVersion !== UserBannerProfileVersion.V_2) {
            return requestedProfile;
        }

        if (pullsProfile) {
            return pullsProfile;
        }

        if (tokenProfile) {
            return tokenProfile;
        }

        if (!reachedLimit && requestedProfile) {
            return null;
        }

        return requestedProfile;
    }

    private static getLastPullWithOffset(lastPullTimeTs: number): number {
        return Math.max(getMondayTs(lastPullTimeTs - WEEK_MS), 0);
    }

    private static getLastPullsMapWithOffset(map: LastPullsMap): LastPullsMap {
        const result: LastPullsMap = {};
        for (const [key, val] of Object.entries(map)) {
            if (val !== undefined && val !== null) {
                result[key as BannerType] = BigInt(PostImport.getLastPullWithOffset(Number(val)));
            }
        }
        return result;
    }

    private static getMinPullOffset(map: LastPullsMap): number {
        const values = Object.values(map);
        if (values.length === 0) {
            return 0;
        }
        return values.reduce((min: number, val) => {
            const num = Number(val);
            return num < min ? num : min;
        }, Infinity);
    }

    protected async execute(): Promise<void> {
        let privateId = this._privateId;
        let requestedProfile: UserBannerProfileRecord | null = null;

        if (privateId) {
            requestedProfile = await this._database.userBannerProfiles.findUserBannerProfileByPrivateId(privateId);

            if (!requestedProfile) {
                logger.warn(`PrivateId ${privateId} not found in database, treating as new profile`);
                privateId = null;
            }
        }

        const callback = (type: BannerType, count: number) => {
            this.send({
                type: "progress",
                message: "",
                data: {
                    type,
                    count
                }
            });
        };

        let lastPullsMap: LastPullsMap = {};

        if (!this._isRecovery && requestedProfile && requestedProfile.version.initValue === UserBannerProfileVersion.V_2) {
            lastPullsMap = await this._database.userBannerStats.getLastPullsMap(requestedProfile.profileId);
        }

        const lastPullsWithOffset = this._isRecovery ? {} : PostImport.getLastPullsMapWithOffset(lastPullsMap);
        const lastPullWithOffset = PostImport.getMinPullOffset(lastPullsWithOffset);

        let pulls: BannersPulls | null = null;
        let serverId: string | null = null;
        let fetcher: BannerDataFetcher | null = null;
        for (const id of this._serverIds) {
            fetcher = new BannerDataFetcher(this._token, id, callback);

            pulls = await fetcher.getAllBannersData(lastPullsWithOffset);

            if (pulls !== null) {
                serverId = id;

                break;
            }
        }

        if (!pulls || !serverId || !fetcher) {
            this.sendError("Invalid token");

            return;
        }

        this._currentServerId = serverId;

        const tokenId = BannerTokenId.create(this._token);
        const tokenProfile = await this._database.userBannerProfiles.findTokenIdIncludeBannerProfile(tokenId.id);

        let pullIds = PostImport.getPullIds(pulls, lastPullWithOffset);

        let pullProfile = await this.getPullProfile(pullIds);

        const limit = Date.now() - PostImport.PULL_STORAGE_LIMIT_MS;
        const isLimitReached = limit > lastPullWithOffset;

        const requestedProfileVersion = requestedProfile?.version.initValue ?? null;

        logger.debug(`${limit} ${lastPullWithOffset}`);

        let writeOn: string | null = PostImport.writeOnProfile(
            requestedProfile?.publicId ?? null,
            tokenProfile?.profile.publicId ?? null,
            pullProfile?.profile.publicId ?? null,
            isLimitReached,
            requestedProfileVersion
        );

        logger.debug(`${isLimitReached} ${privateId} ${writeOn}`);

        if (!isLimitReached && privateId !== null && writeOn !== privateId) {
            logger.debug(`Wrong profileId provided: ${privateId}\nSearching for: ${writeOn}`);

            let lastPullTsWithOffset: LastPullsMap;

            if (this._isRecovery) {
                lastPullTsWithOffset = {};
            } else if (writeOn === null) {
                logger.debug("Set new lastPullTsWithOffset");

                lastPullTsWithOffset = {};

            } else if (tokenProfile && writeOn === tokenProfile.profile.publicId) {
                logger.debug(`Set lastPullTsWithOffset by tokenId`);

                const map = await this._database.userBannerStats.getLastPullsMap(tokenProfile.profile.profileId);
                lastPullTsWithOffset = PostImport.getLastPullsMapWithOffset(map);

            } else if (pullProfile && writeOn === pullProfile.profile.publicId) {
                logger.debug(`Set lastPullTsWithOffset by pullId`);

                const map = await this._database.userBannerStats.getLastPullsMap(pullProfile.profile.profileId);
                lastPullTsWithOffset = PostImport.getLastPullsMapWithOffset(map);

            } else {
                lastPullTsWithOffset = {};
            }

            const secondOffset = PostImport.getMinPullOffset(lastPullTsWithOffset);

            fetcher = new BannerDataFetcher(this._token, serverId, callback);
            pulls = await fetcher.getAllBannersData(lastPullTsWithOffset) as BannersPulls;

            pullIds = PostImport.getPullIds(pulls, secondOffset);
            pullProfile = await this.getPullProfile(pullIds);

            const limit = Date.now() - PostImport.PULL_STORAGE_LIMIT_MS;
            const isLimitReached = limit > secondOffset;

            writeOn = PostImport.writeOnProfile(
                requestedProfile?.publicId ?? null,
                tokenProfile?.profile.publicId ?? null,
                pullProfile?.profile.publicId ?? null,
                isLimitReached,
                requestedProfileVersion
            );
        }

        const sign = this._signer.sign({ id: randomUUID() }, PostImport.SIGN_LIFETIME);

        const cacheRecord: SyncPullsCacheRecord = {
            profileId: writeOn,
            pullIds,
            tokenId,
            pulls
        };

        this._signCache.set(sign, cacheRecord);

        this.send({
            type: "complete",
            message: "",
            data: {
                profileId: writeOn,
                serverId: serverId,
                token: sign,
                pulls: pulls.getEntity(),
            }
        });
    }

    private static getPullIds(pulls: BannersPulls, lastPullWithOffset: number): StablePullId[] {
        const border = getWeek(lastPullWithOffset);

        return pulls
            .getStablePullPeriods()
            .map(p => p.getId())
            .filter(i => i !== null && i.period >= border) as StablePullId[];
    }

    private async getPullProfile(pullIds: StablePullId[]): Promise<{
        pullsId: BannerPullsIdRecord;
        profile: UserBannerProfileRecord
    } | null> {
        return await this._database.userBannerProfiles.findFirstPullsIdIncludeBannerProfile(pullIds.map(i => i.id));
    }
}