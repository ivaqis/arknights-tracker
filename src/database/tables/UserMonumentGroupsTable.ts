import { UserMonumentGroupRecord } from "@database/records/UserMonumentGroupRecord";
import { Table } from "@database/tables/Table";
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