import { UserWarEchoesCharacterEntity } from "@database/entities/UserWarEchoesCharacterEntity.js";
import { UserWarEchoesCharacterRecord } from "@database/records/UserWarEchoesCharacterRecord.js";
import { Table } from "@database/tables/Table.js";
import { Prisma, PrismaClient } from "@generated/prisma-v2/index.js";
import { Amount } from "@models/Amount.js";

export class UserWarEchoesCharactersTable extends Table<Prisma.UserWarEchoesCharacterDelegate> {

    public constructor(prismaClient: PrismaClient) {
        super(prismaClient, prismaClient.userWarEchoesCharacter);
    }

    public async findByRecordId(recordId: string, charId?: string): Promise<UserWarEchoesCharacterRecord[]> {
        const entities = await this.table.findMany({
            where: {
                recordId,
                charId
            }
        });

        return entities.map(e => new UserWarEchoesCharacterRecord(e));
    }

    public async findByUserGroupId(userGroupId: string): Promise<UserWarEchoesCharacterRecord[]> {
        const entities = await this.table.findMany({
            where: {
                userGroupId
            }
        });

        return entities.map(e => new UserWarEchoesCharacterRecord(e));
    }

    public async getCharactersUsageByDungeonId(dungeonId: string, groupId?: string): Promise<Amount[]> {
        const query = Prisma.sql`
            SELECT C."charId" char_id, count(DISTINCT C."recordId") n
            FROM "UserWarEchoesCharacter" C
            WHERE C."recordId" IN (SELECT L.id
                                   FROM "UserWarEchoesLeaderboard" L
                                   WHERE L."dungeonId" = ${dungeonId}
                                   ${groupId ? Prisma.sql`AND L."groupId" = ${groupId}` : Prisma.sql``})
            GROUP BY C."charId"
            ORDER BY n DESC`;

        const result = await this.prisma.$queryRaw<{
            char_id: string;
            n: bigint;
        }[]>(query);

        return result.map(e => {
            return {
                id: e.char_id,
                count: Number(e.n)
            };
        });
    }

    public async getCharactersUsageByGroupId(groupId: string, difficulty: string): Promise<Amount[]> {
        const query = Prisma.sql`
            SELECT C."charId" char_id, count(DISTINCT C."userGroupId") n
            FROM "UserWarEchoesCharacter" C
            WHERE C."userGroupId" IN (SELECT G.id
                                      FROM "UserWarEchoesGroup" G
                                      WHERE G."groupId" = ${groupId}
                                        AND G."difficulty" = ${difficulty})
            GROUP BY C."charId"
            ORDER BY n DESC`;

        const result = await this.prisma.$queryRaw<{
            char_id: string;
            n: bigint;
        }[]>(query);

        return result.map(e => {
            return {
                id: e.char_id,
                count: Number(e.n)
            };
        });
    }

    public async getCharactersNumberInRecordByDungeonId(dungeonId: string, groupId?: string): Promise<Amount[]> {
        const query = Prisma.sql`
            SELECT CharCount.n, count(*)
            FROM (SELECT count(DISTINCT C."charId") n
                  FROM "UserWarEchoesCharacter" C
                  WHERE C."recordId" IN (SELECT L.id
                                         FROM "UserWarEchoesLeaderboard" L
                                         WHERE L."dungeonId" = ${dungeonId}
                                         ${groupId ? Prisma.sql`AND L."groupId" = ${groupId}` : Prisma.sql``})
                  GROUP BY C."recordId") as CharCount
            GROUP BY CharCount.n
            ORDER BY CharCount.n DESC`;

        const result = await this.prisma.$queryRaw<{
            n: bigint,
            count: bigint
        }[]>(query);

        return result.map(e => {
            return {
                id: e.n.toString(),
                count: Number(e.count)
            };
        });
    }

    public async getCharactersNumberInRecordByGroupId(groupId: string, difficulty: string): Promise<Amount[]> {
        const query = Prisma.sql`
            SELECT CharCount.n, count(*)
            FROM (SELECT count(DISTINCT C."charId") n
                  FROM "UserWarEchoesCharacter" C
                  WHERE C."userGroupId" IN (SELECT G.id
                                            FROM "UserWarEchoesGroup" G
                                            WHERE G."groupId" = ${groupId}
                                              AND G."difficulty" = ${difficulty})
                  GROUP BY C."userGroupId") as CharCount
            GROUP BY CharCount.n
            ORDER BY CharCount.n DESC`;

        const result = await this.prisma.$queryRaw<{
            n: bigint,
            count: bigint
        }[]>(query);

        return result.map(e => {
            return {
                id: e.n.toString(),
                count: Number(e.count)
            };
        });
    }

    public async create(recordId: string, userGroupId: string, charId: string): Promise<UserWarEchoesCharacterRecord> {
        const entity = await this.table.create({
            data: {
                recordId,
                userGroupId,
                charId
            }
        });

        return new UserWarEchoesCharacterRecord(entity);
    }

    public async createMany(entities: UserWarEchoesCharacterEntity[]): Promise<void> {
        await this.table.createMany({
            data: entities
        });
    }

    public async delete(recordId: string, charId: string): Promise<void> {
        await this.table.delete({
            where: {
                recordId_charId: {
                    recordId,
                    charId
                }
            }
        });
    }

    public async deleteByRecordId(recordId: string, charId?: string): Promise<void> {
        await this.table.deleteMany({
            where: {
                recordId,
                charId
            }
        });
    }

    public async deleteByUserGroupId(userGroupId: string, charId?: string): Promise<void> {
        await this.table.deleteMany({
            where: {
                userGroupId,
                charId
            }
        });
    }
}
