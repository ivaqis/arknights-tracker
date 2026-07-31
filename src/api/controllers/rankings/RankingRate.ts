import { database } from "@/serviceInstances";
import { RankingRateQuery } from "@api/contracts/rankings/RankingRateQuery";
import { RankingRateResponse } from "@api/contracts/rankings/RankingRateResponse";
import { ResponseBody } from "@api/contracts/ResponseBody";
import { Controller } from "@api/controllers/Controller";
import { Database } from "@database/Database";
import { DbBannerType } from "@models/banners/DbBannerType";
import e from "express";

export class RankingRate extends Controller<
    {},
    RankingRateResponse,
    undefined,
    RankingRateQuery
> {
    public readonly name = "RankingRate";

    private readonly _database: Database = database;

    private readonly _bannerType: DbBannerType | "all";
    private readonly _totalPulls: number;
    private readonly _total5050: number | null;
    private readonly _won5050: number | null;
    private readonly _total5Pulls: number | null;
    private readonly _total6Pulls: number | null;

    public constructor(req: e.Request<{}, ResponseBody<RankingRateResponse>, undefined, RankingRateQuery>, res: e.Response<ResponseBody<RankingRateResponse>>) {
        super(req, res);

        this._bannerType = req.query.bannerType;
        this._totalPulls = parseInt(req.query.totalPulls);
        this._total5050 = req.query.total5050 === "null" ? null : parseInt(req.query.total5050);
        this._won5050 = req.query.won5050 === "null" ? null : parseInt(req.query.won5050);
        this._total5Pulls = req.query.total5Pulls === "null" ? null : parseInt(req.query.total5Pulls);
        this._total6Pulls = req.query.total6Pulls === "null" ? null : parseInt(req.query.total6Pulls);
    }

    protected async execute(): Promise<void> {
        // todo
    }
}