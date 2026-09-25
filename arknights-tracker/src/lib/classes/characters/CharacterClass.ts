export enum CharacterClass {
    GUARD = "guard",
    CASTER = "caster",
    SUPPORTER = "supporter",
    DEFENDER = "defender",
    STRIKER = "striker",
    VANGUARD = "vanguard",
}

export namespace CharacterClass {
    export function isCharacterClass(str: string): str is CharacterClass {
        return getList().some(item => item === str);
    }

    export function getList(): CharacterClass[] {
        return Object.values(CharacterClass)
            .filter(item => typeof item === "string");
    }
}