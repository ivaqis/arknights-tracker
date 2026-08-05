import { config } from "@/config";
import { ResponseBody } from "@api/contracts/ResponseBody";
import { Database } from "@database/Database";
import { AuthType } from "@services/auth/AuthType";
import { Credentials } from "@services/auth/Credentials";
import { FirebaseAuthResult } from "@services/auth/FirebaseAuthResult";
import { FirebaseAuthenticator } from "@services/firebaseAuth/FirebaseAuthenticator";
import { IService } from "@services/IService";
import e from "express";
import * as core from "express-serve-static-core";

export class Authenticator implements IService {
    public readonly name = "Authenticator";

    private readonly _database: Database;
    private readonly _firebase: FirebaseAuthenticator;

    public constructor(database: Database, firebase: FirebaseAuthenticator) {
        this._database = database;
        this._firebase = firebase;
    }

    public static containsAuthHeader(req: e.Request<core.ParamsDictionary, ResponseBody<unknown>, unknown, unknown>, ...authTypes: AuthType[]): boolean {
        const authHeader = req.get("Authorization");

        if (!authHeader) {
            return false;
        }

        const creds = this.getCredentials(authHeader);

        if (!creds) {
            return false;
        }

        if (authTypes.length === 0) {
            return true;
        }

        for (const authType of authTypes) {
            if (creds.type === authType) {
                return true;
            }
        }

        return false;
    }

    public static getAuthCredentials(req: e.Request<core.ParamsDictionary, any, any, any>): Credentials | null {
        const header = req.get("Authorization");

        if (!header) {
            return null;
        }

        return this.getCredentials(header);
    }

    public static getCredentials(authHeader: string): Credentials | null {
        const parts = authHeader.split(" ").filter(Boolean);

        if (parts.length !== 2) {
            return null;
        }

        const authType = parts[0];
        const cred = parts[1];

        return {
            type: authType,
            cred
        };
    }

    public async authByFirebaseCred(credentials: Credentials): Promise<FirebaseAuthResult | null> {
        if (credentials.type !== AuthType.FIREBASE) {
            return null;
        }

        return await this.authByFirebase(credentials.cred);
    }

    public async authByFirebase(firebaseToken: string | null): Promise<FirebaseAuthResult | null> {
        if (!this._firebase.isActive() || !this._database.isActive()) {
            return null;
        }

        const firebaseUid = await this._firebase.getFirebaseUid(firebaseToken);

        if (!firebaseUid) {
            return null;
        }

        const profile = await this._database.users.findUserByFirebaseUid(firebaseUid);

        return {
            uid: profile?.uid ?? null,
            firebaseUid
        };
    }

    public authByAdminSecretCred(credentials: Credentials): boolean {
        if (credentials.type !== AuthType.ADMIN_SECRET) {
            return false;
        }

        return this.authByAdminSecret(credentials.cred);
    }

    public authByAdminSecret(adminSecret: string | null): boolean {
        if (!adminSecret) {
            return false;
        }

        return adminSecret === config.adminSecret;
    }

    public isActive(): boolean {
        return this._database.isActive()
            && this._firebase.isActive();
    }
}