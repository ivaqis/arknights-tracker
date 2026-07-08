import { UserMonumentLeaderboardEntity } from "@database/entities/UserMonumentLeaderboardEntity";
import { UserMonumentLeaderboardRecord } from "@database/records/UserMonumentLeaderboardRecord";
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

    public async findByGroupId(groupId: string, isHard?: boolean): Promise<UserMonumentLeaderboardRecord[]> {
        const entities = await this.table.findMany({
            where: {
                groupId,
                isHard
            }
        });

        return entities.map(UserMonumentLeaderboardRecord.createFromEntity);
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