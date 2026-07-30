export enum DbBannerType {
    CHAR_BEGINNER = "new-player",
    CHAR_STANDARD = "standard",
    CHAR_SPECIAL = "special",
    CHAR_JOINT = "joint",
    WEAPON_STANDARD = "weap-standard",
    WEAPON_SPECIAL = "weap-special"
}

export namespace DbBannerType {
    export type CHAR =
        | DbBannerType.CHAR_BEGINNER
        | DbBannerType.CHAR_STANDARD
        | DbBannerType.CHAR_SPECIAL
        | DbBannerType.CHAR_JOINT;

    export type WEAPON =
        | DbBannerType.WEAPON_SPECIAL
        | DbBannerType.WEAPON_STANDARD;

    export function isDbBannerType(str: string): str is DbBannerType {
        return getValues()
            .includes(str);
    }

    export function getValues(): string[] {
        return Object.values(DbBannerType)
            .filter(value => typeof value === "string");
    }
}