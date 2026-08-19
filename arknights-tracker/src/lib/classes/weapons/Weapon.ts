import { ApiBannerType } from "$lib/classes/banners/ApiBannerType";
import type { ITextable } from "$lib/classes/ITextable";
import { WeaponType } from "$lib/classes/weapons/WeaponType";
import { type WeaponData, weapons } from "$lib/data/weapons";
import { getMap } from "$lib/utils/collectionUtils";

export class Weapon implements ITextable {
    private static readonly weaponById = getMap(Object.values(weapons), item => item.id);
    private static readonly weaponByGameId = getMap(Object.values(weapons), item => item.gameId);
    private static readonly weaponByName = getMap(Object.values(weapons), item => item.name);

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
        const data = this.weaponById.get(id);

        return this.create(data);
    }

    public static getByGameId(gameId: string): Weapon | null {
        const data = this.weaponByGameId.get(gameId);

        return this.create(data);
    }

    public static getByName(name: string): Weapon | null {
        const data = this.weaponByName.get(name);

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

    public get type(): WeaponType {
        return this._weapon;
    }

    public get skills(): readonly string[] {
        return this._skills;
    }

    public get i18nKey(): string {
        return `weaponsList.${this._id}`;
    }
}