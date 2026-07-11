import { UserRecord } from "@database/records/UserRecord";
import { Repository } from "@database/repositories/Repository";
import { FirebaseUsersTable } from "@database/tables/FirebaseUsersTable";
import { UsersTable } from "@database/tables/UsersTable";
import { PrismaClient } from "@prisma/client";

export class UsersRepository extends Repository {
    private readonly _usersTable: UsersTable;
    private readonly _firebaseUsersTable: FirebaseUsersTable;

    public constructor(prisma: PrismaClient) {
        super(prisma);

        this._usersTable = new UsersTable(prisma);
        this._firebaseUsersTable = new FirebaseUsersTable(prisma);
    }

    public async createUser(publicUid: string, firebaseUid: string): Promise<UserRecord> {
        return this._usersTable.create(publicUid, firebaseUid);
    }

    public async findUser(uid: bigint): Promise<UserRecord | null> {
        return this._usersTable.find(uid);
    }

    public async findUserByPublicUid(publicUid: string): Promise<UserRecord | null> {
        return this._usersTable.findByPublicUid(publicUid);
    }

    public async findUsersByFirebaseUid(firebaseUid: string): Promise<UserRecord[]> {
        return this._usersTable.findByFirebaseUid(firebaseUid);
    }

    public async isUserExist(publicUid: string): Promise<boolean> {
        const user  = await this.findUserByPublicUid(publicUid);

        return !!user;
    }

    public async updateUser(record: UserRecord): Promise<void> {
        return this._usersTable.update(record);
    }

    public async deleteUser(uid: bigint): Promise<void> {
        return this._usersTable.delete(uid);
    }

    public async deleteFirebaseUser(firebaseUid: string): Promise<void> {
        return this._firebaseUsersTable.delete(firebaseUid);
    }
}