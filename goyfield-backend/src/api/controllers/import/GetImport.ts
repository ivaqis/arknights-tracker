import { GetImportCompleteResponse } from "@api/contracts/import/GetImportCompleteResponse.js";
import { GetImportQuery } from "@api/contracts/import/GetImportQuery.js";
import { ImportProgressResponse } from "@api/contracts/import/ImportProgressResponse.js";
import { StreamController } from "@api/controllers/StreamController.js";
import { ImportError } from "@errors/ImportError.js";
import { BannerType } from "@models/banners/BannerType.js";
import { BannersPulls } from "@models/pulls/BannersPulls.js";
import { BannerDataFetcher } from "@services/bannerDataFetcher/BannerDataFetcher.js";
import { LastPullsMap } from "@services/bannerDataFetcher/LastPullsMap.js";
import { importErrorCallback } from "@utils/errorCallbacks.js";
import { getUniqueElements } from "@utils/generalUtils.js";
import e from "express";

export class GetImport extends StreamController<
    {},
    ImportProgressResponse | GetImportCompleteResponse,
    undefined,
    GetImportQuery
> {
    public readonly name = "Import";

    private readonly _token: string;
    private readonly _serverIds: string[];
    private readonly _lastPulls: number | LastPullsMap;

    private _currentServerId?: string;

    public constructor(req: e.Request<{}, {}, undefined, GetImportQuery>, res: e.Response<{}>) {
        const cb = async (e: Error) => {
            const err = new ImportError(e.stack ?? e.message, this._token, this._currentServerId);
            await importErrorCallback(err);
        };

        super(req, res, cb);

        this._token = req.query.token;
        this._serverIds = getUniqueElements(req.query.serverIds, ",");
        this._lastPulls = GetImport.parseLastPulls(req.query);
    }

    private static parseLastPulls(query: GetImportQuery): number | LastPullsMap {
        if (query.lastPulls) {
            try {
                const parsed = JSON.parse(query.lastPulls);
                if (parsed && typeof parsed === "object") {
                    const map: LastPullsMap = {};
                    for (const [key, val] of Object.entries(parsed)) {
                        const bt = BannerType.getBannerTypeByShortName(key) || (Object.values(BannerType).includes(key as BannerType) ? key as BannerType : null);
                        const num = Number(val);
                        if (bt && !Number.isNaN(num) && num > 0) {
                            map[bt] = num;
                        }
                    }
                    if (Object.keys(map).length > 0) {
                        return map;
                    }
                }
            } catch {}
        }

        if (query.lastPullTs) {
            const parsedTs = parseInt(query.lastPullTs);
            if (!Number.isNaN(parsedTs) && parsedTs > 0) {
                return parsedTs;
            }
        }

        return 0;
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
        let serverId: string | null = null;
        for (const id of this._serverIds) {
            pulls = await this.fetch(this._token, id, callback);

            if (pulls !== null) {
                serverId = id;

                break;
            }
        }

        if (!pulls || !serverId) {
            this.sendError("Invalid token");

            return;
        }

        this._currentServerId = serverId;

        const pullsEntity = pulls.getEntity();

        this.send({
            type: "complete",
            message: "",
            data: {
                serverId,
                pulls: pullsEntity
            }
        });
    }

    private async fetch(token: string, serverId: string, callbackFn: (type: BannerType, count: number) => void): Promise<BannersPulls | null> {
        const fetcher = new BannerDataFetcher(token, serverId, callbackFn);

        return await fetcher.getAllBannersData(this._lastPulls);
    }
}