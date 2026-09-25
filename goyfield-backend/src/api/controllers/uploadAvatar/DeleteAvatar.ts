import { authenticator, avatarUploader, database } from "@/serviceInstances.js";
import { ResponseBody } from "@api/contracts/ResponseBody.js";
import { DeleteAvatarQuery } from "@api/contracts/uploadAvatar/DeleteAvatarQuery.js";
import { DeleteAvatarResponse } from "@api/contracts/uploadAvatar/DeleteAvatarResponse.js";
import { Controller } from "@api/controllers/Controller.js";
import { Database } from "@database/Database.js";
import { Authenticator } from "@services/auth/Authenticator.js";
import { AvatarUploader } from "@services/avatarUploader/AvatarUploader.js";
import e from "express";

export class DeleteAvatar extends Controller<
    {},
    DeleteAvatarResponse,
    {},
    DeleteAvatarQuery
> {
    public readonly name = "DeleteAvatar";

    private readonly _database: Database = database;
    private readonly _auth: Authenticator = authenticator;
    private readonly _uploader: AvatarUploader = avatarUploader;

    private readonly _uid: string;

    private constructor(req: e.Request<{}, ResponseBody<DeleteAvatarResponse>, {}, DeleteAvatarQuery>, res: e.Response<ResponseBody<DeleteAvatarResponse>>) {
        super(req, res);

        this._uid = req.query.uid;
    }

    public static async delete(req: e.Request<{}, ResponseBody<DeleteAvatarResponse>, {}, DeleteAvatarQuery>, res: e.Response<ResponseBody<DeleteAvatarResponse>>) {
        const controller = new DeleteAvatar(req, res);

        await controller.safeExecute();
    }

    protected async execute(): Promise<void> {
        const cred = Authenticator.getAuthCredentials(this.req)!;
        const authData = await this._auth.authByFirebase(cred.cred);

        if (!authData) {
            this.status = 401;
            this.message = "Unauthorized";

            return;
        }

        const firebaseUid = authData.firebaseUid;

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

        const avatarId = profile.avatarId.initValue;

        profile.avatarId.value = null;
        profile.displayAvatar.value = true;

        if (avatarId) {
            await this._uploader.deleteAvatar(avatarId);
        }

        await this._database.users.updateUser(profile);

        this.status = 200;
        this.data = {
            code: avatarId ? 0 : 1
        };
    }
}