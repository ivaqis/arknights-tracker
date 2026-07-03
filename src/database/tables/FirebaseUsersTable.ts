import { Table } from "@database/tables/Table";
import { Prisma, PrismaClient } from "@prisma/client";

export class FirebaseUsersTable extends Table<Prisma.FirebaseUserDelegate> {
    public constructor(prisma: PrismaClient) {
        super(prisma, prisma.firebaseUser);
    }
}