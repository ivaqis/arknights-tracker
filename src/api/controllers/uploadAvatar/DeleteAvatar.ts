import { avatarUploader, database, firebase } from "@/serviceInstances";
import { ResponseBody } from "@api/contracts/ResponseBody";
import { DeleteAvatarQuery } from "@api/contracts/uploadAvatar/DeleteAvatarQuery";
import { DeleteAvatarResponse } from "@api/contracts/uploadAvatar/DeleteAvatarResponse";
import { Controller } from "@api/controllers/Controller";
import { Database } from "@database/Database";
import { AvatarUploader } from "@services/avatarUploader/AvatarUploader";
import { FirebaseAuthenticator } from "@services/firebaseAuth/FirebaseAuthenticator";
import e from "express";

export class DeleteAvatar extends Controller<
    {},
    DeleteAvatarResponse,
    {},
    DeleteAvatarQuery
> {
    public readonly name = "DeleteAvatar";

    private readonly _database: Database = database;
    private readonly _firebase: FirebaseAuthenticator = firebase;
    private readonly _uploader: AvatarUploader = avatarUploader;

    private readonly _uid: string;
    private readonly _firebaseToken: string;

    private constructor(req: e.Request<{}, ResponseBody<DeleteAvatarResponse>, {}, DeleteAvatarQuery>, res: e.Response<ResponseBody<DeleteAvatarResponse>>) {
        super(req, res);

        this._uid = req.query.uid;
        this._firebaseToken = req.query.firebaseToken;
    }

    public static async delete(req: e.Request<{}, ResponseBody<DeleteAvatarResponse>, {}, DeleteAvatarQuery>, res: e.Response<ResponseBody<DeleteAvatarResponse>>) {
        const controller = new DeleteAvatar(req, res);

        await controller.safeExecute();
    }

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