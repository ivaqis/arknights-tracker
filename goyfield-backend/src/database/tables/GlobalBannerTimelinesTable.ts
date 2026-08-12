import { GlobalBannerTimelineEntity } from "@database/entities/GlobalBannerTimelineEntity.js";
import { GlobalBannerTimelineRecord } from "@database/records/GlobalBannerTimelineRecord.js";
import { Table } from "@database/tables/Table.js";
import { Prisma, PrismaClient } from "@generated/prisma-v2/index.js";

export class GlobalBannerTimelinesTable extends Table<Prisma.GlobalBannerTimelineDelegate> {

    public constructor(prisma: PrismaClient) {
        super(prisma, prisma.globalBannerTimeline);
    }

    public async get(bannerId: string, date: string): Promise<GlobalBannerTimelineRecord> {
        const entity = await this.getEntity(bannerId, date);

        return new GlobalBannerTimelineRecord(entity);
    }

    public async update(record: GlobalBannerTimelineRecord) {
        await this.table.update({
            where: {
                bannerId_date: {
                    bannerId: record.bannerId,
                    date: record.date
                }
            },
            data: {
                totalPullsCount: { increment: record.totalPullsCount.delta },
                freePullsCount: { increment: record.freePullsCount.delta },
            }
        });
    }

    public async getAllByBannerId(bannerId: string): Promise<GlobalBannerTimelineRecord[]> {
        const entities = await this.table.findMany({
            where: {
                bannerId
            },
            orderBy: {
                date: "asc"
            }
        });

        return entities.map(entity => new GlobalBannerTimelineRecord(entity));
    }

    private async getEntity(bannerId: string, date: string): Promise<GlobalBannerTimelineEntity> {
        return this.table.upsert({
            where: {
                bannerId_date: {
                    bannerId,
                    date
                }
            },
            create: {
                bannerId,
                date
            },
            update: {}
        });
    }
}