import { database } from "@/serviceInstances.js";
import { GlobalStatsQuery } from "@api/contracts/globalStats/GlobalStatsQuery.js";
import { GlobalStatsResponse } from "@api/contracts/globalStats/GlobalStatsResponse.js";
import { ResponseBody } from "@api/contracts/ResponseBody.js";
import { Controller } from "@api/controllers/Controller.js";
import { Database } from "@database/Database.js";
import GlobalBannerStatsAggregator from "@models/globalBannerStats/GlobalBannerStatsAggregator.js";
import e from "express";

export class GlobalStats extends Controller<
    {},
    GlobalStatsResponse,
    undefined,
    GlobalStatsQuery
> {
    public readonly name = "GlobalStats";

    private readonly _database: Database = database;

    private readonly _bannerId: string;

    public constructor(req: e.Request<{}, ResponseBody<GlobalStatsResponse>, undefined, GlobalStatsQuery>, res: e.Response<ResponseBody<GlobalStatsResponse>>) {
        super(req, res);

        this._bannerId = req.query.bannerId;
    }

    protected async execute(): Promise<void> {
        const aggregator = new GlobalBannerStatsAggregator(this._database);

        const result = await aggregator.getGlobalBannerData(this._bannerId);

        if (result === null) {
            this.status = 400;
            this.message = "Invalid banner id";

            return;
        }

        this.data = {
            bannerId: this._bannerId,
            stats: result
        };
    }
}