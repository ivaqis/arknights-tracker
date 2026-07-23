import { database } from "@/serviceInstances";
import { GetMonumentGroupListQuery } from "@api/contracts/monument/GetMonumentGroupListQuery";
import { GetMonumentGroupListResponse } from "@api/contracts/monument/GetMonumentGroupListResponse";
import { ResponseBody } from "@api/contracts/ResponseBody";
import { Controller } from "@api/controllers/Controller";
import { Database } from "@database/Database";
import { GameServerId } from "@models/GameServerId";
import {
    MonumentLeaderboardGroupRunRecordEntity
} from "@models/monumentLeaderboard/entities/MonumentLeaderboardGroupRunRecordEntity";
import { MonumentLeaderboardSearcher } from "@models/monumentLeaderboard/MonumentLeaderboardSearcher";
import { MonumentLeaderboardSortField } from "@models/monumentLeaderboard/MonumentLeaderboardSortField";
import { SortOrder } from "@models/SortOrder";
import e from "express";

export class GetMonumentGroupList extends Controller<
    {},
    GetMonumentGroupListResponse,
    undefined,
    GetMonumentGroupListQuery
> {
    public readonly name = "GetMonumentGroupList";

    private readonly _database: Database = database;

    private readonly _groupId: string;
    private readonly _isHard: boolean;
    private readonly _sortField: MonumentLeaderboardSortField;
    private readonly _sortOrder: SortOrder;
    private readonly _serverId: GameServerId | "all";
    private readonly _page: number;
    private readonly _recordsOnPage: number;

    public constructor(req: e.Request<{}, ResponseBody<GetMonumentGroupListResponse>, undefined, GetMonumentGroupListQuery>, res: e.Response<ResponseBody<GetMonumentGroupListResponse>>) {
        super(req, res);

        this._groupId = req.query.groupId;
        this._isHard = req.query.isHard === "true";
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

        const count = await searcher.countPublicGroupRuns(this._groupId, this._isHard, serverId);

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

        const charFilters = await this._database.monumentLeaderboard.getCharactersUsageByGroupId(this._groupId, this._isHard);
        const charCountFilters = await this._database.monumentLeaderboard.getCharactersNumberInRecordByGroupId(this._groupId, this._isHard);

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

        const list = await searcher.findPublicGroups(this._groupId, this._isHard, serverId, this._sortField, this._sortOrder, take, skip);
        const entities = list.map(item => item.getEntity());
        entities.sort((a, b) => this.sort(a, b));

        for (const entity of entities) {
            entity.records.sort((a, b) => a.dungeonId.localeCompare(b.dungeonId));
        }

        this.data = {
            list: entities,
            totalCount: count,
            filters
        };
    }

    private sort(a: MonumentLeaderboardGroupRunRecordEntity, b: MonumentLeaderboardGroupRunRecordEntity): number {
        switch (this._sortField) {
            case MonumentLeaderboardSortField.TIME:
                return (b.totalPassTs - a.totalPassTs) * (this._sortOrder === SortOrder.DESC ? 1 : -1);
            case MonumentLeaderboardSortField.LEVEL:
                return (b.level - a.level) * (this._sortOrder === SortOrder.DESC ? 1 : -1);
        }
    }
}