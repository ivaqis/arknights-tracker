import { logger } from "@/logger";
import { database } from "@/serviceInstances";
import { GetContractListQuery } from "@api/contracts/contract/GetContractListQuery";
import { GetContractListResponse } from "@api/contracts/contract/GetContractListResponse";
import { ResponseBody } from "@api/contracts/ResponseBody";
import { Controller } from "@api/controllers/Controller";
import { Database } from "@database/Database";
import { ContractLeaderboardSearcher } from "@models/contractLeaderboard/ContractLeaderboardSearcher";
import { ContractLeaderboardSortField } from "@models/contractLeaderboard/ContractLeaderboardSortField";
import { GameServerId } from "@models/GameServerId";
import { SortOrder } from "@models/SortOrder";
import e from "express";

export class GetContractList extends Controller<
    {},
    GetContractListResponse,
    undefined,
    GetContractListQuery
> {
    public readonly name = "GetContractList";

    private readonly _database: Database = database;

    private readonly _contractId: string;
    private readonly _sortField: ContractLeaderboardSortField;
    private readonly _sortOrder: SortOrder;
    private readonly _serverId: GameServerId | "all";
    private readonly _page: number;
    private readonly _recordsOnPage: number;

    public constructor(req: e.Request<{}, ResponseBody<GetContractListResponse>, undefined, GetContractListQuery>, res: e.Response<ResponseBody<GetContractListResponse>>) {
        super(req, res);

        this._contractId = req.query.contractId;
        this._sortField = req.query.sortField;
        this._sortOrder = req.query.sortOrder;
        this._serverId = req.query.serverId;
        this._page = parseInt(req.query.page);
        this._recordsOnPage = parseInt(req.query.recordsOnPage);
    }

    protected async execute(): Promise<void> {
        const searcher = new ContractLeaderboardSearcher(this._database);

        const serverId = this._serverId === "all" ? null : this._serverId;
        const take = this._recordsOnPage;
        const skip = this._recordsOnPage * (this._page - 1);

        const count = await searcher.countPublic(this._contractId, serverId);

        if (count < skip) {
            this.data = {
                list: [],
                totalCount: count
            };

            return;
        }

        const list = await searcher.findPublic(this._contractId, serverId, this._sortField, this._sortOrder, take, skip);

        this.data = {
            list: list.map(record => record.getEntity()),
            totalCount: count
        };
    }
}