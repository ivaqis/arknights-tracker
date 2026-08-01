import { GlobalPityDistributionEntity } from "@database/entities/GlobalPityDistributionEntity";
import { GlobalPityDistributionRecord } from "@database/records/GlobalPityDistributionRecord";
import { Table } from "@database/tables/Table";
import { Prisma, PrismaClient } from "@prisma/client";

export class GlobalPityDistributionsTable extends Table<Prisma.GlobalPityDistributionDelegate> {

    public constructor(prisma: PrismaClient) {
        super(prisma, prisma.globalPityDistribution);
    }

    public async get(bannerId: string, pity: number, rarity: number): Promise<GlobalPityDistributionRecord> {
        const entity = await this.getEntity(bannerId, pity, rarity);

        return new GlobalPityDistributionRecord(entity);
    }

    public async update(record: GlobalPityDistributionRecord) {
        await this.table.update({
            where: {
                bannerId_pity_rarity: {
                    bannerId: record.bannerId,
                    pity: record.pity,
                    rarity: record.rarity
                }
            },
            data: {
                count: { increment: record.count.delta }
            }
        });
    }

    public async getAllByBannerId(bannerId: string): Promise<GlobalPityDistributionRecord[]> {
        const entities = await this.table.findMany({
            where: {
                bannerId
            },
            orderBy: {
                pity: "asc"
            }
        });

        return entities.map(entity => new GlobalPityDistributionRecord(entity));
    }

    private async getEntity(bannerId: string, pity: number, rarity: number): Promise<GlobalPityDistributionEntity> {
        return this.table.upsert({
            where: {
                bannerId_pity_rarity: {
                    bannerId,
                    pity,
                    rarity
                }
            },
            create: {
                bannerId,
                pity,
                rarity
            },
            update: {}
        });
    }
}