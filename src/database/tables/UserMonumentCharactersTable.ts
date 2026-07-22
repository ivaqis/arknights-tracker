import { UserMonumentCharacterEntity } from "@database/entities/UserMonumentCharacterEntity";
import { UserMonumentCharacterRecord } from "@database/records/UserMonumentCharacterRecord";
import { Table } from "@database/tables/Table";
import { Prisma, PrismaClient } from "@prisma/client";

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