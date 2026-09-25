import { PrismaClient } from "@generated/prisma-v2/index.js";

export abstract class Repository {
    private readonly _prisma: PrismaClient;

    protected constructor(prisma: PrismaClient) {
        this._prisma = prisma;
    }

    protected get prisma(): PrismaClient {
        return this._prisma;
    }
}