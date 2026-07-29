import { logger } from "@/logger";
import { database } from "@/serviceInstances";
import { syncPullsSigner } from "@/signers";
import { SyncPullsCacheRecord } from "@api/cache/records/SyncPullsCacheRecord";
import { syncPullsCache } from "@api/cache/syncPullsCache";
import { ImportCompleteResponse } from "@api/contracts/import/ImportCompleteResponse";
import { ImportProgressResponse } from "@api/contracts/import/ImportProgressResponse";
import { ImportRequest } from "@api/contracts/import/ImportRequest";
import { StreamController } from "@api/controllers/StreamController";
import { Database } from "@database/Database";
import { UserBannerProfileRecord } from "@database/records/UserBannerProfileRecord";
import { BannerType } from "@models/banners/BannerType";
import { BannerTokenId } from "@models/bannerTokenId/BannerTokenId";
import { BannersPulls } from "@models/pulls/BannersPulls";
import { SyncPullsSigner } from "@models/signers/syncPullsSigner/SyncPullsSigner";
import { BannerDataFetcher } from "@services/bannerDataFetcher/BannerDataFetcher";
import { BannersPullsData } from "@services/bannerDataFetcher/BannersPullsData";
import { LastPullsMap } from "@services/bannerDataFetcher/LastPullsMap";
import { getMondayTs, getWeek, WEEK_MS } from "@utils/dateUtils";
import e from "express";
import { StringValue } from "ms";
import { randomUUID } from "node:crypto";

export class Import extends StreamController<
    {},
    ImportProgressResponse | ImportCompleteResponse,
    ImportRequest,
    {}
> {
    public static readonly TOKEN_LIFETIME: StringValue = "15m";

    public readonly name = "Import";

    private readonly _database: Database = database;
    private readonly _signer: SyncPullsSigner = syncPullsSigner;

    private readonly _id: string | null;
    private readonly _tokenCandidates: string[];
    private readonly _serverIds: string[];
    private readonly _lastPullTs: number;
    private readonly _lastPullTsWithOffset: number;
    private readonly _share: boolean;

    public constructor(req: e.Request<{}, {}, ImportRequest, {}>, res: e.Response<{}>) {
        super(req, res);

        this._id = req.body.id;
        this._tokenCandidates = [decodeURIComponent(req.body.token), req.body.token];
        this._serverIds = req.body.serverIds;
        this._lastPullTs = req.body.lastPullTs;
        this._lastPullTsWithOffset = Import.getOffsetLastPullTs(this._lastPullTs);
        this._share = req.body.share;
    }

    public static async post(req: e.Request<{}, {}, ImportRequest, {}>, res: e.Response<{}>): Promise<void> {
        const controller = new Import(req, res);

        await controller.safeExecute();
    }

    private static getOffsetLastPullTs(lastPullTs: number): number {
        const offset = lastPullTs - WEEK_MS;

        return getMondayTs(offset);
    }

    private static getLastPullsMap(lastPullTimes: Partial<Record<BannerType, string>>): LastPullsMap {
        const map: LastPullsMap = {};

        for (const [type, time] of Object.entries(lastPullTimes)) {
            map[type as BannerType] = BigInt(time);
        }

        return map;
    }

    protected async execute(): Promise<void> {
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

        let profile: UserBannerProfileRecord | null = null;

        if (this._id !== null) {
            profile = await this._database.userBannerProfiles.findUserBannerProfileByPublicId(this._id);

            if (!profile) {
                this.sendError("Banner profile not found");

                return;
            }
        }

        let pullsData: BannersPullsData | null = null;
        let token: string | null = null;
        for (const tokenCandidate of this._tokenCandidates) {
            for (const serverId of this._serverIds) {
                const tempPulls = await this.fetch(tokenCandidate, serverId, callback);

                if (tempPulls === null) {
                    continue;
                }

                pullsData = tempPulls;
                token = tokenCandidate;

                break;
            }

            if (pullsData !== null) {
                break;
            }
        }

        if (!pullsData || !token) {
            this.sendError("Invalid token");

            return;
        }

        const pulls = BannersPulls.createFromData(pullsData);
        const border = getWeek(this._lastPullTsWithOffset) - 1;
        const periods = pulls.getStablePullPeriods().filter(p => p.periodNumber > border);

        const pullIds = periods
            .map(p => p.getId()?.id)
            .filter(i => i !== undefined);

        const tokenId = BannerTokenId.create(token);

        const pullProfile = await this._database.userBannerProfiles.findFirstPullsIdIncludeBannerProfile(pullIds);

        if (profile && pullProfile && pullProfile.profile.profileId !== profile.profileId) {
            this.sendError("Wrong profile provided");

            return;
        }

        const tokenProfile = await this._database.userBannerProfiles.findTokenIdIncludeBannerProfile(tokenId.id);

        if (profile && tokenProfile && tokenProfile.profile.profileId !== profile.profileId) {
            this.sendError("Wrong profile provided");

            return;
        }

        if (pullProfile && tokenProfile && pullProfile.profile.profileId !== tokenProfile.profile.profileId) {
            throw new Error(`Profile Id from pid and tid mismatch\npid: ${pullProfile.pullsId.id}\npid profile: ${pullProfile.profile.profileId}\ntid: ${tokenId}\ntid profile: ${tokenProfile.profile.profileId}`);
        }

        let acceptToken: string | null = this._share
            ? this._signer.sign({ id: randomUUID() }, Import.TOKEN_LIFETIME)
            : null;

        if (acceptToken) {
            const record: SyncPullsCacheRecord = {
                pulls: pulls,
                requestedUid: this._id,
                pid: pullProfile?.pullsId.id ?? null,
                uidByPid: pullProfile?.profile.publicId ?? null,
                tid: tokenId.id,
                uidByTid: tokenProfile?.profile.publicId ?? null,
            };

            syncPullsCache.set(acceptToken, record);

            logger.debug(`[Import] Created cache: ${acceptToken}`);
        }

        const pullsEntity = pulls.getEntity();

        this.send({
            type: "complete",
            message: "",
            data: {
                token: acceptToken,
                pulls: pullsEntity
            }
        });
    }

    private async fetch(token: string, serverId: string, callbackFn: (type: BannerType, count: number) => void): Promise<BannersPullsData | null> {
        const fetcher = new BannerDataFetcher(token, serverId, this._lastPullTsWithOffset, callbackFn);

        return await fetcher.getAllBannersData();
    }
}