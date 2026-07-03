import { Table } from "@database/tables/Table";
import { Prisma, PrismaClient } from "@prisma/client";

export class UserGameProfilesTable extends Table<Prisma.UserGameProfileDelegate> {
    public constructor(prisma: PrismaClient) {
        super(prisma, prisma.userGameProfile);
    }
}