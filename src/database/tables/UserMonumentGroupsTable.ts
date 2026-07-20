import { UserMonumentGroupRecord } from "@database/records/UserMonumentGroupRecord";
import { Table } from "@database/tables/Table";
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

    public async findByGroupIdSortedByLevel(groupId: string,
                                            isHard: boolean,
                                            publicOnly: boolean,
                                            serverId: string | null,
                                            sortOrder: SortOrder,
                                            minCountInGroup: number = 0,
                                            take: number,
                                            skip: number
    ): Promise<string[]> {
        const entities = await this.prisma.$queryRaw<{
            id: string;
        }[]>`
            SELECT gr.id
            FROM "UserMonumentGroup" gr
                     LEFT JOIN "UserGameProfile" game ON game."gameUid" = gr."gameUid"
                     LEFT JOIN public."User" U ON U.uid = game.uid
            WHERE gr."groupId" = ${groupId}
              AND gr."isHard" = ${isHard}
              ${serverId ? `AND game."serverId" = ${serverId}` : ""}
              ${publicOnly ? "AND U.\"isPrivate\" = false" : ""}
              AND (SELECT count(l.id)
                   FROM "UserMonumentLeaderboard" l
                   WHERE l."userGroupId" = gr.id) >= ${minCountInGroup}
            ORDER BY game.level ${sortOrder}
            LIMIT ${take}
            OFFSET ${skip}`;

        return entities.map(entity => entity.id);
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