import { UserContractLeaderboardRecord } from "@database/records/UserContractLeaderboardRecord";
import { Table } from "@database/tables/Table";
import { Prisma, PrismaClient } from "@prisma/client";

export class UserContractLeaderboardsTable extends Table<Prisma.UserContractLeaderboardDelegate> {
    public constructor(prisma: PrismaClient) {
        super(prisma, prisma.userContractLeaderboard);
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

    public async findByContractId(contractId: string): Promise<UserContractLeaderboardRecord[]> {
        const entities = await this.table.findMany({
            where: {
                contractId
            }
        });

        return entities.map(UserContractLeaderboardRecord.createFromEntity);
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