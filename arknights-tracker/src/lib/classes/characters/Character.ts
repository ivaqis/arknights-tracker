import { CharacterClass } from "$lib/classes/characters/CharacterClass";
import { ElementType } from "$lib/classes/ElementType";
import { WeaponType } from "$lib/classes/weapons/WeaponType";
import { type CharacterData, characters } from "$lib/data/characters";
import { getMap } from "$lib/utils/collectionUtils";

export class Character {
    private static readonly characterById = getMap(Object.values(characters), (char) => char.id);
    private static readonly characterByName = getMap(Object.values(characters), (char) => char.name);
    private static readonly characterByGameId = getMap(Object.values(characters), (char) => char.gameId);

    private readonly _id: string;
    private readonly _name: string;
    private readonly _rarity: number;
    private readonly _element: ElementType;
    private readonly _class: CharacterClass;
    private readonly _weaponType: WeaponType;
    private readonly _birthDate: string | null;
    private readonly _gameId: string;
    private readonly _apiId: string | null;

    public constructor(data: CharacterData) {
        if (!ElementType.isElementType(data.element)) {
            throw new Error(`CharacterData.element is not ElementType: ${data.element}`);
        }

        if (!CharacterClass.isCharacterClass(data.class)) {
            throw new Error(`CharacterData.class is not CharacterClass: ${data.class}`);
        }

        if (!WeaponType.isWeaponType(data.weapon)) {
            throw new Error(`CharacterData.weapon is not WeaponType: ${data.weapon}`);
        }

        this._id = data.id;
        this._name = data.name;
        this._rarity = data.rarity;
        this._element = data.element;
        this._class = data.class;
        this._weaponType = data.weapon;
        this._birthDate = data.birthDate || null;
        this._gameId = data.gameId;
        this._apiId = data.apiId || null;
    }

    public static create(data: CharacterData | null | undefined): Character | null {
        if (!data) {
            return null;
        }

        return new Character(data);
    }

    public static getById(id: string): Character | null {
        const data = this.characterById.get(id);

        return this.create(data);
    }

    public static getByGameId(gameId: string): Character | null {
        const data = this.characterByGameId.get(gameId);

        return this.create(data);
    }

    public static getByName(name: string): Character | null {
        const data = this.characterByName.get(name);

        return this.create(data);
    }

    public get id(): string {
        return this._id;
    }

    public get name(): string {
        return this._name;
    }

    public get rarity(): number {
        return this._rarity;
    }

    public get element(): ElementType {
        return this._element;
    }

    public get class(): CharacterClass {
        return this._class;
    }

    public get weaponType(): WeaponType {
        return this._weaponType;
    }

    public get birthDate(): string | null {
        return this._birthDate;
    }

    public get gameId(): string {
        return this._gameId;
    }

    public get apiId(): string | null {
        return this._apiId;
    }
}