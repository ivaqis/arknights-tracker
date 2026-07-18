import { ContractWeapon } from "@models/contingencyContract/ContractWeapon";
import { ContractLeaderboardWeaponEntity } from "@models/contractLeaderboard/entities/ContractLeaderboardWeaponEntity";
import { IEntityClass } from "@models/IEntityClass";

export class ContractLeaderboardWeapon implements IEntityClass<ContractLeaderboardWeaponEntity> {
    private readonly _id: string;
    private readonly _level: number;
    private readonly _refineLevel: number;

    private constructor(id: string, level: number, potentialLevel: number) {
        this._id = id;
        this._level = level;
        this._refineLevel = potentialLevel;
    }

    public static createFromEntity(entity?: ContractLeaderboardWeaponEntity | null): ContractLeaderboardWeapon | null {
        if (!entity) {
            return null;
        }

        return new ContractLeaderboardWeapon(
            entity.id,
            entity.level,
            entity.refineLevel
        );
    }

    public static createFromRecord(data?: ContractWeapon | null): ContractLeaderboardWeapon | null {
        if (!data) {
            return null;
        }

        return new ContractLeaderboardWeapon(
            data.id,
            data.level,
            data.refineLevel
        );
    }

    public getEntity(): ContractLeaderboardWeaponEntity {
        return {
            id: this._id,
            level: this._level,
            refineLevel: this._refineLevel
        };
    }
}