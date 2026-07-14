import { database, firebase } from "@/serviceInstances";
import { ResponseBody } from "@api/contracts/ResponseBody";
import { SyncProfileQuery } from "@api/contracts/syncProfile/SyncProfileQuery";
import { SyncProfileRequest } from "@api/contracts/syncProfile/SyncProfileRequest";
import { SyncProfileResponse } from "@api/contracts/syncProfile/SyncProfileResponse";
import { Controller } from "@api/controllers/Controller";
import { Database } from "@database/Database";
import { FirebaseAuthenticator } from "@services/firebaseAuth/FirebaseAuthenticator";
import e from "express";

export class SyncProfile extends Controller<
    {},
    SyncProfileResponse,
    SyncProfileRequest,
    SyncProfileQuery
> {
    private readonly _database: Database = database;
    private readonly _firebase: FirebaseAuthenticator = firebase;

    private readonly _uid: string;
    private readonly _firebaseToken: string;
    private readonly _serverIds: string[];

    private constructor(req: e.Request<{}, ResponseBody<SyncProfileResponse>, SyncProfileRequest, SyncProfileQuery>, res: e.Response<ResponseBody<SyncProfileResponse>>) {
        super(req, res);

        this._uid = req.query.uid;
        this._firebaseToken = req.query.firebaseToken;
        this._serverIds = req.body.serverIds;
    }

    public static async post(req: e.Request<{}, ResponseBody<SyncProfileResponse>, SyncProfileRequest, SyncProfileQuery>, res: e.Response<ResponseBody<SyncProfileResponse>>) {
        const controller = new SyncProfile(req, res);

        await controller.safeExecute();
    }

    // todo сделать ограничение на загрузку по времени
    protected async execute(): Promise<void> {
        const firebaseUid = await this._firebase.getFirebaseUid(this._firebaseToken);

        if (!firebaseUid) {
            this.status = 401;
            this.message = "Unauthorized";

            return;
        }

        const profile = await this._database.users.findUserByPublicUid(this._uid);

        if (!profile) {
            this.status = 404;
            this.message = "Profile not found";

            return;
        }

        if (profile.firebaseUid.initValue !== firebaseUid) {
            this.status = 403;
            this.message = "No access";

            return;
        }


    }
}