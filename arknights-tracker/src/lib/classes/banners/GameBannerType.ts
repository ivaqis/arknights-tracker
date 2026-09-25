export enum GameBannerType {
    CHAR_BEGINNER = "E_CharacterGachaPoolType_Beginner",
    CHAR_STANDARD = "E_CharacterGachaPoolType_Standard",
    CHAR_SPECIAL = "E_CharacterGachaPoolType_Special",
    CHAR_JOINT = "E_CharacterGachaPoolType_Joint",
    CHAR_RERUN = "E_CharacterGachaPoolType_Rerun",
    WEAPON = "Weapon",
    WEAPON_RERUN = "weapon_rerun",
}

export namespace GameBannerType {
    export type Char =
        | GameBannerType.CHAR_BEGINNER
        | GameBannerType.CHAR_STANDARD
        | GameBannerType.CHAR_SPECIAL
        | GameBannerType.CHAR_JOINT
        | GameBannerType.CHAR_RERUN;

    export function getByShortName(name: string): GameBannerType | null {
        switch (name) {
            case "new-player": return GameBannerType.CHAR_BEGINNER;
            case "standard": return GameBannerType.CHAR_STANDARD;
            case "special": return GameBannerType.CHAR_SPECIAL;
            case "joint": return GameBannerType.CHAR_JOINT;
            case "rerun": return GameBannerType.CHAR_RERUN;
            case "weapon": return GameBannerType.WEAPON;
            case "weapon_rerun": return GameBannerType.WEAPON_RERUN;

            default: return null;
        }
    }

    export function isGameBannerType(str: string): str is GameBannerType {
        return (getValues() as string[])
            .includes(str);
    }

    export function getValues(): GameBannerType[] {
        return Object.values(GameBannerType)
            .filter(value => typeof value === "string");
    }
}