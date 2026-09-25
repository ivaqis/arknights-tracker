import { Database } from "@database/Database.js";
import { BannersPulls } from "@models/pulls/BannersPulls.js";
import { UserPullsUpdater } from "@models/pullsAggregator/UserPullsUpdater.js";

export class PullsAggregator {
    private readonly _database: Database;

    public constructor(database: Database) {
        this._database = database;
    }

    public async update(profileId: bigint, pulls: BannersPulls): Promise<void> {
        const updater = new UserPullsUpdater(this._database, profileId, pulls);

        await updater.execute();
    }
}