import { authenticator, avatarUploader, database, sightengine } from "@/serviceInstances";
import { ResponseBody } from "@api/contracts/ResponseBody";
import { CreateUserProfileRequest } from "@api/contracts/userProfile/CreateUserProfileRequest";
import { CreateUserProfileResponse } from "@api/contracts/userProfile/CreateUserProfileResponse";
import { Controller } from "@api/controllers/Controller";
import { GetUserProfile } from "@api/controllers/userProfile/GetUserProfile";
import { Database } from "@database/Database";
import { Authenticator } from "@services/auth/Authenticator";
import { AvatarUploader } from "@services/avatarUploader/AvatarUploader";
import { ImageValidator } from "@services/imageValidator/ImageValidator";
import { SightengineNsfwValidator } from "@services/sightengineNsfwValidator/SightengineNsfwValidator";
import { bannedWords } from "@staticModels/instances";
import e from "express";

export class CreateUserProfile extends Controller<
    {},
    CreateUserProfileResponse,
    CreateUserProfileRequest,
    undefined
> {
    public readonly name = "CreateUserProfile";

    private readonly _database: Database = database;
    private readonly _auth: Authenticator = authenticator;
    private readonly _uploader: AvatarUploader = avatarUploader;
    private readonly _sightengine: SightengineNsfwValidator = sightengine;

    private readonly _uid: string;
    private readonly _isPrivate: boolean;
    private readonly _avatarImage: string | null;
    private readonly _filename: string | null;
    private readonly _backgroundId: string | null;

    private constructor(req: e.Request<{}, ResponseBody<CreateUserProfileResponse>, CreateUserProfileRequest, undefined>, res: e.Response<ResponseBody<CreateUserProfileResponse>>) {
        super(req, res);

        this._uid = req.body.publicUid;
        this._isPrivate = req.body.isPrivate;
        this._avatarImage = req.body.avatarImage;
        this._filename = req.body.filename;
        this._backgroundId = req.body.backgroundId;
    }

    public static async post(req: e.Request<{}, ResponseBody<CreateUserProfileResponse>, CreateUserProfileRequest, undefined>, res: e.Response<ResponseBody<CreateUserProfileResponse>>) {
        const controller = new CreateUserProfile(req, res);

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

        const profiles = await this._database.users.findManyUsersByFirebaseUid(firebaseUid);

        if (profiles.length > 0) {
            this.status = 400;
            this.message = "Profile already exists";
        }

        const exists = await this._database.users.isUserExist(this._uid);

        if (exists) {
            this.status = 400;
            this.message = "Username already exists";

            return;
        }

        const isValid = !bannedWords.containsAnyBanned(this._uid);

        if (!isValid) {
            this.status = 400;
            this.message = "Username contains banned words";

            return;
        }

        let avatarId: string | null = null;
        if (this._avatarImage) {
            const match = ImageValidator.getMatch(this._avatarImage);

            if (!match) {
                this.status = 400;
                this.message = "Invalid image format.";

                return;
            }

            const nsfwCheckResult = await this._sightengine.isNsfwImage(this._avatarImage, this._filename ?? undefined);

            if (!nsfwCheckResult.success) {
                this.status = 503;
                this.message = "NSFW service unavailable";

                return;
            }

            if (!nsfwCheckResult.isNsfw) {
                avatarId = await this._uploader.uploadAvatar(this._avatarImage);
            }
        }

        const profile = await this._database.users.createUser(this._uid, firebaseUid);

        profile.isPrivate.value = this._isPrivate;
        profile.avatarId.value = avatarId;
        profile.backgroundId.value = this._backgroundId;

        if (avatarId) {
            profile.uploadCount.value += 1;
        }

        const newProfile = await this._database.users.updateUser(profile);

        this.data = GetUserProfile.getRespData(newProfile, [], {}, {});

        return;
    }
}