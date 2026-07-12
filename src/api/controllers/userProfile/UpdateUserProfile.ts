import { database, firebase } from "@/serviceInstances";
import { ResponseBody } from "@api/contracts/ResponseBody";
import { UpdateUserProfileQuery } from "@api/contracts/userProfile/UpdateUserProfileQuery";
import { UpdateUserProfileRequest } from "@api/contracts/userProfile/UpdateUserProfileRequest";
import { UpdateUserProfileResponse } from "@api/contracts/userProfile/UpdateUserProfileResponse";
import { Controller } from "@api/controllers/Controller";
import { GetUserProfile } from "@api/controllers/userProfile/GetUserProfile";
import { Database } from "@database/Database";
import { ContractRecord } from "@models/contingencyContract/ContractRecord";
import { GameProfileEntity } from "@models/gameProfile/entities/GameProfileEntity";
import { FirebaseAuthenticator } from "@services/firebaseAuth/FirebaseAuthenticator";
import { bannedWords, crisisContractRecords } from "@staticModels/instances";
import e from "express";

export class UpdateUserProfile
    extends Controller<
        {},
        UpdateUserProfileResponse,
        UpdateUserProfileRequest,
        UpdateUserProfileQuery
    > {
    private readonly _database: Database = database;
    private readonly _firebase: FirebaseAuthenticator = firebase;

    private readonly _firebaseToken: string;
    private readonly _uid: string;
    private readonly _newUid?: string;
    private readonly _isPrivate?: boolean;
    private readonly _avatarId?: string;
    private readonly _backgroundId?: string;

    private constructor(req: e.Request<{}, ResponseBody<UpdateUserProfileResponse>, UpdateUserProfileRequest, UpdateUserProfileQuery>, res: e.Response<ResponseBody<UpdateUserProfileResponse>>) {
        super(req, res);

        this._firebaseToken = req.query.firebaseToken;
        this._uid = req.query.uid;
        this._newUid = req.body.newUid;
        this._isPrivate = req.body.isPrivate;
        this._avatarId = req.body.avatarId;
        this._backgroundId = req.body.backgroundId;
    }

    public static async post(req: e.Request<{}, ResponseBody<UpdateUserProfileResponse>, UpdateUserProfileRequest, UpdateUserProfileQuery>, res: e.Response<ResponseBody<UpdateUserProfileResponse>>) {
        const controller = new UpdateUserProfile(req, res);

        await controller.safeExecute();
    }

    protected async execute(): Promise<void> {
        const profile = await this._database.users.findUserByPublicUid(this._uid);

        if (!profile) {
            this.status = 404;
            this.message = "User not found";

            return;
        }

        const firebaseUid = await this._firebase.getFirebaseUid(this._firebaseToken);

        if (!firebaseUid || profile.firebaseUid.initValue !== firebaseUid) {
            this.status = 403;
            this.message = "Unauthorized";

            return;
        }

        if (this._newUid) {
            const exists = await this._database.users.isUserExist(this._uid);

            if (exists) {
                this.status = 400;
                this.message = "User already exists";

                return;
            }

            const isValid = bannedWords.containsAnyBanned(this._newUid);

            if (!isValid) {
                this.status = 400;
                this.message = "Username contains banned words";

                return;
            }

            profile.publicUid.value = this._newUid;
        }

        if (this._isPrivate !== undefined) {
            profile.isPrivate.value = this._isPrivate;
        }

        if (this._avatarId !== undefined) {
            profile.avatarId.value = this._avatarId;
        }

        if (this._backgroundId !== undefined) {
            profile.backgroundId.value = this._backgroundId;
        }

        const newProfile = await this._database.users.updateUser(profile);
        const gameProfiles = await this.getGameProfiles(newProfile.uid);
        const gameUids = gameProfiles.map(profile => profile.base.roleId);
        const bestRecords = await this.getBestRecords(gameUids);

        this.data = GetUserProfile.getRespData(newProfile, gameProfiles, bestRecords);

        return;
    }

    private async getGameProfiles(uid: bigint): Promise<GameProfileEntity[]> {
        const profiles = await this._database.gameProfiles.gameProfilesTable.findByUid(uid);

        return profiles.map(profile => profile.data.getEntity());
    }

    private async getBestRecords(gameUids: string[]): Promise<Record<string, ContractRecord | null>> {
        const currentContractId = crisisContractRecords.current.id;
        const records: Record<string, ContractRecord | null> = {};

        for (const uid of gameUids) {
            const record = await this._database.gameProfiles.contractTable.findBestByGameUid(uid, currentContractId);

            records[uid] = record?.data ?? null;
        }

        return records;
    }
}