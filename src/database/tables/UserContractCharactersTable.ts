import { UserContractCharacterEntity } from "@database/entities/UserContractCharacterEntity";
import { UserContractCharacterRecord } from "@database/records/UserContractCharacterRecord";
import { Table } from "@database/tables/Table";
import { Prisma, PrismaClient } from "@prisma/client";

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