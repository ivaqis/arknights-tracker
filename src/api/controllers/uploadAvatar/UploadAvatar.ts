import { avatarUploader, database, firebase, sightengine } from "@/serviceInstances";
import { ResponseBody } from "@api/contracts/ResponseBody";
import { UploadAvatarQuery } from "@api/contracts/uploadAvatar/UploadAvatarQuery";
import { UploadAvatarRequest } from "@api/contracts/uploadAvatar/UploadAvatarRequest";
import { UploadAvatarResponse } from "@api/contracts/uploadAvatar/UploadAvatarResponse";
import { Controller } from "@api/controllers/Controller";
import { Database } from "@database/Database";
import { AvatarUploader } from "@services/avatarUploader/AvatarUploader";
import { FirebaseAuthenticator } from "@services/firebaseAuth/FirebaseAuthenticator";
import { ImageValidator } from "@services/imageValidator/ImageValidator";
import { SightengineNsfwValidator } from "@services/sightengineNsfwValidator/SightengineNsfwValidator";
import e from "express";

export class UploadAvatar extends Controller<
    {},
    UploadAvatarResponse,
    UploadAvatarRequest,
    UploadAvatarQuery
> {
    public static readonly MONTHLY_UPLOADS_LIMIT = 30;

    private readonly _database: Database = database;
    private readonly _firebase: FirebaseAuthenticator = firebase;
    private readonly _uploader: AvatarUploader = avatarUploader;
    private readonly _sightengine: SightengineNsfwValidator = sightengine;

    private readonly _uid: string;
    private readonly _firebaseToken: string;
    private readonly _image: string;
    private readonly _filename: string | null;

    private constructor(req: e.Request<{}, ResponseBody<UploadAvatarResponse>, UploadAvatarRequest, UploadAvatarQuery>, res: e.Response<ResponseBody<UploadAvatarResponse>>) {
        super(req, res);

        this._uid = req.query.uid;
        this._firebaseToken = req.query.uid;
        this._image = req.body.image;
        this._filename = req.body.filename ?? null;
    }

    public static async post(req: e.Request<{}, ResponseBody<UploadAvatarResponse>, UploadAvatarRequest, UploadAvatarQuery>, res: e.Response<ResponseBody<UploadAvatarResponse>>): Promise<void> {
        const controller = new UploadAvatar(req, res);

        await controller.safeExecute();
    }

    protected async execute(): Promise<void> {
        const match = ImageValidator.getMatch(this._image);

        if (!match) {
            this.status = 400;
            this.message = "Invalid image format.";

            return;
        }

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

        profile.resetUploadsIfMust();

        if (profile.uploadCount.value >= UploadAvatar.MONTHLY_UPLOADS_LIMIT) {
            this.status = 429;
            this.message = "Reached upload limit";

            return;
        }

        const nsfwCheckResult = await this._sightengine.isNsfwImage(this._image, this._filename ?? undefined);

        if (!nsfwCheckResult.success) {
            this.status = 503;
            this.message = "NSFW service unavailable";

            return;
        }

        if (nsfwCheckResult.isNsfw) {
            this.status = 200;
            this.message = "NSFW image";
            this.data = {
                avatarId: null,
                code: 1,
                nsfw: true
            };

            profile.displayAvatar.value = false;
            profile.uploadCount.value += 1;

            await this._database.users.updateUser(profile);

            return;
        }

        if (profile.avatarId.initValue) {
            await this._uploader.deleteAvatar(profile.avatarId.initValue);
        }

        const avatarId = await this._uploader.uploadAvatar(this._image);

        profile.avatarId.value = avatarId;
        profile.uploadCount.value += 1;

        await this._database.users.updateUser(profile);

        this.status = 200;
        this.data = {
            avatarId,
            nsfw: false,
            code: 0
        };
    }
}