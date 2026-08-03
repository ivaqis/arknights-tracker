import { FirebaseUserEntity } from "@database/entities/FirebaseUserEntity";
import { FirebaseUserRecord } from "@database/records/FirebaseUserRecord";
import { Table } from "@database/tables/Table";
import { Prisma, PrismaClient } from "@prisma/client";

export class FirebaseUsersTable extends Table<Prisma.FirebaseUserDelegate> {
    public constructor(prisma: PrismaClient) {
        super(prisma, prisma.firebaseUser);
    }

    public async get(firebaseUid: string): Promise<FirebaseUserRecord> {
        const entity = await this.getEntity(firebaseUid);

        return new FirebaseUserRecord(entity);
    }

    public async delete(firebaseUid: string): Promise<void> {
        await this.table.delete({
            where: {
                firebaseUid: firebaseUid
            }
        });
    }

    private async getEntity(firebaseUid: string): Promise<FirebaseUserEntity> {
        return this.table.upsert({
            where: {
                firebaseUid: firebaseUid
            },
            create: {
                firebaseUid: firebaseUid
            },
            update: {}
        });
    }
}