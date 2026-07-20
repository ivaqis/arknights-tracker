import { UserGameProfileRecord } from "@database/records/UserGameProfileRecord";
import { UserMonumentLeaderboardRecord } from "@database/records/UserMonumentLeaderboardRecord";
import { UserRecord } from "@database/records/UserRecord";
import { Table } from "@database/tables/Table";
import { MonumentRecord } from "@models/monument/MonumentRecord";
import { Prisma, PrismaClient } from "@prisma/client";

export class UserMonumentLeaderboardsTable extends Table<Prisma.UserMonumentLeaderboardDelegate> {
    public constructor(prisma: PrismaClient) {
        super(prisma, prisma.userMonumentLeaderboard);
    }

    public async find(id: string): Promise<UserMonumentLeaderboardRecord | null> {
        const entity = await this.table.findUnique({
            where: {
                id
            }
        });

        if (!entity) {
            return null;
        }

        return UserMonumentLeaderboardRecord.createFromEntity(entity);
    }

    public async findByGameUidIncludeGameProfileAndUser(gameUid: string, dungeonId: string): Promise<{
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

    public async findByUserGroupId(userGroupId: string): Promise<UserMonumentLeaderboardRecord[]> {
        const entities = await this.table.findMany({
            where: {
                userGroupId
            }
        });

        return entities.map(UserMonumentLeaderboardRecord.createFromEntity);
    }

    public async create(userGroupId: string, gameUid: string, data: MonumentRecord): Promise<UserMonumentLeaderboardRecord> {
        const entity = await this.table.create({
            data: {
                userGroupId,
                gameUid,
                dungeonId: data.dungeonId,
                groupId: data.groupId,
                isHard: data.isHard,
                clearTimeSec: data.passTS,
                data: JSON.stringify(data.getEntity())
            }
        });

        return UserMonumentLeaderboardRecord.createFromEntity(entity);
    }

    public async delete(id: string): Promise<void> {
        await this.table.delete({
            where: {
                id
            }
        });
    }

    public async deleteByGameUid(gameUid: string, dungeonId?: string): Promise<void> {
        await this.table.deleteMany({
            where: {
                gameUid,
                dungeonId
            }
        });
    }
}