import { avatarUploader, database, firebase } from "@/serviceInstances";
import { ResponseBody } from "@api/contracts/ResponseBody";
import { DeleteUserProfileQuery } from "@api/contracts/userProfile/DeleteUserProfileQuery";
import { DeleteUserProfileResponse } from "@api/contracts/userProfile/DeleteUserProfileResponse";
import { Controller } from "@api/controllers/Controller";
import { Database } from "@database/Database";
import { AvatarUploader } from "@services/avatarUploader/AvatarUploader";
import { FirebaseAuthenticator } from "@services/firebaseAuth/FirebaseAuthenticator";
import e from "express";

export class DeleteUserProfile extends Controller<
    {},
    DeleteUserProfileResponse,
    {},
    DeleteUserProfileQuery
> {
    public readonly name = "DeleteUserProfile";

    private readonly _database: Database = database;
    private readonly _firebase: FirebaseAuthenticator = firebase;
    private readonly _uploader: AvatarUploader = avatarUploader;

    private readonly _firebaseToken: string;
    private readonly _publicUid: string;

    private constructor(req: e.Request<{}, ResponseBody<DeleteUserProfileResponse>, {}, DeleteUserProfileQuery>, res: e.Response<ResponseBody<DeleteUserProfileResponse>>) {
        super(req, res);

        this._firebaseToken = req.query.firebaseToken;
        this._publicUid = req.query.uid;
    }

    public static async delete(req: e.Request<{}, ResponseBody<DeleteUserProfileResponse>, {}, DeleteUserProfileQuery>, res: e.Response<ResponseBody<DeleteUserProfileResponse>>) {
        const controller = new DeleteUserProfile(req, res);

        await controller.safeExecute();
    }

    private get code(): number | undefined {
        return this.data?.code;
    }

    private set code(code: number) {
        this.data = {
            code
        }
    }

    protected async execute(): Promise<void> {
        const firebaseUid = await this._firebase.getFirebaseUid(this._firebaseToken);

        if (!firebaseUid) {
            this.status = 401;
            this.message = "Unauthorized";
            this.code = 1;

            return;
        }

        const profile = await this._database.users.findUserByPublicUid(this._publicUid);

        if (!profile) {
            this.status = 404;
            this.message = "Profile not found";
            this.code = 2;

            return;
        }

        if (profile.firebaseUid.initValue !== firebaseUid) {
            this.status = 403;
            this.message = "No access";
            this.code = 3;

            return;
        }

        if (profile.avatarId.initValue) {
            await this._uploader.deleteAvatar(profile.avatarId.initValue);
        }

        await this._database.deleteUser(profile.uid);

        this.status = 200;
        this.code = 0;
    }
}