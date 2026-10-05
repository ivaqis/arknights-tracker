import { MonumentFilters } from "@database/MonumentFilters.js";
import { UserGameProfileRecord } from "@database/records/UserGameProfileRecord.js";
import { UserWarEchoesGroupRecord } from "@database/records/UserWarEchoesGroupRecord.js";
import { UserRecord } from "@database/records/UserRecord.js";
import { Table } from "@database/tables/Table.js";
import { Prisma, PrismaClient } from "@generated/prisma-v2/index.js";
import { WarEchoesLeaderboardSortField } from "@models/warEchoesLeaderboard/WarEchoesLeaderboardSortField.js";
import { SortOrder } from "@models/SortOrder.js";

export class UserWarEchoesGroupsTable extends Table<Prisma.UserWarEchoesGroupDelegate> {

    public constructor(prismaClient: PrismaClient) {
        super(prismaClient, prismaClient.userWarEchoesGroup);
    }

    public async find(id: string): Promise<UserWarEchoesGroupRecord | null> {
        const entity = await this.table.findUnique({
            where: {
                id
            }
        });

        if (!entity) {
            return null;
        }

        return new UserWarEchoesGroupRecord(entity);
    }

    public async findMany(ids: string[]): Promise<UserWarEchoesGroupRecord[]> {
        const entities = await this.table.findMany({
            where: {
                id: {
                    in: ids
                }
            }
        });

        return entities.map(entity => new UserWarEchoesGroupRecord(entity));
    }

    public async findManyIncludeGameProfileAndUser(ids: string[]): Promise<{
        group: UserWarEchoesGroupRecord,
        gameProfile: UserGameProfileRecord,
        user: UserRecord
    }[]> {
        const entities = await this.table.findMany({
            where: {
                id: {
                    in: ids
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

        return entities.map(e => {
            return {
                group: new UserWarEchoesGroupRecord(e),
                gameProfile: UserGameProfileRecord.createFromEntity(e.userGameProfile),
                user: new UserRecord(e.userGameProfile.user)
            };
        });
    }

    public async findManyByGroupId(groupId: string, difficulty?: string, gameUid?: string): Promise<UserWarEchoesGroupRecord[]> {
        const entities = await this.table.findMany({
            where: {
                groupId,
                difficulty,
                gameUid
            }
        });

        return entities.map(entity => new UserWarEchoesGroupRecord(entity));
    }

    public async findIdsByGroupId(groupId: string,
                                  difficulty: string,
                                  publicOnly: boolean,
                                  serverId: string | null,
                                  sortField: WarEchoesLeaderboardSortField,
                                  sortOrder: SortOrder,
                                  minCountInGroup: number = 0,
                                  filters: MonumentFilters,
                                  take?: number,
                                  skip?: number
    ): Promise<string[]> {
        const query = Prisma.sql`
            SELECT DISTINCT Gr.id, G.level, CharCount.char_count, R.record_count, R.clear_time
            FROM "UserWarEchoesGroup" Gr
                     LEFT JOIN "UserGameProfile" G ON Gr."gameUid" = G."gameUid"
                     LEFT JOIN "User" U ON G.uid = U.uid
                     INNER JOIN "UserWarEchoesCharacter" C ON Gr.id = C."userGroupId"
                     INNER JOIN (SELECT C2."userGroupId", count(DISTINCT C2."charId") char_count
                                 FROM "UserWarEchoesCharacter" C2
                                 GROUP BY C2."userGroupId") CharCount ON Gr.id = CharCount."userGroupId"
                     INNER JOIN (SELECT L."userGroupId", count(*) record_count, sum(L."clearTimeSec") clear_time
                                 FROM "UserWarEchoesLeaderboard" L
                                 GROUP BY L."userGroupId") R ON Gr.id = R."userGroupId"
            WHERE Gr."groupId" = ${groupId}
              AND Gr."difficulty" = ${difficulty}
              ${serverId ? Prisma.sql`AND G."serverId" = ${serverId}` : Prisma.sql``}
              ${publicOnly ? Prisma.sql`AND U."isPrivate" = false` : Prisma.sql``}
              AND R.record_count >= ${minCountInGroup}
              ${filters.chars ? Prisma.sql`AND C."charId" IN (${Prisma.join(filters.chars, ", ")})` : Prisma.sql``}
              ${filters.charCount ? Prisma.sql`AND CharCount.char_count IN (${Prisma.join(filters.charCount, ", ")})` : Prisma.sql``}
            ${UserWarEchoesGroupsTable.getOrderSql(sortField, sortOrder)}
            ${skip ? Prisma.sql`OFFSET ${skip}` : Prisma.sql``} 
            ${take ? Prisma.sql`LIMIT ${take}` : Prisma.sql``}`;

        const entities = await this.prisma.$queryRaw<{
            id: string;
            level: number;
            char_count: bigint;
            record_count: bigint;
            clear_time: bigint;
        }[]>(query);

        return entities.map(entity => entity.id);
    }

    private static getOrderSql(sortField: WarEchoesLeaderboardSortField, sortOrder: SortOrder) {
        switch (sortField) {
            case WarEchoesLeaderboardSortField.TIME:
                return sortOrder === SortOrder.DESC
                    ? Prisma.sql`ORDER BY R.clear_time DESC`
                    : Prisma.sql`ORDER BY R.clear_time ASC`;
            case WarEchoesLeaderboardSortField.LEVEL:
                return sortOrder === SortOrder.DESC
                    ? Prisma.sql`ORDER BY G.level DESC`
                    : Prisma.sql`ORDER BY G.level ASC`;
        }
    }

    public async getByGroupId(groupId: string, difficulty: string, gameUid: string): Promise<UserWarEchoesGroupRecord> {
        const entity = await this.table.upsert({
            where: {
                gameUid_groupId_difficulty: {
                    groupId,
                    difficulty,
                    gameUid
                }
            },
            create: {
                groupId,
                difficulty,
                gameUid
            },
            update: {}
        });

        return new UserWarEchoesGroupRecord(entity);
    }
}
