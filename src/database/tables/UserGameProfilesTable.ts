import { UserGameProfileRecord } from "@database/records/UserGameProfileRecord";
import { Table } from "@database/tables/Table";
import { Prisma, PrismaClient } from "@prisma/client";

export class UserGameProfilesTable extends Table<Prisma.UserGameProfileDelegate> {
    public constructor(prisma: PrismaClient) {
        super(prisma, prisma.userGameProfile);
    }

    public async find(gameUid: string): Promise<UserGameProfileRecord | null> {
        const entity = await this.table.findUnique({
            where: {
                gameUid: gameUid,
            }
        });

        if (!entity) {
            return null;
        }

        return UserGameProfileRecord.createFromEntity(entity);
    }

    public async findByUid(uid: bigint, serverId?: string): Promise<UserGameProfileRecord[]> {
        const entities = await this.table.findMany({
            where: {
                uid: uid,
                serverId: serverId,
            }
        });

        return entities.map(UserGameProfileRecord.createFromEntity);
    }

    public async upsert(record: UserGameProfileRecord): Promise<void> {
        await this.table.upsert({
            where: {
                gameUid: record.gameUid
            },
            create: {
                gameUid: record.gameUid,
                serverId: record.serverId,
                uid: record.uid,
                level: record.level.value,
                data: JSON.stringify(record.data.getEntity())
            },
            update: {
                uid: record.uid,
                data: record.getStringData()
            }
        });
    }

    public async delete(gameUid: string): Promise<void> {
        await this.table.delete({
            where: {
                gameUid: gameUid,
            }
        });
    }

    public async deleteByUid(uid: bigint): Promise<void> {
        await this.table.deleteMany({
            where: {
                uid: uid,
            }
        });
    }
}