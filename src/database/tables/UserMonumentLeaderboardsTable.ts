import { UserGameProfileRecord } from "@database/records/UserGameProfileRecord";
import { UserMonumentLeaderboardRecord } from "@database/records/UserMonumentLeaderboardRecord";
import { UserRecord } from "@database/records/UserRecord";
import { Table } from "@database/tables/Table";
import { Prisma, PrismaClient } from "@prisma/client";

export class UserMonumentLeaderboardsTable extends Table<Prisma.UserMonumentLeaderboardDelegate> {
    public constructor(prisma: PrismaClient) {
        super(prisma, prisma.userMonumentLeaderboard);
    }

    public async find(gameUid: string, dungeonId: string): Promise<UserMonumentLeaderboardRecord | null> {
        const entity = await this.table.findUnique({
            where: {
                gameUid_dungeonId: {
                    dungeonId,
                    gameUid
                }
            }
        });

        if (!entity) {
            return null;
        }

        return UserMonumentLeaderboardRecord.createFromEntity(entity);
    }

    public async findIncludeGameProfileAndUser(gameUid: string, dungeonId: string): Promise<{
        record: UserMonumentLeaderboardRecord,
        gameProfile: UserGameProfileRecord,
        user: UserRecord
    } | null> {
        const entity = await this.table.findUnique({
            where: {
                gameUid_dungeonId: {
                    dungeonId,
                    gameUid
                }
            },
            include: {
                userGameProfile: {
                    include: {
                        user: true
                    }
                }
            }
        });

        if (!entity) {
            return null;
        }

        return {
            record: UserMonumentLeaderboardRecord.createFromEntity(entity),
            gameProfile: UserGameProfileRecord.createFromEntity(entity.userGameProfile),
            user: new UserRecord(entity.userGameProfile.user)
        };
    }

    public async findByGameUid(gameUid: string, dungeonId?: string): Promise<UserMonumentLeaderboardRecord[]> {
        const entities = await this.table.findMany({
            where: {
                gameUid: gameUid,
                dungeonId: dungeonId
            }
        });

        return entities.map(UserMonumentLeaderboardRecord.createFromEntity);
    }

    public async findByDungeonId(dungeonId: string): Promise<UserMonumentLeaderboardRecord[]> {
        const entities = await this.table.findMany({
            where: {
                dungeonId
            }
        });

        return entities.map(UserMonumentLeaderboardRecord.createFromEntity);
    }

    public async findByGroupId(groupId: string, isHard?: boolean, gameUid?: string): Promise<UserMonumentLeaderboardRecord[]> {
        const entities = await this.table.findMany({
            where: {
                groupId,
                isHard,
                gameUid
            }
        });

        return entities.map(UserMonumentLeaderboardRecord.createFromEntity);
    }

    public async upsert(record: UserMonumentLeaderboardRecord): Promise<UserMonumentLeaderboardRecord> {
        const entity = await this.table.upsert({
            where: {
                gameUid_dungeonId: {
                    dungeonId: record.dungeonId,
                    gameUid: record.gameUid
                }
            },
            update: {
                clearTimeSec: record.clearTimeSec,
                data: record.getStringData()
            },
            create: {
                gameUid: record.gameUid,
                dungeonId: record.dungeonId,
                groupId: record.groupId,
                isHard: record.isHard,
                clearTimeSec: record.clearTimeSec,
                data: record.getStringData()
            }
        });

        return UserMonumentLeaderboardRecord.createFromEntity(entity);
    }

    public async create(record: UserMonumentLeaderboardRecord): Promise<UserMonumentLeaderboardRecord> {
        const entity = await this.table.create({
            data: {
                gameUid: record.gameUid,
                dungeonId: record.dungeonId,
                groupId: record.groupId,
                isHard: record.isHard,
                clearTimeSec: record.clearTimeSec,
                data: record.getStringData()
            }
        });

        return UserMonumentLeaderboardRecord.createFromEntity(entity);
    }

    public async delete(gameUid: string, dungeonId: string): Promise<void> {
        await this.table.delete({
            where: {
                gameUid_dungeonId: {
                    dungeonId,
                    gameUid
                }
            }
        });
    }

    public async deleteByGameUid(gameUid: string): Promise<void> {
        await this.table.deleteMany({
            where: {
                gameUid
            }
        });
    }
}