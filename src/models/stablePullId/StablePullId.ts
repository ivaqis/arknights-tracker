import { logger } from "@/logger";
import { Pull } from "@models/pulls/Pull";
import { StablePull } from "@models/stablePullId/StablePull";
import { createHash } from "node:crypto";

export class StablePullId {
    public static readonly ID_PREFIX = "pid_";

    private readonly _id: string;
    private readonly _period: number;

    private constructor(id: string, period: number) {
        this._id = id;
        this._period = period;

        logger.debug(`[StablePullId] Created id: period: ${period} id: ${id}`);
    }

    public static create(periodNumber: number, pulls: Pull[]): StablePullId {
        return new StablePullId(
            this.createId(pulls.map(p => p.getStablePull())),
            periodNumber,
        );
    }

    private static createId(pulls: StablePull[]): string {
        const str = JSON.stringify(pulls);

        const hash = createHash("sha256").update(str).digest("hex");

        return `${this.ID_PREFIX}${hash}`;
    }

    public get id(): string {
        return this._id;
    }

    public get period(): number {
        return this._period;
    }
}