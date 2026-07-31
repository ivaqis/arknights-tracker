import { Database } from "@database/Database";
import { BannersPulls } from "@models/pulls/BannersPulls";
import { UserPullsUpdater } from "@models/pullsAggregator/UserPullsUpdater";

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