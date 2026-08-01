import { database } from "@/serviceInstances";
import { RankingRateQuery } from "@api/contracts/rankings/RankingRateQuery";
import { RankingRateResponse } from "@api/contracts/rankings/RankingRateResponse";
import { ResponseBody } from "@api/contracts/ResponseBody";
import { Controller } from "@api/controllers/Controller";
import { Database } from "@database/Database";
import { DbBannerType } from "@models/banners/DbBannerType";
import { ExcludeRange } from "@models/ExcludeRange";
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

    public constructor(req: e.Request<{}, ResponseBody<RankingRateResponse>, undefined, RankingRateQuery>, res: e.Response<ResponseBody<RankingRateResponse>>) {
        super(req, res);

        this._bannerType = req.query.bannerType === "all" ? null : req.query.bannerType;
        this._totalPulls = parseInt(req.query.totalPulls);
        this._total5050 = req.query.total5050 === "null" ? null : parseInt(req.query.total5050);
        this._won5050 = req.query.won5050 === "null" ? null : parseInt(req.query.won5050);
        this._total5Pulls = req.query.total5Pulls === "null" ? null : parseInt(req.query.total5Pulls);
        this._total6Pulls = req.query.total6Pulls === "null" ? null : parseInt(req.query.total6Pulls);
    }

    private static getRate(allCount: number, gteCount: number, lteCount: number): ExcludeRange {
        const gtCount = allCount - lteCount;
        const ltCount = allCount - gteCount;

        return {
            from: ltCount / allCount,
            to: 1 - (gtCount / allCount)
        };
    }

    protected async execute(): Promise<void> {
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

        const all = await this._database.userBannerStats.countTotalPullsByBannerType(this._bannerType);

        const totalPullsRate = await this.getPullsRate(all);
        const win5050Rate = await this.getWinRate();
        const luck6Rate = await this.getLuck6Rate(all);
        const luck5Rate = await this.getLuck5Rate(all);

        this.status = 200;
        this.data = {
            totalPullsRate,
            win5050Rate,
            luck6Rate,
            luck5Rate
        };
    }

    private async getPullsRate(all: number): Promise<ExcludeRange> {
        const gte = await this._database.userBannerStats.countTotalPullsByBannerType(this._bannerType, { min: this._totalPulls });
        const lte = await this._database.userBannerStats.countTotalPullsByBannerType(this._bannerType, { max: this._totalPulls });

        return RankingRate.getRate(all, gte, lte);
    }

    private async getWinRate(): Promise<ExcludeRange | null> {
        if (this._total5050 === null || this._won5050 === null) {
            return null;
        }

        const winRate = this._won5050 / this._total5050;

        const all = await this._database.userBannerStats.countWinRateByBannerType(this._bannerType);
        const gte = await this._database.userBannerStats.countWinRateByBannerType(this._bannerType, { min: winRate });
        const lte = await this._database.userBannerStats.countWinRateByBannerType(this._bannerType, { max: winRate });

        return RankingRate.getRate(all, gte, lte);
    }

    private async getLuck5Rate(all: number): Promise<ExcludeRange | null> {
        if (this._total5Pulls === null) {
            return null;
        }

        const winRate = this._total5Pulls / this._totalPulls;

        const gte = await this._database.userBannerStats.countLuck5ByBannerType(this._bannerType, { min: winRate });
        const lte = await this._database.userBannerStats.countLuck5ByBannerType(this._bannerType, { max: winRate });

        return RankingRate.getRate(all, gte, lte);
    }

    private async getLuck6Rate(all: number): Promise<ExcludeRange | null> {
        if (this._total6Pulls === null) {
            return null;
        }

        const winRate = this._total6Pulls / this._totalPulls;

        const gte = await this._database.userBannerStats.countLuck6ByBannerType(this._bannerType, { min: winRate });
        const lte = await this._database.userBannerStats.countLuck6ByBannerType(this._bannerType, { max: winRate });

        return RankingRate.getRate(all, gte, lte);
    }
}