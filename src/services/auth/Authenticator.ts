import { Database } from "@database/Database";
import { FirebaseAuthResult } from "@services/auth/FirebaseAuthResult";
import { FirebaseAuthenticator } from "@services/firebaseAuth/FirebaseAuthenticator";
import { IService } from "@services/IService";

export class Authenticator implements IService {
    public readonly name = "Authenticator";

    private readonly _database: Database;
    private readonly _firebase: FirebaseAuthenticator;

    public constructor(database: Database, firebase: FirebaseAuthenticator) {
        this._database = database;
        this._firebase = firebase;
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

        if (!profile) {
            return null;
        }

        return {
            uid: profile.uid,
            firebaseUid
        };
    }

    public isActive(): boolean {
        return this._database.isActive()
            && this._firebase.isActive();
    }
}