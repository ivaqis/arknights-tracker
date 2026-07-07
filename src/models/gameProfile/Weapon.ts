import { logger } from "@/logger";
import { WeaponEntity } from "@models/gameProfile/entities/WeaponEntity";
import { Gem } from "@models/gameProfile/Gem";
import { IEntityClass } from "@models/IEntityClass";
import { WeaponData } from "@services/skportDetailFetcher/contracts/WeaponData";
import { weaponNameRecords } from "@staticModels/instances";

export class Weapon implements IEntityClass<WeaponEntity> {
    private readonly _id: string;
    private readonly _level: number;
    private readonly _refineLevel: number;
    private readonly _gem: Gem | null;

    private constructor(entity: { id: string, level: number, refineLevel: number }, gem: Gem | null) {
        this._id = entity.id;
        this._level = entity.level;
        this._refineLevel = entity.refineLevel;
        this._gem = gem;
    }

    public static getFromData(data?: WeaponData): Weapon | null {
        if (!data) {
            return null;
        }

        const id = weaponNameRecords.getId(data.weaponData.name);

        if (!id) {
            logger.warn(`weaponId not found:\n${data}`);

            return null;
        }

        return new Weapon(
            {
                id: id,
                level: data.level,
                refineLevel: data.refineLevel
            },
            Gem.getFromData(data.gem)
        );
    }

    public static getFromEntity(entity: WeaponEntity | null): Weapon | null {
        if (!entity) {
            return null;
        }

        return new Weapon(entity, Gem.getFromEntity(entity.gem));
    }

    public get id(): string {
        return this._id;
    }

    public get level(): number {
        return this._level;
    }

    public get refineLevel(): number {
        return this._refineLevel;
    }

    public get gem(): Gem | null {
        return this._gem;
    }

    public getEntity(): WeaponEntity {
        return {
            id: this._id,
            level: this._level,
            refineLevel: this._refineLevel,
            gem: this._gem?.getEntity() ?? null,
        };
    }
}