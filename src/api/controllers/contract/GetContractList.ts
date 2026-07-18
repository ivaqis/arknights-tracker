import { database } from "@/serviceInstances";
import { GetContractListQuery } from "@api/contracts/contract/GetContractListQuery";
import { GetContractListResponse } from "@api/contracts/contract/GetContractListResponse";
import { ResponseBody } from "@api/contracts/ResponseBody";
import { Controller } from "@api/controllers/Controller";
import { Database } from "@database/Database";
import { ContractLeaderboardSearcher } from "@models/contractLeaderboard/ContractLeaderboardSearcher";
import { ContractLeaderboardSortField } from "@models/contractLeaderboard/ContractLeaderboardSortField";
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

    public constructor(req: e.Request<{}, ResponseBody<GetContractListResponse>, undefined, GetContractListQuery>, res: e.Response<ResponseBody<GetContractListResponse>>) {
        super(req, res);

        this._contractId = req.query.contractId;
        this._sortField = req.query.sortField;
        this._sortOrder = req.query.sortOrder;
    }

    protected async execute(): Promise<void> {
        const searcher = new ContractLeaderboardSearcher(this._database);

        const list = await searcher.findPublic(this._contractId, this._sortField, this._sortOrder);
        const count = await searcher.countPublic(this._contractId);

        this.data = {
            list: list.map(record => record.getEntity()),
            totalCount: count
        };
    }
}