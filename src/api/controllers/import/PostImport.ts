import { logger } from "@/logger";
import { database } from "@/serviceInstances";
import { syncPullsSigner } from "@/signers";
import { SyncPullsCacheRecord } from "@api/cache/records/SyncPullsCacheRecord";
import { syncPullsCache } from "@api/cache/syncPullsCache";
import { ImportProgressResponse } from "@api/contracts/import/ImportProgressResponse";
import { PostImportCompleteResponse } from "@api/contracts/import/PostImportCompleteResponse";
import { PostImportQuery } from "@api/contracts/import/PostImportQuery";
import { PostImportRequest } from "@api/contracts/import/PostImportRequest";
import { StreamController } from "@api/controllers/StreamController";
import { Database } from "@database/Database";
import { BannerPullsIdRecord } from "@database/records/BannerPullsIdRecord";
import { UserBannerProfileRecord } from "@database/records/UserBannerProfileRecord";
import { BannerType } from "@models/banners/BannerType";
import { BannerTokenId } from "@models/bannerTokenId/BannerTokenId";
import { BannersPulls } from "@models/pulls/BannersPulls";
import { SyncPullsSigner } from "@models/signers/syncPullsSigner/SyncPullsSigner";
import { StablePullId } from "@models/stablePullId/StablePullId";
import { BannerDataFetcher } from "@services/bannerDataFetcher/BannerDataFetcher";
import { DAY_MS, getMondayTs, getWeek, WEEK_MS } from "@utils/dateUtils";
import { getUniqueElements } from "@utils/generalUtils";
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
    private readonly _profileId: string | null;

    public constructor(req: e.Request<{}, {}, PostImportRequest, PostImportQuery>, res: e.Response<{}>) {
        super(req, res);

        this._token = req.query.token;
        this._serverIds = getUniqueElements(req.query.serverIds, ",");
        this._profileId = req.body.profileId;
    }

    private static writeOnProfile(requestedProfile: string | null, tokenProfile: string | null, pullsProfile: string | null, reachedLimit: boolean): string | null {
        if (tokenProfile && pullsProfile && tokenProfile !== pullsProfile) {
            throw new Error(`Profile by tokenId and by pullsId must be equal\nrequested profile: ${requestedProfile}\ntoken profile: ${tokenProfile}\npulls profile: ${pullsProfile}`);
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

        if (this._profileId) {
            requestedProfile = await this._database.userBannerProfiles.findUserBannerProfileByPublicId(this._profileId);

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

        const tokenId = BannerTokenId.create(this._token);
        const tokenProfile = await this._database.userBannerProfiles.findTokenIdIncludeBannerProfile(tokenId.id);

        let pullIds = PostImport.getPullIds(pulls, lastPullWithOffset);

        let pullProfile = await this.getPullProfile(pullIds);

        const limit = Date.now() - PostImport.PULL_STORAGE_LIMIT_MS;
        const isLimitReached = limit > lastPullWithOffset;

        logger.debug(`${limit} ${lastPullWithOffset}`);

        let writeOn: string | null = PostImport.writeOnProfile(
            this._profileId,
            tokenProfile?.profile.publicId ?? null,
            pullProfile?.profile.publicId ?? null,
            isLimitReached
        );

        logger.debug(`${isLimitReached} ${this._profileId} ${writeOn}`);

        if (!isLimitReached && this._profileId !== null && writeOn !== this._profileId) {
            logger.debug(`Wrong profileId provided: ${this._profileId}\nSearching for: ${writeOn}`);

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
                this._profileId,
                tokenProfile?.profile.publicId ?? null,
                pullProfile?.profile.publicId ?? null,
                isLimitReached
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

    private async fetch(serverId: string, lastPullTs: number, callbackFn: (type: BannerType, count: number) => void): Promise<BannersPulls | null> {
        const fetcher = new BannerDataFetcher(this._token, serverId, callbackFn);

        return await fetcher.getAllBannersData(lastPullTs);
    }
}