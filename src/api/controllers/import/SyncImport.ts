import { database } from "@/serviceInstances";
import { syncPullsSigner } from "@/signers";
import { syncPullsCache, usedSyncPullsTokens } from "@api/cache/syncPullsCache";
import { SyncImportQuery } from "@api/contracts/import/SyncImportQuery";
import { SyncImportRequest } from "@api/contracts/import/SyncImportRequest";
import { SyncImportResponse } from "@api/contracts/import/SyncImportResponse";
import { ResponseBody } from "@api/contracts/ResponseBody";
import { Controller } from "@api/controllers/Controller";
import { Database } from "@database/Database";
import { SyncPullsSigner } from "@models/signers/syncPullsSigner/SyncPullsSigner";
import e from "express";

export class SyncImport extends Controller<
    {},
    SyncImportResponse,
    SyncImportRequest,
    SyncImportQuery
> {
    public readonly name: string = "SyncImport";

    private readonly _database: Database = database;
    private readonly _signer: SyncPullsSigner = syncPullsSigner;
    private readonly _signCache = syncPullsCache;
    private readonly _usedSignCache = usedSyncPullsTokens;

    private readonly _token: string;
    private readonly _confirm: boolean;

    public constructor(req: e.Request<{}, ResponseBody<SyncImportResponse>, SyncImportRequest, SyncImportQuery>, res: e.Response<ResponseBody<SyncImportResponse>>) {
        super(req, res);

        this._token = req.query.token;
        this._confirm = req.body.confirm;
    }

    protected async execute(): Promise<void> {
        const signData = this._signer.verify(this._token);

        if (!signData) {
            this.status = 400;
            this.message = "Token not verified or expired";

            return;
        }

        const usedAt = this._usedSignCache.get(this._token);

        if (usedAt) {
            this.status = 400;
            this.message = "Token already used";

            return;
        }

        const pulls = this._signCache.get(this._token);

        if (!pulls) {
            this.status = 500;
            this.message = "Token approved but pulls not found. Try to import again.";

            return;
        }

        if (!this._confirm) {
            this.setTokenAsUsed();

            this.status = 200;
            this.data = {
                profileId: null
            };

            return;
        }

        this.setTokenAsUsed();

        this.status = 200;
        this.data = {
            profileId: null // todo
        };
    }

    private setTokenAsUsed(): void {
        this._usedSignCache.set(this._token, new Date());
    }
}