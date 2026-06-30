import { GlobalBannerTimelineEntity } from "@database/entities/GlobalBannerTimelineEntity";
import { GlobalBannerTimelineRecord } from "@database/records/GlobalBannerTimelineRecord";
import { Table } from "@database/tables/Table";
import { Prisma, PrismaClient } from "@prisma/client";

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
                pullsCount: { increment: record.pullsCount.delta }
            }
        });
    }

    public async getAllByBannerId(bannerId: string): Promise<GlobalBannerTimelineRecord[]> {
        const entities = await this.table
            .findMany({
                where: {
                    bannerId
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