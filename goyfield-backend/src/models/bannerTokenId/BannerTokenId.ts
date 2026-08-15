import { logger } from "@/logger.js";
import { createHash } from "node:crypto";

export class BannerTokenId {
    public static readonly ID_PREFIX = "tid_";

    private readonly _id: string;

    private constructor(id: string) {
        this._id = id;

        logger.debug(`[BannerTokenId] Created id: ${id}`);
    }

    public static create(token: string): BannerTokenId {
        return new BannerTokenId(
            this.createId(token)
        );
    }

    private static createId(token: string): string {
        const hash = createHash("sha256").update(token).digest("hex");

        return `${this.ID_PREFIX}${hash}`;
    }

    public get id(): string {
        return this._id;
    }
}