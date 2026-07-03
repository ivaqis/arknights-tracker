import { Table } from "@database/tables/Table";
import { Prisma, PrismaClient } from "@prisma/client";

export class UserContractLeaderboardsTable extends Table<Prisma.UserContractLeaderboardDelegate> {
    public constructor(prisma: PrismaClient) {
        super(prisma, prisma.userContractLeaderboard);
    }
}