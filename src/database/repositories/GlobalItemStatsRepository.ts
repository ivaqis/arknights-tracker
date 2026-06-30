import { GlobalItemStatsEntity } from "@database/entities/GlobalItemStatsEntity";
import { GlobalItemStatsRecord } from "@database/records/GlobalItemStatsRecord";
import { Repository } from "@database/repositories/Repository";
import { Prisma, PrismaClient } from "@prisma/client";

export class GlobalItemStatsRepository extends Repository<Prisma.GlobalItemStatsDelegate> {

    public constructor(prisma: PrismaClient) {
        super(prisma, prisma.globalItemStats);
    }

    public async get(bannerId: string, itemId: string): Promise<GlobalItemStatsRecord> {
        const entity = await this.getEntity(bannerId, itemId);

        return new GlobalItemStatsRecord(entity);
    }

    public async update(record: GlobalItemStatsRecord) {
        await this.table.update({
            where: {
                bannerId_itemId: {
                    bannerId: record.bannerId,
                    itemId: record.itemId
                }
            },
            data: {
                count: { increment: record.count.delta }
            }
        });
    }

    public async getAllByBannerId(bannerId: string): Promise<GlobalItemStatsRecord[]> {
        const entities = await this.table
            .findMany({
                where: {
                    bannerId
                }
            });

        return entities.map(entity => new GlobalItemStatsRecord(entity));
    }

    private async getEntity(bannerId: string, itemId: string): Promise<GlobalItemStatsEntity> {
        return this.table.upsert({
            where: {
                bannerId_itemId: {
                    bannerId,
                    itemId
                }
            },
            create: {
                bannerId,
                itemId
            },
            update: {}
        });
    }
}