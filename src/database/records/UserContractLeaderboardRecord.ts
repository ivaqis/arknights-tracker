import { UserContractLeaderboardEntity } from "@database/entities/UserContractLeaderboardEntity";
import { ContractRecord } from "@models/contingencyContract/ContractRecord";

export class UserContractLeaderboardRecord {
    private readonly _gameUid: string;
    private readonly _contractId: string;
    private readonly _recordId: string;
    private readonly _indicatorCount: number;
    private readonly _clearTimeSec: number;
    private readonly _updatedAt: Date;
    private readonly _data: ContractRecord;

    private constructor(gameUid: string, contractId: string, recordId: string, indicatorCount: number, clearTimeSec: number, updatedAt: Date, data: ContractRecord) {
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
            entity.gameUid,
            entity.contractId,
            entity.recordId,
            entity.indicatorCount,
            entity.clearTimeSec,
            entity.updatedAt,
            ContractRecord.getFromEntity(JSON.parse(entity.data), entity.recordId)
        );
    }

    public static createFromData(data: ContractRecord, gameUid: string): UserContractLeaderboardRecord {
        return new UserContractLeaderboardRecord(
            gameUid,
            data.contractId,
            data.id,
            data.indicatorCount,
            data.passTs,
            new Date(),
            data
        );
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
}