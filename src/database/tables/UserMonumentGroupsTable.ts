import { MonumentFilters } from "@database/MonumentFilters";
import { UserMonumentGroupRecord } from "@database/records/UserMonumentGroupRecord";
import { Table } from "@database/tables/Table";
import { MonumentLeaderboardSortField } from "@models/monumentLeaderboard/MonumentLeaderboardSortField";
import { SortOrder } from "@models/SortOrder";
import { Prisma, PrismaClient } from "@prisma/client";

export class UserMonumentGroupsTable extends Table<Prisma.UserMonumentGroupDelegate> {

    public constructor(prismaClient: PrismaClient) {
        super(prismaClient, prismaClient.userMonumentGroup);
    }

    public async find(id: string): Promise<UserMonumentGroupRecord | null> {
        const entity = await this.table.findUnique({
            where: {
                id
            }
        });

        if (!entity) {
            return null;
        }

        return new UserMonumentGroupRecord(entity);
    }

    public async findMany(ids: string[]): Promise<UserMonumentGroupRecord[]> {
        const entities = await this.table.findMany({
            where: {
                id: {
                    in: ids
                }
            }
        });

        return entities.map(entity => new UserMonumentGroupRecord(entity));
    }

    public async findManyByGroupId(groupId: string, isHard?: boolean, gameUid?: string): Promise<UserMonumentGroupRecord[]> {
        const entities = await this.table.findMany({
            where: {
                groupId,
                isHard,
                gameUid
            }
        });

        return entities.map(entity => new UserMonumentGroupRecord(entity));
    }

    public async findIdsByGroupId(groupId: string,
                                  isHard: boolean,
                                  publicOnly: boolean,
                                  serverId: string | null,
                                  sortField: MonumentLeaderboardSortField,
                                  sortOrder: SortOrder,
                                  minCountInGroup: number = 0,
                                  filters: MonumentFilters,
                                  take?: number,
                                  skip?: number
    ): Promise<string[]> {
        const query = Prisma.sql`
            SELECT DISTINCT Gr.id, G.level, CharCount.char_count, R.record_count, R.clear_time
            FROM "UserMonumentGroup" Gr
                     LEFT JOIN "UserGameProfile" G ON Gr."gameUid" = G."gameUid"
                     LEFT JOIN "User" U ON G.uid = U.uid
                     INNER JOIN "UserMonumentCharacter" C ON Gr.id = C."userGroupId"
                     INNER JOIN (SELECT C2."userGroupId", count(DISTINCT C2."charId") char_count
                                 FROM "UserMonumentCharacter" C2
                                 GROUP BY C2."userGroupId") CharCount ON Gr.id = CharCount."userGroupId"
                     INNER JOIN (SELECT L."userGroupId", count(*) record_count, sum(L."clearTimeSec") clear_time
                                 FROM "UserMonumentLeaderboard" L
                                 GROUP BY L."userGroupId") R ON Gr.id = R."userGroupId"
            WHERE Gr."groupId" = ${groupId}
              AND Gr."isHard" = ${isHard}
              ${serverId ? Prisma.sql`AND G."serverId" = ${serverId}` : Prisma.sql``}
              ${publicOnly ? Prisma.sql`AND U."isPrivate" = false` : Prisma.sql``}
              AND R.record_count >= ${minCountInGroup}
              ${filters.chars ? Prisma.sql`AND C."charId" IN (${Prisma.join(filters.chars, ", ")})` : Prisma.sql``}
              ${filters.charCount ? Prisma.sql`AND CharCount.char_count IN (${Prisma.join(filters.charCount, ", ")})` : Prisma.sql``}
            ${UserMonumentGroupsTable.getOrderSql(sortField, sortOrder)}
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

    private static getOrderSql(sortField: MonumentLeaderboardSortField, sortOrder: SortOrder) {
        switch (sortField) {
            case MonumentLeaderboardSortField.TIME:
                return sortOrder === SortOrder.DESC
                    ? Prisma.sql`ORDER BY R.clear_time DESC`
                    : Prisma.sql`ORDER BY R.clear_time ASC`;
            case MonumentLeaderboardSortField.LEVEL:
                return sortOrder === SortOrder.DESC
                    ? Prisma.sql`ORDER BY G.level DESC`
                    : Prisma.sql`ORDER BY G.level ASC`;
        }
    }

    public async getByGroupId(groupId: string, isHard: boolean, gameUid: string): Promise<UserMonumentGroupRecord> {
        const entity = await this.table.upsert({
            where: {
                gameUid_groupId_isHard: {
                    groupId,
                    isHard,
                    gameUid
                }
            },
            create: {
                groupId,
                isHard,
                gameUid
            },
            update: {}
        });

        return new UserMonumentGroupRecord(entity);
    }
}