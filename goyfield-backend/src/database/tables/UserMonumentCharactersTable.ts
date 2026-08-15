import { UserMonumentCharacterEntity } from "@database/entities/UserMonumentCharacterEntity.js";
import { UserMonumentCharacterRecord } from "@database/records/UserMonumentCharacterRecord.js";
import { Table } from "@database/tables/Table.js";
import { Prisma, PrismaClient } from "@generated/prisma-v2/index.js";
import { Amount } from "@models/Amount.js";

export class UserMonumentCharactersTable extends Table<Prisma.UserMonumentCharacterDelegate> {

    public constructor(prismaClient: PrismaClient) {
        super(prismaClient, prismaClient.userMonumentCharacter);
    }

    public async findByRecordId(recordId: string, charId?: string): Promise<UserMonumentCharacterRecord[]> {
        const entities = await this.table.findMany({
            where: {
                recordId,
                charId
            }
        });

        return entities.map(e => new UserMonumentCharacterRecord(e));
    }

    public async findByUserGroupId(userGroupId: string): Promise<UserMonumentCharacterRecord[]> {
        const entities = await this.table.findMany({
            where: {
                userGroupId
            }
        });

        return entities.map(e => new UserMonumentCharacterRecord(e));
    }

    public async getCharactersUsageByDungeonId(dungeonId: string): Promise<Amount[]> {
        const query = Prisma.sql`
            SELECT C."charId" char_id, count(DISTINCT C."recordId") n
            FROM "UserMonumentCharacter" C
            WHERE C."recordId" IN (SELECT L.id
                                   FROM "UserMonumentLeaderboard" L
                                   WHERE L."dungeonId" = ${dungeonId})
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

    public async getCharactersUsageByGroupId(groupId: string, isHard: boolean): Promise<Amount[]> {
        const query = Prisma.sql`
            SELECT C."charId" char_id, count(DISTINCT C."userGroupId") n
            FROM "UserMonumentCharacter" C
            WHERE C."userGroupId" IN (SELECT G.id
                                      FROM "UserMonumentGroup" G
                                      WHERE G."groupId" = ${groupId}
                                        AND G."isHard" = ${isHard})
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
            }
        })
    }

    public async getCharactersNumberInRecordByDungeonId(dungeonId: string): Promise<Amount[]> {
        const query = Prisma.sql`
            SELECT CharCount.n, count(*)
            FROM (SELECT count(DISTINCT C."charId") n
                  FROM "UserMonumentCharacter" C
                  WHERE C."recordId" IN (SELECT L.id
                                         FROM "UserMonumentLeaderboard" L
                                         WHERE L."dungeonId" = ${dungeonId})
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

    public async getCharactersNumberInRecordByGroupId(groupId: string, isHard: boolean): Promise<Amount[]> {
        const query = Prisma.sql`
            SELECT CharCount.n, count(*)
            FROM (SELECT count(DISTINCT C."charId") n
                  FROM "UserMonumentCharacter" C
                  WHERE C."userGroupId" IN (SELECT G.id
                                            FROM "UserMonumentGroup" G
                                            WHERE G."groupId" = ${groupId}
                                              AND G."isHard" = ${isHard})
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

    public async create(recordId: string, userGroupId: string, charId: string): Promise<UserMonumentCharacterRecord> {
        const entity = await this.table.create({
            data: {
                recordId,
                userGroupId,
                charId
            }
        });

        return new UserMonumentCharacterRecord(entity);
    }

    public async createMany(entities: UserMonumentCharacterEntity[]): Promise<void> {
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