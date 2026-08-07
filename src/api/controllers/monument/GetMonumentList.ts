import { database } from "@/serviceInstances.js";
import { GetMonumentListQuery } from "@api/contracts/monument/GetMonumentListQuery.js";
import { GetMonumentListResponse } from "@api/contracts/monument/GetMonumentListResponse.js";
import { ResponseBody } from "@api/contracts/ResponseBody.js";
import { Controller } from "@api/controllers/Controller.js";
import { Database } from "@database/Database.js";
import { MonumentFilters } from "@database/MonumentFilters.js";
import { GameServerId } from "@models/GameServerId.js";
import { MonumentLeaderboardSearcher } from "@models/monumentLeaderboard/MonumentLeaderboardSearcher.js";
import { MonumentLeaderboardSortField } from "@models/monumentLeaderboard/MonumentLeaderboardSortField.js";
import { SortOrder } from "@models/SortOrder.js";
import e from "express";

export class GetMonumentList extends Controller<
    {},
    GetMonumentListResponse,
    undefined,
    GetMonumentListQuery
> {
    public readonly name = "GetMonumentList";

    private readonly _database: Database = database;

    private readonly _dungeonId: string;
    private readonly _sortField: MonumentLeaderboardSortField;
    private readonly _sortOrder: SortOrder;
    private readonly _serverId: GameServerId | "all";
    private readonly _page: number;
    private readonly _recordsOnPage: number;
    private readonly _charsFilter: string[];
    private readonly _charCountFilter: number[];

    public constructor(req: e.Request<{}, ResponseBody<GetMonumentListResponse>, undefined, GetMonumentListQuery>, res: e.Response<ResponseBody<GetMonumentListResponse>>) {
        super(req, res);

        this._dungeonId = req.query.dungeonId;
        this._sortField = req.query.sortField;
        this._sortOrder = req.query.sortOrder;
        this._serverId = req.query.serverId;
        this._page = parseInt(req.query.page, 10);
        this._recordsOnPage = parseInt(req.query.recordsOnPage, 10);
        this._charsFilter = req.query.charsFilter.split(",").filter(Boolean);
        this._charCountFilter = req.query.charCountFilter.split(",").filter(Boolean).map(Number);
    }

    protected async execute(): Promise<void> {
        const searcher = new MonumentLeaderboardSearcher(this._database);

        const serverId = this._serverId === "all" ? null : this._serverId;
        const take = this._recordsOnPage;
        const skip = this._recordsOnPage * (this._page - 1);

        const monumentFilters: MonumentFilters = {
            chars: this._charsFilter.length === 0 ? null : this._charsFilter,
            charCount: this._charCountFilter.length === 0 ? null : this._charCountFilter
        };

        const count = await searcher.countPublicRuns(this._dungeonId, serverId, monumentFilters);

        const charFilters = await this._database.monumentLeaderboard.getCharactersUsageByDungeonId(this._dungeonId);
        const charCountFilters = await this._database.monumentLeaderboard.getCharactersNumberInRecordByDungeonId(this._dungeonId);

        const filters = {
            charCount: charCountFilters,
            chars: charFilters
        };

        if (count <= skip) {
            this.data = {
                list: [],
                totalCount: count,
                filters
            };

            return;
        }

        const list = await searcher.findPublicRuns(this._dungeonId, serverId, this._sortField, this._sortOrder, monumentFilters, take, skip);

        this.data = {
            list: list.map(item => item.getEntity()),
            totalCount: count,
            filters
        };
    }
}