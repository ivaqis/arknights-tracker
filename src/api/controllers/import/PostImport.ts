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
    }

    private static writeOnProfile(requestedProfile: string | null,
                                  tokenProfile: string | null,
                                  pullsProfile: string | null,
                                  reachedLimit: boolean,
                                  requestedProfileVersion: number | null
    ): string | null {
        if (tokenProfile && pullsProfile && tokenProfile !== pullsProfile) {
            throw new Error(`Profile by tokenId and by pullsId must be equal\nrequested profile: ${requestedProfile}\ntoken profile: ${tokenProfile}\npulls profile: ${pullsProfile}`);
        }

        if (requestedProfileVersion !== null && requestedProfileVersion !== UserBannerProfileVersion.V_2) {
            return requestedProfile;
        }

        if (tokenProfile) {
            return tokenProfile;
        }

        if (pullsProfile) {
            return pullsProfile;
        }

        if (!reachedLimit && requestedProfile) {
            return null;
        }

        return requestedProfile;
    }

    private static getLastPullWithOffset(lastPullTimeTs: number): number {
        return Math.max(getMondayTs(lastPullTimeTs - WEEK_MS), 0);
    }

    protected async execute(): Promise<void> {
        let requestedProfile: UserBannerProfileRecord | null = null;

        if (this._privateId) {
            requestedProfile = await this._database.userBannerProfiles.findUserBannerProfileByPrivateId(this._privateId);

            if (!requestedProfile) {
                this.sendError("Profile not found");

                return;
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

        let lastPullTimeTs: number = 0;

        if (requestedProfile) {
            const tempTime = await this._database.userBannerStats.getLastPullTimeTs(requestedProfile.profileId);

            if (tempTime !== null) {
                lastPullTimeTs = Number(tempTime);
            }
        }

        const lastPullWithOffset = PostImport.getLastPullWithOffset(lastPullTimeTs);

        let pulls: BannersPulls | null = null;
        let serverId: string | null = null;
        let fetcher: BannerDataFetcher | null = null;
        for (const id of this._serverIds) {
            fetcher = new BannerDataFetcher(this._token, id, callback);

            pulls = await fetcher.getAllBannersData(lastPullWithOffset);

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
            this._privateId,
            tokenProfile?.profile.publicId ?? null,
            pullProfile?.profile.publicId ?? null,
            isLimitReached,
            requestedProfileVersion
        );

        logger.debug(`${isLimitReached} ${this._privateId} ${writeOn}`);

        if (!isLimitReached && this._privateId !== null && writeOn !== this._privateId) {
            logger.debug(`Wrong profileId provided: ${this._privateId}\nSearching for: ${writeOn}`);

            let lastPullTsWithOffset;

            if (writeOn === null) {
                logger.debug("Set new lastPullTsWithOffset");

                lastPullTsWithOffset = 0;

            } else if (tokenProfile && writeOn === tokenProfile.profile.publicId) {
                logger.debug(`Set lastPullTsWithOffset by tokenId`);

                const lastPullTs = await this._database.userBannerStats.getLastPullTimeTs(tokenProfile.profile.profileId) as bigint;
                lastPullTsWithOffset = PostImport.getLastPullWithOffset(Number(lastPullTs));

            } else if (pullProfile && writeOn === pullProfile.profile.publicId) {
                logger.debug(`Set lastPullTsWithOffset by pullId`);

                const lastPullTs = await this._database.userBannerStats.getLastPullTimeTs(pullProfile.profile.profileId) as bigint;
                lastPullTsWithOffset = PostImport.getLastPullWithOffset(Number(lastPullTs));

            } else {
                lastPullTsWithOffset = 0;
            }

            pulls = await fetcher.getAllBannersData(lastPullTsWithOffset) as BannersPulls;

            pullIds = PostImport.getPullIds(pulls, lastPullTsWithOffset);
            pullProfile = await this.getPullProfile(pullIds);

            const limit = Date.now() - PostImport.PULL_STORAGE_LIMIT_MS;
            const isLimitReached = limit > lastPullWithOffset;

            writeOn = PostImport.writeOnProfile(
                this._privateId,
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