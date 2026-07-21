import { logger } from "@/logger";
import { database } from "@/serviceInstances";
import { ImportCompleteResponse } from "@api/contracts/import/ImportCompleteResponse";
import { ImportProgressResponse } from "@api/contracts/import/ImportProgressResponse";
import { ImportRequest } from "@api/contracts/import/ImportRequest";
import { StreamController } from "@api/controllers/StreamController";
import { Database } from "@database/Database";
import { BannerType } from "@models/banners/BannerType";
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
    private readonly _token: string;
    private readonly _serverIds: string[];
    private readonly _lastPullTimes: LastPullsMap;

    public constructor(req: e.Request<{}, {}, ImportRequest, {}>, res: e.Response<{}>) {
        super(req, res);

        this._id = req.body.id;
        this._token = decodeURIComponent(req.body.token);
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

        const callback2 = (n: number) => {
            logger.debug(`Callback ${n}`);

            return callback;
        };

        let pulls: BannersPulls | null = null;
        let n = 0;
        for (const serverId of this._serverIds) {
            const tempPulls = await this.fetch(serverId, callback2(n));

            pulls = tempPulls; // todo

            n++;
        }

        if (!pulls) {
            this.send({
                type: "error",
                message: "Invalid token",
                data: null
            });

            return;
        }

        this.send({
            type: "complete",
            message: "",
            data: {
                pulls
            }
        })
    }

    private async fetch(serverId: string, callbackFn: (type: BannerType, count: number) => void): Promise<BannersPulls> {
        const fetcher = new BannerDataFetcher(this._token, serverId, this._lastPullTimes, callbackFn);

        return await fetcher.getAllBannersData();
    }
}