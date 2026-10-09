import { database } from "@/serviceInstances.js";
import { GetWarEchoesListQuery } from "@api/contracts/warEchoes/GetWarEchoesListQuery.js";
import { GetWarEchoesListResponse } from "@api/contracts/warEchoes/GetWarEchoesListResponse.js";
import { ResponseBody } from "@api/contracts/ResponseBody.js";
import { Controller } from "@api/controllers/Controller.js";
import { Database } from "@database/Database.js";
import { MonumentFilters } from "@database/MonumentFilters.js";
import { GameServerId } from "@models/GameServerId.js";
import { WarEchoesLeaderboardSearcher } from "@models/warEchoesLeaderboard/WarEchoesLeaderboardSearcher.js";
import { WarEchoesLeaderboardSortField } from "@models/warEchoesLeaderboard/WarEchoesLeaderboardSortField.js";
import { SortOrder } from "@models/SortOrder.js";
import e from "express";

export class GetWarEchoesList extends Controller<
    {},
    GetWarEchoesListResponse,
    undefined,
    GetWarEchoesListQuery
> {
    public readonly name = "GetWarEchoesList";

    private readonly _database: Database = database;

    private readonly _dungeonId: string;
    private readonly _groupId?: string;
    private readonly _sortField: WarEchoesLeaderboardSortField;
    private readonly _sortOrder: SortOrder;
    private readonly _serverId: GameServerId | "all";
    private readonly _page: number;
    private readonly _recordsOnPage: number;
    private readonly _charsFilter: string[];
    private readonly _charCountFilter: number[];

    public constructor(req: e.Request<{}, ResponseBody<GetWarEchoesListResponse>, undefined, GetWarEchoesListQuery>, res: e.Response<ResponseBody<GetWarEchoesListResponse>>) {
        super(req, res);

        this._dungeonId = req.query.dungeonId;
        this._groupId = req.query.groupId;
        this._sortField = req.query.sortField;
        this._sortOrder = req.query.sortOrder;
        this._serverId = req.query.serverId;
        this._page = parseInt(req.query.page, 10);
        this._recordsOnPage = parseInt(req.query.recordsOnPage, 10);
        this._charsFilter = req.query.charsFilter.split(",").filter(Boolean);
        this._charCountFilter = req.query.charCountFilter.split(",").filter(Boolean).map(Number);
    }

    protected async execute(): Promise<void> {
        const searcher = new WarEchoesLeaderboardSearcher(this._database);

        const serverId = this._serverId === "all" ? null : this._serverId;
        const take = this._recordsOnPage;
        const skip = this._recordsOnPage * (this._page - 1);

        const filters: MonumentFilters = {
            chars: this._charsFilter.length === 0 ? null : this._charsFilter,
            charCount: this._charCountFilter.length === 0 ? null : this._charCountFilter
        };

        const count = await searcher.countPublicRuns(this._dungeonId, serverId, filters, this._groupId);

        const charFilters = await this._database.warEchoesLeaderboard.getCharactersUsageByDungeonId(this._dungeonId, this._groupId);
        const charCountFilters = await this._database.warEchoesLeaderboard.getCharactersNumberInRecordByDungeonId(this._dungeonId, this._groupId);

        const filterData = {
            charCount: charCountFilters,
            chars: charFilters
        };

        if (count <= skip) {
            this.data = {
                list: [],
                totalCount: count,
                filters: filterData
            };

            return;
        }

        const list = await searcher.findPublicRuns(this._dungeonId, serverId, this._sortField, this._sortOrder, filters, take, skip, this._groupId);

        this.data = {
            list: list.map(item => item.getEntity()),
            totalCount: count,
            filters: filterData
        };
    }
}
