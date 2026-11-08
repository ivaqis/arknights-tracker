import { authenticator, database } from "@/serviceInstances.js";
import { AttachContractVideoBody, AttachContractVideoResponse } from "@api/contracts/contract/AttachContractVideoBody.js";
import { ResponseBody } from "@api/contracts/ResponseBody.js";
import { Controller } from "@api/controllers/Controller.js";
import { Database } from "@database/Database.js";
import { Authenticator } from "@services/auth/Authenticator.js";
import { YouTubeService } from "@services/youtube/YouTubeService.js";
import crypto from "node:crypto";
import e from "express";

export class AttachContractVideo extends Controller<
    {},
    AttachContractVideoResponse,
    AttachContractVideoBody
> {
    public readonly name = "AttachContractVideo";

    private readonly _database: Database = database;
    private readonly _auth: Authenticator = authenticator;

    private readonly _recordId: string;
    private readonly _videoUrl: string;

    public constructor(req: e.Request<{}, ResponseBody<AttachContractVideoResponse>, AttachContractVideoBody>, res: e.Response<ResponseBody<AttachContractVideoResponse>>) {
        super(req, res);

        this._recordId = req.body?.recordId;
        this._videoUrl = req.body?.videoUrl;
    }

    public static async post(req: e.Request<{}, ResponseBody<AttachContractVideoResponse>, AttachContractVideoBody>, res: e.Response<ResponseBody<AttachContractVideoResponse>>) {
        const controller = new AttachContractVideo(req, res);
        await controller.safeExecute();
    }

    protected async execute(): Promise<void> {
        if (!this._recordId || typeof this._recordId !== "string" || !this._videoUrl || typeof this._videoUrl !== "string") {
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

        let videoCode = record.videoCode;
        if (!videoCode) {
            videoCode = crypto.randomBytes(4).toString("hex");
            await this._database.contractLeaderboard.updateVideoCode(record.id, videoCode);
        }

        const validation = await YouTubeService.validateVideo(this._videoUrl, videoCode, record.clearTimeSec);
        if (!validation.valid) {
            this.status = 400;
            this.message = validation.errorCode || "VALIDATION_FAILED";
            return;
        }

        await this._database.contractLeaderboard.updateVideo(record.id, validation.normalizedUrl!);

        this.data = {
            success: true,
            videoUrl: validation.normalizedUrl
        };
    }
}

