import { GetImportCompleteResponse } from "@api/contracts/import/GetImportCompleteResponse";
import { GetImportQuery } from "@api/contracts/import/GetImportQuery";
import { ImportProgressResponse } from "@api/contracts/import/ImportProgressResponse";
import { StreamController } from "@api/controllers/StreamController";
import { ImportError } from "@errors/ImportError";
import { BannerType } from "@models/banners/BannerType";
import { BannersPulls } from "@models/pulls/BannersPulls";
import { BannerDataFetcher } from "@services/bannerDataFetcher/BannerDataFetcher";
import { importErrorCallback } from "@utils/errorCallbacks";
import { getUniqueElements } from "@utils/generalUtils";
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
    private readonly _lastPullTs: number;

    private _currentServerId?: string;

    public constructor(req: e.Request<{}, {}, undefined, GetImportQuery>, res: e.Response<{}>) {
        const cb = async (e: Error) => {
            const err = new ImportError(e.stack ?? e.message, this._token, this._currentServerId);
            await importErrorCallback(err);
        };

        super(req, res, cb);

        this._token = req.query.token;
        this._serverIds = getUniqueElements(req.query.serverIds, ",");
        this._lastPullTs = req.query.lastPullTs ? parseInt(req.query.lastPullTs) : 0;
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

        return await fetcher.getAllBannersData(this._lastPullTs);
    }
}