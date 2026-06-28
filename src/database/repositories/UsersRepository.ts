import { Repository } from "@database/repositories/Repository";
import { Prisma, PrismaClient } from "@prisma/client";

export class UsersRepository extends Repository<Prisma.UserDelegate> {

    public constructor(prisma: PrismaClient) {
        super(prisma, prisma.user);
    }
}