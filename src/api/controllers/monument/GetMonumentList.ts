import { database } from "@/serviceInstances";
import { GetMonumentListQuery } from "@api/contracts/monument/GetMonumentListQuery";
import { GetMonumentListResponse } from "@api/contracts/monument/GetMonumentListResponse";
import { ResponseBody } from "@api/contracts/ResponseBody";
import { Controller } from "@api/controllers/Controller";
import { Database } from "@database/Database";
import { GameServerId } from "@models/GameServerId";
import { MonumentLeaderboardSearcher } from "@models/monumentLeaderboard/MonumentLeaderboardSearcher";
import { MonumentLeaderboardSortField } from "@models/monumentLeaderboard/MonumentLeaderboardSortField";
import { SortOrder } from "@models/SortOrder";
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

    public constructor(req: e.Request<{}, ResponseBody<GetMonumentListResponse>, undefined, GetMonumentListQuery>, res: e.Response<ResponseBody<GetMonumentListResponse>>) {
        super(req, res);

        this._dungeonId = req.query.dungeonId;
        this._sortField = req.query.sortField;
        this._sortOrder = req.query.sortOrder;
        this._serverId = req.query.serverId;
        this._page = parseInt(req.query.page, 10);
        this._recordsOnPage = parseInt(req.query.recordsOnPage, 10);
    }

    protected async execute(): Promise<void> {
        const searcher = new MonumentLeaderboardSearcher(this._database);

        const serverId = this._serverId === "all" ? null : this._serverId;
        const take = this._recordsOnPage;
        const skip = this._recordsOnPage * (this._page - 1);

        const count = await searcher.countPublicRuns(this._dungeonId, serverId);

        if (count === 0) {
            this.data = {
                list: [],
                totalCount: count,
                filters: {
                    charCount: [],
                    chars: []
                }
            };
        }

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

        const list = await searcher.findPublicRuns(this._dungeonId, serverId, this._sortField, this._sortOrder, take, skip);

        this.data = {
            list: list.map(item => item.getEntity()),
            totalCount: count,
            filters
        };
    }
}