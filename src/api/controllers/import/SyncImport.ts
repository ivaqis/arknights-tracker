import { database } from "@/serviceInstances";
import { syncPullsSigner } from "@/signers";
import { syncPullsCache, usedSyncPullsTokens } from "@api/cache/syncPullsCache";
import { SyncImportQuery } from "@api/contracts/import/SyncImportQuery";
import { SyncImportRequest } from "@api/contracts/import/SyncImportRequest";
import { SyncImportResponse } from "@api/contracts/import/SyncImportResponse";
import { ResponseBody } from "@api/contracts/ResponseBody";
import { Controller } from "@api/controllers/Controller";
import { Database } from "@database/Database";
import { UserBannerProfileRecord } from "@database/records/UserBannerProfileRecord";
import { PullsAggregator } from "@models/pullsAggregator/PullsAggregator";
import { SyncPullsSigner } from "@models/signers/syncPullsSigner/SyncPullsSigner";
import { StablePullId } from "@models/stablePullId/StablePullId";
import e from "express";

export class SyncImport extends Controller<
    {},
    SyncImportResponse,
    SyncImportRequest,
    SyncImportQuery
> {
    public readonly name: string = "SyncImport";

    private readonly _database: Database = database;
    private readonly _signer: SyncPullsSigner = syncPullsSigner;
    private readonly _signCache = syncPullsCache;
    private readonly _usedSignCache = usedSyncPullsTokens;

    private readonly _token: string;
    private readonly _confirm: boolean;

    public constructor(req: e.Request<{}, ResponseBody<SyncImportResponse>, SyncImportRequest, SyncImportQuery>, res: e.Response<ResponseBody<SyncImportResponse>>) {
        super(req, res);

        this._token = req.query.token;
        this._confirm = req.body.confirm;
    }

    protected async execute(): Promise<void> {
        const signData = this._signer.verify(this._token);

        if (!signData) {
            this.status = 400;
            this.message = "Token not verified or expired";

            return;
        }

        const usedAt = this._usedSignCache.get(this._token);

        if (usedAt) {
            this.status = 400;
            this.message = "Token already used";

            return;
        }

        const cacheRecord = this._signCache.get(this._token);

        if (!cacheRecord) {
            this.status = 500;
            this.message = "Token approved but pulls not found. Try to import again.";

            return;
        }

        if (!this._confirm) {
            this.setTokenAsUsed();

            this.status = 200;
            this.data = {
                profile: null
            };

            return;
        }

        let profile: UserBannerProfileRecord;

        if (cacheRecord.profileId) {
            const tempProfile = await this._database.userBannerProfiles.findUserBannerProfileByPublicId(cacheRecord.profileId);

            if (!tempProfile) {
                throw new Error(`Expected banner profile but not found: ${cacheRecord.profileId}`);
            }

            profile = tempProfile;
        } else {
            profile = await this._database.userBannerProfiles.createUserBannerProfile();
        }

        const pulls = cacheRecord.pulls;
        const tokenId = cacheRecord.tokenId;
        const pullIds = cacheRecord.pullIds;
        const lastId: StablePullId | null = pullIds.reduce(SyncImport.getMaxPullId, null);

        const aggregator = new PullsAggregator(this._database);

        await aggregator.update(profile.profileId, pulls);

        await this._database.userBannerProfiles.setTokenId(tokenId.id, profile.profileId);
        if (lastId) {
            await this._database.userBannerProfiles.setPullsId(lastId.id, lastId.period, profile.profileId);
        }

        this.setTokenAsUsed();

        this.status = 200;
        this.data = {
            profile: {
                publicId: profile.publicId,
                privateId: profile.privateId
            }
        };
    }

    private setTokenAsUsed(): void {
        this._usedSignCache.set(this._token, new Date());
    }

    private static getMaxPullId(prev: StablePullId | null, curr: StablePullId): StablePullId | null {
        if (!prev) {
            return curr;
        }

        return prev.period > curr.period ? prev : curr;
    }
}