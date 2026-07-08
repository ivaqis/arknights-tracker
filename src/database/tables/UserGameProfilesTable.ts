import { UserGameProfileRecord } from "@database/records/UserGameProfileRecord";
import { Table } from "@database/tables/Table";
import { Prisma, PrismaClient } from "@prisma/client";

export class UserGameProfilesTable extends Table<Prisma.UserGameProfileDelegate> {
    public constructor(prisma: PrismaClient) {
        super(prisma, prisma.userGameProfile);
    }

    public async find(gameUid: string): Promise<UserGameProfileRecord | null> {
        const entity = await this.table.findUnique({
            where: {
                gameUid: gameUid,
            }
        });

        if (!entity) {
            return null;
        }

        return new UserGameProfileRecord(entity);
    }

    public async findByUid(uid: bigint): Promise<UserGameProfileRecord[]> {
        const entities = await this.table.findMany({
            where: {
                uid: uid,
            }
        });

        return entities.map(entity => new UserGameProfileRecord(entity));
    }

    public async delete(gameUid: string): Promise<void> {
        await this.table.delete({
            where: {
                gameUid: gameUid,
            }
        });
    }

    public async deleteByUid(uid: bigint): Promise<void> {
        await this.table.deleteMany({
            where: {
                uid: uid,
            }
        });
    }
}