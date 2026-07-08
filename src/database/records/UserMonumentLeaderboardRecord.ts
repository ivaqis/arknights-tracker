import { UserMonumentLeaderboardEntity } from "@database/entities/UserMonumentLeaderboardEntity";
import { MonumentRecord } from "@models/monument/MonumentRecord";

export class UserMonumentLeaderboardRecord {
    private readonly _gameUid: string;
    private readonly _dungeonId: string;
    private readonly _groupId: string;
    private readonly _isHard: boolean;
    private readonly _clearTimeSec: number;
    private readonly _updatedAt: Date;
    private readonly _data: MonumentRecord;

    private constructor(gameUid: string, dungeonId: string, groupId: string, isHard: boolean, clearTimeSec: number, updatedAt: Date, data: MonumentRecord) {
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
            entity.gameUid,
            entity.dungeonId,
            entity.groupId,
            entity.isHard,
            entity.clearTimeSec,
            entity.updatedAt,
            MonumentRecord.getFromEntity(JSON.parse(entity.data))!
        );
    }

    public static createFromData(data: MonumentRecord, gameUid: string): UserMonumentLeaderboardRecord {
        return new UserMonumentLeaderboardRecord(
            gameUid,
            data.dungeonId,
            data.groupId,
            data.isHard,
            data.passTS,
            new Date(),
            data
        );
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