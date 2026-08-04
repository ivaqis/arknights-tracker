import { database } from "@/serviceInstances";
import { RankingRateQuery } from "@api/contracts/rankings/RankingRateQuery";
import { RankingRateResponse } from "@api/contracts/rankings/RankingRateResponse";
import { ResponseBody } from "@api/contracts/ResponseBody";
import { Controller } from "@api/controllers/Controller";
import { Database } from "@database/Database";
import { DbBannerType } from "@models/banners/DbBannerType";
import { ExcludeRange } from "@models/ExcludeRange";
import { BannerTypeStatEntity } from "@models/pullProfile/entities/BannerTypeStatEntity";
import { EventBannerTypeStatEntity } from "@models/pullProfile/entities/EventBannerTypeStatEntity";
import { PullProfileSearcher } from "@models/pullProfile/PullProfileSearcher";
import e from "express";

export class RankingRate extends Controller<
    {},
    RankingRateResponse,
    undefined,
    RankingRateQuery
> {
    public readonly name = "RankingRate";

    private readonly _database: Database = database;

    private readonly _bannerType: DbBannerType | null;
    private readonly _totalPulls: number;
    private readonly _total5050: number | null;
    private readonly _won5050: number | null;
    private readonly _total5Pulls: number | null;
    private readonly _total6Pulls: number | null;
    private readonly _countMe: boolean;

    public constructor(req: e.Request<{}, ResponseBody<RankingRateResponse>, undefined, RankingRateQuery>, res: e.Response<ResponseBody<RankingRateResponse>>) {
        super(req, res);

        this._bannerType = req.query.bannerType === "all" ? null : req.query.bannerType;
        this._totalPulls = parseInt(req.query.totalPulls);
        this._total5050 = req.query.total5050 === "null" ? null : parseInt(req.query.total5050);
        this._won5050 = req.query.won5050 === "null" ? null : parseInt(req.query.won5050);
        this._total5Pulls = req.query.total5Pulls === "null" ? null : parseInt(req.query.total5Pulls);
        this._total6Pulls = req.query.total6Pulls === "null" ? null : parseInt(req.query.total6Pulls);
        this._countMe = req.query.countMe === "true"
    }

    protected async execute(): Promise<void> {
        if (this._totalPulls <= 0) {
            this.status = 400;
            this.message = "totalPulls must be greater than 0";

            return;
        }

        if (this._total5050 !== null && this._won5050 !== null && this._won5050 > this._total5050) {
            this.status = 400;
            this.message = "won5050 must be less or equal to total5050";

            return;
        }

        if (this._total5Pulls !== null && this._total5Pulls > this._totalPulls) {
            this.status = 400;
            this.message = "total5Pulls must be less or equal to totalPulls";

            return;
        }

        if (this._total6Pulls !== null && this._total6Pulls > this._totalPulls) {
            this.status = 400;
            this.message = "total6Pulls must be less or equal to totalPulls";
        }

        let totalPullsRate: ExcludeRange;
        let luck6Rate: ExcludeRange | null;
        let luck5Rate: ExcludeRange | null;
        let win5050Rate: ExcludeRange | null = null;


        const searcher = new PullProfileSearcher(this._database);

        if (this._bannerType === null || DbBannerType.isEvent(this._bannerType)) {
            const rating = await searcher.getEventBannerTypeStats(this._bannerType, this._totalPulls, this._total5050 ?? 0, this._won5050 ?? 0, this._total6Pulls ?? 0, this._total5Pulls ?? 0, this._countMe) as EventBannerTypeStatEntity;

            totalPullsRate = rating.totalPulls.rating;
            luck6Rate = this._total6Pulls === null ? null : rating.luck6?.rating ?? null;
            luck5Rate = this._total5Pulls === null ? null : rating.luck5?.rating ?? null;
            win5050Rate = this._total5050 === null ? null : rating.luck5050?.rating ?? null;

        } else {
            const rating = await searcher.getBannerTypeStats(this._bannerType, this._totalPulls, this._total6Pulls ?? 0, this._total5Pulls ?? 0, this._countMe) as BannerTypeStatEntity;

            totalPullsRate = rating.totalPulls.rating;
            luck6Rate = this._total6Pulls === null ? null : rating.luck6?.rating ?? null;
            luck5Rate = this._total5Pulls === null ? null : rating.luck5?.rating ?? null;
        }

        this.status = 200;
        this.data = {
            totalPullsRate,
            win5050Rate,
            luck6Rate,
            luck5Rate
        };
    }
}