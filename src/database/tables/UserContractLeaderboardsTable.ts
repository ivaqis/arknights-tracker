import { UserContractLeaderboardRecord } from "@database/records/UserContractLeaderboardRecord";
import { UserGameProfileRecord } from "@database/records/UserGameProfileRecord";
import { UserRecord } from "@database/records/UserRecord";
import { Table } from "@database/tables/Table";
import { ContractLeaderboardSortField } from "@models/contractLeaderboard/ContractLeaderboardSortField";
import { SortOrder } from "@models/SortOrder";
import { Prisma, PrismaClient } from "@prisma/client";

export class UserContractLeaderboardsTable extends Table<Prisma.UserContractLeaderboardDelegate> {
    public constructor(prisma: PrismaClient) {
        super(prisma, prisma.userContractLeaderboard);
    }

    private static getOrderOptions(sortField: ContractLeaderboardSortField, sortOrder: SortOrder) {
        switch (sortField) {
            case ContractLeaderboardSortField.TIME:
                return {
                    clearTimeSec: sortOrder
                };
            case ContractLeaderboardSortField.INDICATOR_COUNT:
                return {
                    indicatorCount: sortOrder
                };
            case ContractLeaderboardSortField.LEVEL:
                return {
                    userGameProfile: {
                        level: sortOrder
                    }
                };
        }
    }

    private static getWhereCondition(contractId: string, publicOnly: boolean, serverId: string | null) {
        if (publicOnly) {
            return {
                contractId,
                userGameProfile: {
                    serverId: serverId ?? undefined,
                    user: {
                        isPrivate: false
                    }
                }
            };
        }

        return {
            contractId,
            userGameProfile: serverId ? {
                serverId
            } : undefined
        };
    }

    public async find(recordId: string): Promise<UserContractLeaderboardRecord | null> {
        const entity = await this.table.findUnique({
            where: {
                recordId: recordId
            }
        });

        if (!entity) {
            return null;
        }

        return UserContractLeaderboardRecord.createFromEntity(entity);
    }

    public async findByContractId(contractId: string, publicOnly: boolean, serverId: string | null): Promise<UserContractLeaderboardRecord[]> {
        const entities = await this.table.findMany({
            where: UserContractLeaderboardsTable.getWhereCondition(contractId, publicOnly, serverId)
        });

        return entities.map(UserContractLeaderboardRecord.createFromEntity);
    }

    public async countByContractId(contractId: string, publicOnly: boolean, serverId: string | null): Promise<number> {
        return this.table.count({
            where: UserContractLeaderboardsTable.getWhereCondition(contractId, publicOnly, serverId)
        });
    }

    public async findByGameUid(gameUid: string, contractId?: string): Promise<UserContractLeaderboardRecord[]> {
        const entities = await this.table.findMany({
            where: {
                gameUid: gameUid,
                contractId: contractId
            }
        });

        return entities.map(UserContractLeaderboardRecord.createFromEntity);
    }

    public async findBestByGameUid(gameUid: string, contractId?: string): Promise<UserContractLeaderboardRecord | null> {
        const entity = await this.table.findFirst({
            where: {
                gameUid: gameUid,
                contractId: contractId
            },
            orderBy: [
                { indicatorCount: "desc" },
                { clearTimeSec: "desc" }
            ]
        });

        if (!entity) {
            return null;
        }

        return UserContractLeaderboardRecord.createFromEntity(entity);
    }

    public async findContractRecordsIncludeGameProfileAndUser(contractId: string, publicOnly: boolean, serverId: string | null): Promise<{
        contractRecord: UserContractLeaderboardRecord,
        gameProfile: UserGameProfileRecord,
        user: UserRecord
    }[]>;
    public async findContractRecordsIncludeGameProfileAndUser(contractId: string, publicOnly: boolean, serverId: string | null, sortField: ContractLeaderboardSortField, sortOrder: SortOrder, take?: number, skip?: number): Promise<{
        contractRecord: UserContractLeaderboardRecord,
        gameProfile: UserGameProfileRecord,
        user: UserRecord
    }[]>;

    public async findContractRecordsIncludeGameProfileAndUser(contractId: string,
                                                              publicOnly: boolean,
                                                              serverId: string | null,
                                                              sortField?: ContractLeaderboardSortField,
                                                              sortOrder?: SortOrder,
                                                              take?: number,
                                                              skip?: number
    ): Promise<{
        contractRecord: UserContractLeaderboardRecord,
        gameProfile: UserGameProfileRecord,
        user: UserRecord
    }[]> {
        const entities = await this.table.findMany({
            take,
            skip,
            where: UserContractLeaderboardsTable.getWhereCondition(contractId, publicOnly, serverId),
            orderBy : sortField && sortOrder
                ? UserContractLeaderboardsTable.getOrderOptions(sortField, sortOrder)
                : undefined,
            include: {
                userGameProfile: {
                    include: {
                        user: true
                    }
                }
            }
        });

        return entities.map(entity => {
            return {
                contractRecord: UserContractLeaderboardRecord.createFromEntity(entity),
                gameProfile: UserGameProfileRecord.createFromEntity(entity.userGameProfile),
                user: new UserRecord(entity.userGameProfile.user)
            };
        });
    }

    public async create(record: UserContractLeaderboardRecord) {
        await this.table.create({
            data: {
                recordId: record.recordId,
                gameUid: record.gameUid,
                contractId: record.contractId,
                indicatorCount: record.indicatorCount,
                clearTimeSec: record.clearTimeSec,
                data: record.getStringData()
            }
        });
    }

    public async delete(recordId: string): Promise<void> {
        await this.table.delete({
            where: {
                recordId: recordId
            }
        });
    }

    public async deleteByGameUid(gameUid: string): Promise<void> {
        await this.table.deleteMany({
            where: {
                gameUid: gameUid
            }
        });
    }
}