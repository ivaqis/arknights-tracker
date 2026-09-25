import { UserMonumentLeaderboardEntity } from "@database/entities/UserMonumentLeaderboardEntity.js";
import { MonumentRecord } from "@models/monument/MonumentRecord.js";

export class UserMonumentLeaderboardRecord {
    private readonly _id: string;
    private readonly _userGroupId: string;
    private readonly _gameUid: string;
    private readonly _dungeonId: string;
    private readonly _groupId: string;
    private readonly _isHard: boolean;
    private readonly _clearTimeSec: number;
    private readonly _updatedAt: Date;
    private readonly _data: MonumentRecord;


    private constructor(id: string, userGroupId: string, gameUid: string, dungeonId: string, groupId: string, isHard: boolean, clearTimeSec: number, updatedAt: Date, data: MonumentRecord) {
        this._id = id;
        this._userGroupId = userGroupId;
        this._gameUid = gameUid;
        this._dungeonId = dungeonId;
        this._groupId = groupId;
        this._isHard = isHard;
        this._clearTimeSec = clearTimeSec;
        this._updatedAt = updatedAt;
        this._data = data;
    }

    public static createFromEntity(entity: UserMonumentLeaderboardEntity): UserMonumentLeaderboardRecord {
        return new UserMonumentLeaderboardRecord(
            entity.id,
            entity.userGroupId,
            entity.gameUid,
            entity.dungeonId,
            entity.groupId,
            entity.isHard,
            entity.clearTimeSec,
            entity.updatedAt,
            MonumentRecord.getFromEntity(JSON.parse(entity.data))!
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

    public get isHard(): boolean {
        return this._isHard;
    }

    public get clearTimeSec(): number {
        return this._clearTimeSec;
    }

    public get updatedAt(): Date {
        return this._updatedAt;
    }

    public get data(): MonumentRecord {
        return this._data;
    }

    public getStringData(): string {
        return JSON.stringify(this.data.getEntity());
    }
}