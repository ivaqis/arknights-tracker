import { ContractCharacter } from "@models/contingencyContract/ContractCharacter.js";
import { ContractLeaderboardWeapon } from "@models/contractLeaderboard/ContractLeaderboardWeapon.js";
import { ContractLeaderboardCharEntity } from "@models/contractLeaderboard/entities/ContractLeaderboardCharEntity.js";
import { IEntityClass } from "@models/IEntityClass.js";

export class ContractLeaderboardChar implements IEntityClass<ContractLeaderboardCharEntity> {
    private readonly _id: string;
    private readonly _level: number;
    private readonly _potentialLevel: number;
    private readonly _weapon: ContractLeaderboardWeapon | null;

    private constructor(id: string, level: number, potentialLevel: number, weapon: ContractLeaderboardWeapon | null) {
        this._id = id;
        this._level = level;
        this._potentialLevel = potentialLevel;
        this._weapon = weapon;
    }

    public static createFromEntity(entity: ContractLeaderboardCharEntity): ContractLeaderboardChar {
        return new ContractLeaderboardChar(
            entity.id,
            entity.level,
            entity.potentialLevel,
            ContractLeaderboardWeapon.createFromEntity(entity.weapon)
        );
    }

    public static createFromRecord(data: ContractCharacter): ContractLeaderboardChar {
        return new ContractLeaderboardChar(
            data.id,
            data.level,
            data.potentialLevel,
            ContractLeaderboardWeapon.createFromRecord(data.weapon)
        );
    }

    public getEntity(): ContractLeaderboardCharEntity {
        return {
            id: this._id,
            level: this._level,
            potentialLevel: this._potentialLevel,
            weapon: this._weapon?.getEntity() ?? null
        };
    }
}