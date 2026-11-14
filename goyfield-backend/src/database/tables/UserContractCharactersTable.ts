import { UserContractCharacterEntity } from "@database/entities/UserContractCharacterEntity.js";
import { UserContractCharacterRecord } from "@database/records/UserContractCharacterRecord.js";
import { Table } from "@database/tables/Table.js";
import { Prisma, PrismaClient } from "@generated/prisma-v2/index.js";
import { Amount } from "@models/Amount.js";

export class UserContractCharactersTable extends Table<Prisma.UserContractCharacterDelegate> {

    public constructor(prismaClient: PrismaClient) {
        super(prismaClient, prismaClient.userContractCharacter);
    }

    public async findByUserRecordId(userRecordId: string, charId?: string): Promise<UserContractCharacterRecord[]> {
        const entities = await this.table.findMany({
            where: {
                userRecordId,
                charId
            }
        });

        return entities.map(entity => new UserContractCharacterRecord(entity));
    }

    public async getCharactersUsageByContractId(contractId: string): Promise<Amount[]> {
        const query = Prisma.sql`
            SELECT C."charId" char_id, count(DISTINCT C."userRecordId") n
            FROM "UserContractCharacter" C
            WHERE C."userRecordId" IN (SELECT L.id
                                       FROM "UserContractLeaderboard" L
                                       WHERE L."contractId" = ${contractId})
            GROUP BY C."charId"
            ORDER BY n DESC`;

        const result = await this.prisma.$queryRaw<{
            char_id: string;
            n: bigint;
        }[]>(query);

        return result.map(e => ({
            id: e.char_id,
            count: Number(e.n)
        }));
    }

    public async getCharactersNumberInRecordByContractId(contractId: string): Promise<Amount[]> {
        const query = Prisma.sql`
            SELECT CharCount.n, count(*)
            FROM (SELECT count(DISTINCT C."charId") n
                  FROM "UserContractCharacter" C
                  WHERE C."userRecordId" IN (SELECT L.id
                                             FROM "UserContractLeaderboard" L
                                             WHERE L."contractId" = ${contractId})
                  GROUP BY C."userRecordId") as CharCount
            GROUP BY CharCount.n
            ORDER BY CharCount.n DESC`;

        const result = await this.prisma.$queryRaw<{
            n: bigint,
            count: bigint
        }[]>(query);

        return result.map(e => ({
            id: e.n.toString(),
            count: Number(e.count)
        }));
    }

    public async create(userRecordId: string, charId: string): Promise<UserContractCharacterRecord> {
        const entity = await this.table.create({
            data: {
                userRecordId,
                charId
            }
        });

        return new UserContractCharacterRecord(entity);
    }

    public async createMany(entities: UserContractCharacterEntity[]): Promise<void> {
        await this.table.createMany({
            data: entities,
        });
    }

    public async delete(userRecordId: string, charId: string): Promise<void> {
        await this.table.delete({
            where: {
                userRecordId_charId: {
                    userRecordId,
                    charId
                }
            }
        });
    }

    public async deleteByUserRecordId(userRecordId: string, charId?: string): Promise<void> {
        await this.table.deleteMany({
            where: {
                userRecordId,
                charId
            }
        });
    }
}