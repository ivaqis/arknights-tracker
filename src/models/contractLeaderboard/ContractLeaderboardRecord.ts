import { ContractRecord } from "@models/contingencyContract/ContractRecord";
import { ContractLeaderboardChar } from "@models/contractLeaderboard/ContractLeaderboardChar";
import { ContractLeaderboardRecordEntity } from "@models/contractLeaderboard/entities/ContractLeaderboardRecordEntity";
import { IEntityClass } from "@models/IEntityClass";

export class ContractLeaderboardRecord implements IEntityClass<ContractLeaderboardRecordEntity> {
    private readonly _recordId: string;
    private readonly _uid: string;
    private readonly _avatarId: string | null;
    private readonly _level: number;
    private readonly _serverId: string;
    private readonly _indicatorCount: number;
    private readonly _ts: string;
    private readonly _passTs: number;
    private readonly _chars: ContractLeaderboardChar[];

    private constructor(recordId: string, uid: string, avatarId: string | null, level: number, serverId: string, indicatorCount: number, ts: string, passTs: number, chars: ContractLeaderboardChar[]) {
        this._recordId = recordId;
        this._uid = uid;
        this._avatarId = avatarId;
        this._level = level;
        this._serverId = serverId;
        this._indicatorCount = indicatorCount;
        this._ts = ts;
        this._passTs = passTs;
        this._chars = chars;
    }

    public static createFromEntity(entity: ContractLeaderboardRecordEntity): ContractLeaderboardRecord {
        return new ContractLeaderboardRecord(
            entity.recordId,
            entity.uid,
            entity.avatarId,
            entity.level,
            entity.serverId,
            entity.indicatorCount,
            entity.ts,
            entity.passTs,
            entity.chars.map(ContractLeaderboardChar.createFromEntity)
        );
    }

    public static createFromRecord(profile: { uid: string; avatarId: string | null },
                                   gameProfile: { level: number, serverId: string },
                                   record: ContractRecord
    ): ContractLeaderboardRecord {
        return new ContractLeaderboardRecord(
            record.id,
            profile.uid,
            profile.avatarId,
            gameProfile.level,
            gameProfile.serverId,
            record.indicatorCount,
            record.ts,
            record.passTs,
            record.chars.map(ContractLeaderboardChar.createFromRecord)
        );
    }

    public getEntity(): ContractLeaderboardRecordEntity {
        return {
            recordId: this._recordId,
            uid: this._uid,
            avatarId: this._avatarId,
            level: this._level,
            serverId: this._serverId,
            indicatorCount: this._indicatorCount,
            ts: this._ts,
            passTs: this._passTs,
            chars: this._chars.map(char => char.getEntity())
        };
    }
}