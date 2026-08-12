import { FirebaseUserEntity } from "@database/entities/FirebaseUserEntity.js";

export class FirebaseUserRecord {
    private readonly _firebaseUid: string;
    private readonly _createdAt: Date;

    public constructor(entity: FirebaseUserEntity) {
        this._firebaseUid = entity.firebaseUid;
        this._createdAt = entity.createdAt;
    }

    public get firebaseUid(): string {
        return this._firebaseUid;
    }

    public get createdAt(): Date {
        return this._createdAt;
    }
}