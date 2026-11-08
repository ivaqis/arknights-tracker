import { authenticator, database } from "@/serviceInstances.js";
import { DeleteContractVideoBody, DeleteContractVideoResponse } from "@api/contracts/contract/DeleteContractVideoBody.js";
import { ResponseBody } from "@api/contracts/ResponseBody.js";
import { Controller } from "@api/controllers/Controller.js";
import { Database } from "@database/Database.js";
import { Authenticator } from "@services/auth/Authenticator.js";
import e from "express";

export class DeleteContractVideo extends Controller<
    {},
    DeleteContractVideoResponse,
    DeleteContractVideoBody
> {
    public readonly name = "DeleteContractVideo";

    private readonly _database: Database = database;
    private readonly _auth: Authenticator = authenticator;

    private readonly _recordId: string;

    public constructor(req: e.Request<{}, ResponseBody<DeleteContractVideoResponse>, DeleteContractVideoBody>, res: e.Response<ResponseBody<DeleteContractVideoResponse>>) {
        super(req, res);

        this._recordId = req.body?.recordId;
    }

    public static async delete(req: e.Request<{}, ResponseBody<DeleteContractVideoResponse>, DeleteContractVideoBody>, res: e.Response<ResponseBody<DeleteContractVideoResponse>>) {
        const controller = new DeleteContractVideo(req, res);
        await controller.safeExecute();
    }

    protected async execute(): Promise<void> {
        if (!this._recordId || typeof this._recordId !== "string") {
            this.status = 400;
            this.message = "INVALID_REQUEST";
            return;
        }

        const cred = Authenticator.getAuthCredentials(this.req);
        if (!cred) {
            this.status = 401;
            this.message = "Unauthorized";
            return;
        }

        const authData = await this._auth.authByFirebase(cred.cred);
        const firebaseUid = authData?.firebaseUid;
        if (!firebaseUid) {
            this.status = 401;
            this.message = "Unauthorized";
            return;
        }

        const user = await this._database.users.findUserByFirebaseUid(firebaseUid);
        if (!user) {
            this.status = 404;
            this.message = "User not found";
            return;
        }

        let record = await this._database.contractLeaderboard.findByRecordId(this._recordId);
        if (!record) {
            record = await this._database.contractLeaderboard.find(this._recordId);
        }

        if (!record) {
            this.status = 404;
            this.message = "Record not found";
            return;
        }

        const gameProfile = await this._database.gameProfiles.find(record.gameUid);
        if (!gameProfile || gameProfile.uid !== user.uid) {
            this.status = 403;
            this.message = "Forbidden";
            return;
        }

        await this._database.contractLeaderboard.updateVideo(record.id, null);

        this.data = {
            success: true
        };
    }
}

