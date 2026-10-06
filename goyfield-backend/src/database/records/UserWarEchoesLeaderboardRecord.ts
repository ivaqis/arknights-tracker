import { UserWarEchoesLeaderboardEntity } from "@database/entities/UserWarEchoesLeaderboardEntity.js";
import { WarEchoesRecord } from "@models/warEchoes/WarEchoesRecord.js";

export class UserWarEchoesLeaderboardRecord {
    private readonly _id: string;
    private readonly _userGroupId: string;
    private readonly _gameUid: string;
    private readonly _dungeonId: string;
    private readonly _groupId: string;
    private readonly _difficulty: string;
    private readonly _clearTimeSec: number;
    private readonly _updatedAt: Date;
    private readonly _data: WarEchoesRecord;

    private constructor(id: string, userGroupId: string, gameUid: string, dungeonId: string, groupId: string, difficulty: string, clearTimeSec: number, updatedAt: Date, data: WarEchoesRecord) {
        this._id = id;
        this._userGroupId = userGroupId;
        this._gameUid = gameUid;
        this._dungeonId = dungeonId;
        this._groupId = groupId;
        this._difficulty = difficulty;
        this._clearTimeSec = clearTimeSec;
        this._updatedAt = updatedAt;
        this._data = data;
    }

    public static createFromEntity(entity: UserWarEchoesLeaderboardEntity): UserWarEchoesLeaderboardRecord {
        return new UserWarEchoesLeaderboardRecord(
            entity.id,
            entity.userGroupId,
            entity.gameUid,
            entity.dungeonId,
            entity.groupId,
            entity.difficulty,
            entity.clearTimeSec,
            entity.updatedAt,
            WarEchoesRecord.getFromEntity(JSON.parse(entity.data))!
        );
    }

    public get id(): string {
        return this._id;
    }

    public get userGroupId(): string {
        return this._userGroupId;
    }

    public get gameUid(): string {
        return this._gameUid;
    }

    public get dungeonId(): string {
        return this._dungeonId;
    }

    public get groupId(): string {
        return this._groupId;
    }

    public get difficulty(): string {
        return this._difficulty;
    }

    public get clearTimeSec(): number {
        return this._clearTimeSec;
    }

    public get updatedAt(): Date {
        return this._updatedAt;
    }

    public get data(): WarEchoesRecord {
        return this._data;
    }

    public getStringData(): string {
        return JSON.stringify(this.data.getEntity());
    }
}
