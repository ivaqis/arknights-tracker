import { database } from "@/serviceInstances";
import { ImportCompleteResponse } from "@api/contracts/import/ImportCompleteResponse";
import { ImportProgressResponse } from "@api/contracts/import/ImportProgressResponse";
import { ImportRequest } from "@api/contracts/import/ImportRequest";
import { StreamController } from "@api/controllers/StreamController";
import { Database } from "@database/Database";
import { BannerType } from "@models/banners/BannerType";
import { BannersPullsEntity } from "@models/pulls/BannersPullsEntity";
import { BannerDataFetcher } from "@services/bannerDataFetcher/BannerDataFetcher";
import { BannersPulls } from "@services/bannerDataFetcher/BannersPulls";
import { LastPullsMap } from "@services/bannerDataFetcher/LastPullsMap";
import e from "express";

export class Import extends StreamController<
    {},
    ImportProgressResponse | ImportCompleteResponse, // todo
    ImportRequest,
    {}
> {
    public readonly name = "Import";

    private readonly _database: Database = database;

    private readonly _id: string | null;
    private readonly _tokenCandidates: string[];
    private readonly _serverIds: string[];
    private readonly _lastPullTimes: LastPullsMap;

    public constructor(req: e.Request<{}, {}, ImportRequest, {}>, res: e.Response<{}>) {
        super(req, res);

        this._id = req.body.id;
        this._tokenCandidates = [req.body.token, decodeURIComponent(req.body.token)];
        this._serverIds = req.body.serverIds;
        this._lastPullTimes = Import.getLastPullsMap(req.body.lastPullTimes);
    }

    public static async post(req: e.Request<{}, {}, ImportRequest, {}>, res: e.Response<{}>): Promise<void> {
        const controller = new Import(req, res);

        await controller.safeExecute();
    }

    private static getLastPullsMap(lastPullTimes: Partial<Record<BannerType, string>>): LastPullsMap {
        const map: LastPullsMap = {};

        for (const [type, time] of Object.entries(lastPullTimes)) {
            map[type as BannerType] = BigInt(time);
        }

        return map;
    }

    protected async execute(): Promise<void> {
        const callback = (type: BannerType, count: number) => {
            this.send({
                type: "progress",
                message: "",
                data: {
                    type,
                    count
                }
            });
        };

        let pulls: BannersPulls | null = null;
        for (const serverId of this._serverIds) {
            for (const token of this._tokenCandidates) {
                const tempPulls = await this.fetch(token, serverId, callback);

                if (tempPulls === null) {
                    continue;
                }

                pulls = tempPulls; // todo

                break;
            }

            if (pulls !== null) {
                break;
            }
        }

        if (!pulls) {
            this.send({
                type: "error",
                message: "Invalid token",
                data: null
            });

            return;
        }

        const pullsEntity = BannersPullsEntity.createFromBannersPulls(pulls);

        this.send({
            type: "complete",
            message: "",
            data: {
                pulls: pullsEntity
            }
        });
    }

    private async fetch(token: string, serverId: string, callbackFn: (type: BannerType, count: number) => void): Promise<BannersPulls | null> {
        const fetcher = new BannerDataFetcher(token, serverId, this._lastPullTimes, callbackFn);

        return await fetcher.getAllBannersData();
    }
}