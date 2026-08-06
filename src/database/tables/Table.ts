import { PrismaClient } from "@generated/prisma-v2";

export abstract class Table<Delegate> {
    private readonly _prismaClient: PrismaClient;
    private readonly _delegate: Delegate;

    protected constructor(prismaClient: PrismaClient, delegate: Delegate) {
        this._prismaClient = prismaClient;
        this._delegate = delegate;
    }

    protected get prisma() {
        return this._prismaClient;
    }

    protected get table() {
        return this._delegate;
    }
}