import { GeneratedTokenEntity } from "@database/entities/GeneratedTokenEntity";
import { GeneratedTokenRecord } from "@database/records/GeneratedTokenRecord";
import { Repository } from "@database/repositories/Repository";
import { Prisma, PrismaClient } from "@prisma/client";

export class GeneratedTokensRepository extends Repository<Prisma.GeneratedTokenDelegate> {

    public constructor(prisma: PrismaClient) {
        super(prisma, prisma.generatedToken);
    }

    public async get(token: string): Promise<GeneratedTokenRecord | null> {
        const entity = await this.getEntity(token);

        if (!entity) {
            return null;
        }

        return new GeneratedTokenRecord(entity);
    }

    public async create(token: string, profileId: bigint): Promise<GeneratedTokenRecord> {
        const entity = await this.table
            .create({
                data: {
                    token,
                    profileId
                }
            });

        return new GeneratedTokenRecord(entity);
    }

    private async getEntity(token: string): Promise<GeneratedTokenEntity | null> {
        return this.table
            .findUnique({
                where: { token }
            });
    }
}