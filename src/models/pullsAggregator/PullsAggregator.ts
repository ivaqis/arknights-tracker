import { Database } from "@database/Database";

export class PullsAggregator {
    public static readonly LAST_PULLS_OFFSET_MS = 10 * 24 * 60 * 60 * 1000; // 10 days

    private readonly _database: Database;

    public constructor(database: Database) {
        this._database = database;
    }

    public static getStableTsWithOffset(ts: number): number {
        const tsOffset = ts - this.LAST_PULLS_OFFSET_MS;

        if (tsOffset <= 0) {
            return tsOffset;
        }

        return this.getFirstStableTs(tsOffset);
    }

    public static getFirstStableTs(ts: number): number {
        const date = new Date(ts);

        const day = date.getUTCDate();
        const month = date.getUTCMonth();
        const year = date.getUTCFullYear();

        let newDay;

        if (day <= 10) {
            newDay = 1;
        } else if (day <= 20) {
            newDay = 11;
        } else {
            newDay = 21;
        }

        return Date.UTC(year, month, newDay);
    }
}