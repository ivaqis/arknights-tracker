import { GlobalItemStatsRecord } from "@database/records/GlobalItemStatsRecord";
import { Table } from "@database/tables/Table";
import { Prisma, PrismaClient } from "@generated/prisma-v2";

export class GlobalItemStatsTable extends Table<Prisma.GlobalItemStatsDelegate> {

    public constructor(prisma: PrismaClient) {
        super(prisma, prisma.globalItemStats);
    }

    public async get(bannerId: string, itemId: string, rarity: number): Promise<GlobalItemStatsRecord> {
        const entity = await this.table.upsert({
            where: {
                bannerId_itemId: {
                    bannerId,
                    itemId
                }
            },
            create: {
                bannerId,
                itemId,
                rarity
            },
            update: {}
        });

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
        const entities = await this.table.findMany({
            where: {
                bannerId
            },
            orderBy: {
                count: "desc"
            }
        });

        return entities.map(entity => new GlobalItemStatsRecord(entity));
    }
}