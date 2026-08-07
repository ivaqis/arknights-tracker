import { UserContractLeaderboardEntity } from "@database/entities/UserContractLeaderboardEntity.js";
import { ContractRecord } from "@models/contingencyContract/ContractRecord.js";

export class UserContractLeaderboardRecord {
    private readonly _id: string;
    private readonly _gameUid: string;
    private readonly _contractId: string;
    private readonly _recordId: string;
    private readonly _indicatorCount: number;
    private readonly _clearTimeSec: number;
    private readonly _updatedAt: Date;
    private readonly _data: ContractRecord;

    private constructor(id: string, gameUid: string, contractId: string, recordId: string, indicatorCount: number, clearTimeSec: number, updatedAt: Date, data: ContractRecord) {
        this._id = id;
        this._gameUid = gameUid;
        this._contractId = contractId;
        this._recordId = recordId;
        this._indicatorCount = indicatorCount;
        this._clearTimeSec = clearTimeSec;
        this._updatedAt = updatedAt;
        this._data = data;
    }

    public static createFromEntity(entity: UserContractLeaderboardEntity): UserContractLeaderboardRecord {
        return new UserContractLeaderboardRecord(
            entity.id,
            entity.gameUid,
            entity.contractId,
            entity.recordId,
            entity.indicatorCount,
            entity.clearTimeSec,
            entity.updatedAt,
            ContractRecord.getFromEntity(JSON.parse(entity.data))
        );
    }

    public get id(): string {
        return this._id;
    }

    public get data(): ContractRecord {
        return this._data;
    }

    public get gameUid(): string {
        return this._gameUid;
    }

    public get contractId(): string {
        return this._contractId;
    }

    public get recordId(): string {
        return this._recordId;
    }

    public get indicatorCount(): number {
        return this._indicatorCount;
    }

    public get clearTimeSec(): number {
        return this._clearTimeSec;
    }

    public get updatedAt(): Date {
        return this._updatedAt;
    }

    public getStringData(): string {
        return JSON.stringify(this.data.getEntity());
    }
}