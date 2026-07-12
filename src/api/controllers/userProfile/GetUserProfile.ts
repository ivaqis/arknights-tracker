import { database, firebase } from "@/serviceInstances";
import { ResponseBody } from "@api/contracts/ResponseBody";
import { GetUserProfileQuery } from "@api/contracts/userProfile/GetUserProfileQuery";
import { GetUserProfileResponse } from "@api/contracts/userProfile/GetUserProfileResponse";
import { IGameProfile } from "@api/contracts/userProfile/IGameProfile";
import { Controller } from "@api/controllers/Controller";
import { Database } from "@database/Database";
import { UserRecord } from "@database/records/UserRecord";
import { ContractRecord } from "@models/contingencyContract/ContractRecord";
import { GameProfileEntity } from "@models/gameProfile/entities/GameProfileEntity";
import { FirebaseAuthenticator } from "@services/firebaseAuth/FirebaseAuthenticator";
import { crisisContractRecords } from "@staticModels/instances";
import e from "express";

export class GetUserProfile extends Controller<
    {},
    GetUserProfileResponse,
    {},
    GetUserProfileQuery
> {
    private readonly _database: Database = database;
    private readonly _firebase: FirebaseAuthenticator = firebase;

    private readonly _publicUid: string;
    private readonly _firebaseToken?: string;

    private constructor(req: e.Request<{}, ResponseBody<GetUserProfileResponse>, {}, GetUserProfileQuery>,
                        res: e.Response<ResponseBody<GetUserProfileResponse>>
    ) {
        super(req, res);

        const { uid, firebaseToken } = req.query;

        this._publicUid = uid;
        this._firebaseToken = firebaseToken;
    }

    public static async get(req: e.Request<{}, ResponseBody<GetUserProfileResponse>, {}, GetUserProfileQuery>,
                            res: e.Response<ResponseBody<GetUserProfileResponse>>
    ) {
        const controller = new GetUserProfile(req, res);

        await controller.safeExecute();
    }

    public static getRespData(record: UserRecord,
                               gameProfiles: GameProfileEntity[],
                               contractRecords: Record<string, ContractRecord | null>
    ): GetUserProfileResponse {
        return {
            publicUid: record.publicUid.initValue,
            isPrivate: record.isPrivate.initValue,
            avatarId: record.avatarId.initValue,
            backgroundId: record.backgroundId.initValue,
            gameProfiles: this.getGameProfiles(gameProfiles, contractRecords)
        };
    }

    private static getGameProfiles(gameProfiles: GameProfileEntity[],
                                   contractRecords: Record<string, ContractRecord | null>
    ): IGameProfile[] {
        const result: IGameProfile[] = [];

        for (const gameProfile of gameProfiles) {
            let record = contractRecords[gameProfile.base.roleId];

            result.push({
                gameProfile: gameProfile,
                contract: record?.getEntity() ?? null
            });
        }

        return result;
    }

    protected async execute() {
        const firebaseUid = await this._firebase.getFirebaseUid(this._firebaseToken);

        const profile = await this.getProfile();

        if (!profile) {
            this.status = 404;
            this.message = "User profile not found";

            return;
        }

        if (profile.isPrivate && (!firebaseUid || profile.firebaseUid.initValue !== firebaseUid)) {
            this.status = 403;
            this.message = "User profile is private";

            return;
        }

        const gameProfiles = await this.getGameProfiles(profile.uid);
        const gameUids = gameProfiles.map(profile => profile.base.roleId);
        const bestRecords = await this.getBestRecords(gameUids);

        this.data = GetUserProfile.getRespData(profile, gameProfiles, bestRecords);
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

    private async getProfile(): Promise<UserRecord | null> {
        return this._database.users.findUserByPublicUid(this._publicUid);
    }

    private async getGameProfiles(uid: bigint): Promise<GameProfileEntity[]> {
        const profiles = await this._database.gameProfiles.gameProfilesTable.findByUid(uid);

        return profiles.map(profile => profile.data.getEntity());
    }
}