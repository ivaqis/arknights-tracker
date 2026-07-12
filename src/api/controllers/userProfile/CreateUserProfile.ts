import { database, firebase } from "@/serviceInstances";
import { ResponseBody } from "@api/contracts/ResponseBody";
import { CreateUserProfileQuery } from "@api/contracts/userProfile/CreateUserProfileQuery";
import { CreateUserProfileRequest } from "@api/contracts/userProfile/CreateUserProfileRequest";
import { CreateUserProfileResponse } from "@api/contracts/userProfile/CreateUserProfileResponse";
import { Controller } from "@api/controllers/Controller";
import { GetUserProfile } from "@api/controllers/userProfile/GetUserProfile";
import { Database } from "@database/Database";
import { FirebaseAuthenticator } from "@services/firebaseAuth/FirebaseAuthenticator";
import { bannedWords } from "@staticModels/instances";
import e from "express";

export class CreateUserProfile extends Controller<
    {},
    CreateUserProfileResponse,
    CreateUserProfileRequest,
    CreateUserProfileQuery
> {
    private readonly _database: Database = database;
    private readonly _firebase: FirebaseAuthenticator = firebase;

    private readonly _firebaseToken: string;
    private readonly _uid: string;
    private readonly _isPrivate: boolean;
    private readonly _avatarId: string | null;
    private readonly _backgroundId: string | null;

    private constructor(req: e.Request<{}, ResponseBody<CreateUserProfileResponse>, CreateUserProfileRequest, CreateUserProfileQuery>, res: e.Response<ResponseBody<CreateUserProfileResponse>>) {
        super(req, res);

        this._firebaseToken = req.query.firebaseToken;
        this._uid = req.body.publicUid;
        this._isPrivate = req.body.isPrivate;
        this._avatarId = req.body.avatarId;
        this._backgroundId = req.body.backgroundId;
    }

    public static async post(req: e.Request<{}, ResponseBody<CreateUserProfileResponse>, CreateUserProfileRequest, CreateUserProfileQuery>, res: e.Response<ResponseBody<CreateUserProfileResponse>>) {
        const controller = new CreateUserProfile(req, res);

        await controller.safeExecute();
    }

    protected async execute(): Promise<void> {
        const firebaseUid = await this._firebase.getFirebaseUid(this._firebaseToken);

        if (!firebaseUid) {
            this.status = 403;
            this.message = "Unauthorized";

            return;
        }

        const profiles = await this._database.users.findUsersByFirebaseUid(firebaseUid);

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

        const isValid = bannedWords.containsAnyBanned(this._uid);

        if (!isValid) {
            this.status = 400;
            this.message = "Username contains banned words";

            return;
        }

        const profile = await this._database.users.createUser(this._uid, firebaseUid);

        profile.isPrivate.value = this._isPrivate;
        profile.avatarId.value = this._avatarId;
        profile.backgroundId.value = this._backgroundId;

        const newProfile = await this._database.users.updateUser(profile);

        this.data = GetUserProfile.getRespData(newProfile, [], {});

        return;
    }
}