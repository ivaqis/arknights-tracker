import { Table } from "@database/tables/Table";
import { Prisma, PrismaClient } from "@prisma/client";

export class UsersTable extends Table<Prisma.UserDelegate> {
    public constructor(prisma: PrismaClient) {
        super(prisma, prisma.user);
    }
}