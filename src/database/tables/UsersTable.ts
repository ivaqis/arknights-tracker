import { UserRecord } from "@database/records/UserRecord";
import { Table } from "@database/tables/Table";
import { Prisma, PrismaClient } from "@prisma/client";

export class UsersTable extends Table<Prisma.UserDelegate> {
    public constructor(prisma: PrismaClient) {
        super(prisma, prisma.user);
    }

    public async create(publicUid: string, firebaseUid: string): Promise<UserRecord> {
        const entity = await this.table.create({
            data: {
                firebaseUid: firebaseUid,
                publicUid: publicUid,
            }
        });

        return new UserRecord(entity);
    }

    public async find(uid: bigint): Promise<UserRecord | null> {
        const entity = await this.table.findUnique({
            where: { uid: uid },
        });

        if (!entity) {
            return null;
        }

        return new UserRecord(entity);
    }

    public async findMany(uids: bigint[]): Promise<UserRecord[]> {
        const entities = await this.table.findMany({
            where: {
                uid: {
                    in: uids
                }
            }
        });

        return entities.map(entity => new UserRecord(entity));
    }

    public async findByPublicUid(publicUid: string): Promise<UserRecord | null> {
        const entity = await this.table.findUnique({
            where: { publicUid: publicUid },
        });

        if (!entity) {
            return null;
        }

        return new UserRecord(entity);
    }

    public async findByFirebaseUid(firebaseUid: string): Promise<UserRecord[]> {
        const entities = await this.table.findMany({
            where: { firebaseUid: firebaseUid }
        });

        return entities.map(entity => new UserRecord(entity));
    }

    public async update(record: UserRecord): Promise<UserRecord> {
        const entity = await this.table.update({
            where: {
                uid: record.uid
            },
            data: {
                publicUid: record.publicUid.value,
                isPrivate: record.isPrivate.value,
                avatarId: record.avatarId.value,
                backgroundId: record.backgroundId.value,
                displayAvatar: record.displayAvatar.value,
                uploadCount: record.uploadCount.value,
                lastUploadReset: record.lastUploadReset.value
            }
        });

        return new UserRecord(entity);
    }

    public async delete(uid: bigint): Promise<void> {
        await this.table.delete({
            where: {
                uid: uid
            }
        });
    }

    public async deleteByFirebaseUid(firebaseUid: string): Promise<void> {
        await this.table.deleteMany({
            where: {
                firebaseUid: firebaseUid
            }
        });
    }
}