export enum WeaponType {
    SWORD = "sword",
    POLEARM = "polearm",
    GREAT_SWORD = "greatSword",
    HANDCANNON = "handcannon",
    ARTS_UNIT = "artsUnit"
}

export namespace WeaponType {
    export function isWeaponType(str: string): str is WeaponType {
        return getList().some(item => item === str);
    }

    export function getList(): WeaponType[] {
        return Object.values(WeaponType)
            .filter(item => typeof item === "string");
    }
}