import { GlobalBannerStatsEntity } from "@database/entities/GlobalBannerStatsEntity";
import { GlobalBannerStatsRecord } from "@database/records/GlobalBannerStatsRecord";
import { Table } from "@database/tables/Table";
import { Prisma, PrismaClient } from "@prisma/client";

export class GlobalBannerStatsTable extends Table<Prisma.GlobalBannerStatsDelegate> {

    public constructor(prisma: PrismaClient) {
        super(prisma, prisma.globalBannerStats);
    }

    public async get(bannerId: string): Promise<GlobalBannerStatsRecord> {
        const entity = await this.getEntity(bannerId);

        return new GlobalBannerStatsRecord(entity);
    }

    public async update(record: GlobalBannerStatsRecord) {
        await this.table.update({
            where: {
                bannerId: record.bannerId
            },
            data: {
                totalUsers: { increment: record.totalUsers.delta },
                unfreePulls: { increment: record.unfreePulls.delta },
                total6: { increment: record.total6.delta },
                total5: { increment: record.total5.delta },
                won5050: { increment: record.won5050.delta },
                total5050: { increment: record.total5050.delta },
                freePulls: { increment: record.freePulls.delta },
                free6: { increment: record.free6.delta },
                free5: { increment: record.free5.delta },
                freeWin5050: { increment: record.freeWin5050.delta }
            }
        });
    }

    private async getEntity(bannerId: string): Promise<GlobalBannerStatsEntity> {
        return this.table.upsert({
            where: {
                bannerId
            },
            create: {
                bannerId
            },
            update: {}
        });
    }
}