import { weaponByGameId, weaponById, weaponByName } from "$lib/data/mappings/weaponMappings";
import type { WeaponData } from "$lib/data/weapons";
import { WeaponType } from "$lib/data/WeaponType";

export class Weapon {
    private readonly _id: string;
    private readonly _gameId: string;
    private readonly _name: string;
    private readonly _rarity: number;
    private readonly _weapon: WeaponType;
    private readonly _skills: readonly string[];

    private constructor(data: WeaponData) {
        if (!WeaponType.isWeaponType(data.weapon)) {
            throw new Error(`WeaponData.weapon is not WeaponType: ${data.weapon}`);
        }

        this._id = data.id;
        this._gameId = data.gameId;
        this._name = data.name;
        this._rarity = data.rarity;
        this._weapon = data.weapon;
        this._skills = data.skills;
    }

    public static create(data: WeaponData | null | undefined): Weapon | null {
        if (!data) {
            return null;
        }

        return new Weapon(data);
    }

    public static getById(id: string): Weapon | null {
        const data = weaponById.get(id);

        return this.create(data);
    }

    public static getByGameId(gameId: string): Weapon | null {
        const data = weaponByGameId.get(gameId);

        return this.create(data);
    }

    public static getByName(name: string): Weapon | null {
        const data = weaponByName.get(name);

        return this.create(data);
    }

    public get id(): string {
        return this._id;
    }

    public get gameId(): string {
        return this._gameId;
    }

    public get name(): string {
        return this._name;
    }

    public get rarity(): number {
        return this._rarity;
    }

    public get weaponType(): WeaponType {
        return this._weapon;
    }

    public get skills(): readonly string[] {
        return this._skills;
    }
}