import { logger } from "@/logger";
import { WeaponEntity } from "@models/gameProfile/entities/WeaponEntity";
import { Gem } from "@models/gameProfile/Gem";
import { IEntityClass } from "@models/IEntityClass";
import { WeaponData } from "@services/skportDetailFetcher/contracts/WeaponData";
import { weaponNameRecords } from "@staticModels/instances";

export class Weapon implements IEntityClass<WeaponEntity> {
    private readonly _id: string;
    private readonly _level: number;
    private readonly _breakthroughLevel: number;
    private readonly _gem: Gem | null;

    public constructor(entity: WeaponData) {
        let id = weaponNameRecords.getId(entity.weaponData.name);

        if (!id) {
            throw new Error(`weaponId not found:\n${entity}`)
        }

        this._id = id;
        this._level = entity.level;
        this._breakthroughLevel = entity.breakthroughLevel;
        this._gem = Gem.get(entity.gem);
    }

    public get id(): string {
        return this._id;
    }

    public get level(): number {
        return this._level;
    }

    public get breakthroughLevel(): number {
        return this._breakthroughLevel;
    }

    public get gem(): Gem | null {
        return this._gem;
    }

    public static get(entity?: WeaponData): Weapon | null {
        if (!entity) {
            return null;
        }

        let weapon: Weapon;
        try {
            weapon = new Weapon(entity);
        } catch (e) {
            logger.warn(e);

            return null;
        }

        return weapon;
    }

    public getEntity(): WeaponEntity {
        return {
            id: this._id,
            level: this._level,
            breakthroughLevel: this._breakthroughLevel,
            gem: this._gem?.getEntity() ?? null,
        }
    }
}