import { UserGameProfileRecord } from "@database/records/UserGameProfileRecord";
import { Table } from "@database/tables/Table";
import { Prisma, PrismaClient } from "@generated/prisma-v2";

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

    public async findMany(gameUids: string[]): Promise<UserGameProfileRecord[]> {
        const entities = await this.table.findMany({
            where: {
                gameUid: {
                    in: gameUids
                }
            }
        });

        return entities.map(UserGameProfileRecord.createFromEntity);
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

    public async findByBannerProfileId(profileId: bigint): Promise<UserGameProfileRecord | null> {
        const entity = await this.table.findUnique({
            where: {
                bannerProfileId: profileId
            }
        });

        if (!entity) {
            return null;
        }

        return UserGameProfileRecord.createFromEntity(entity);
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
                data: JSON.stringify(record.data.getEntity()),
                bannerProfileId: record.bannerProfileId.value
            },
            update: {
                uid: record.uid,
                level: record.level.value,
                data: record.getStringData(),
                bannerProfileId: record.bannerProfileId.value
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