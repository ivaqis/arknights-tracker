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

    export type EVENT =
        | DbBannerType.CHAR_SPECIAL
        | DbBannerType.CHAR_JOINT
        | DbBannerType.WEAPON_SPECIAL
        | DbBannerType.WEAPON_STANDARD;

    export function isDbBannerType(str: string): str is DbBannerType {
        return getValues()
            .includes(str);
    }

    export function isChar(bannerType: DbBannerType): bannerType is DbBannerType.CHAR {
        return bannerType === DbBannerType.CHAR_BEGINNER
            || bannerType === DbBannerType.CHAR_STANDARD
            || bannerType === DbBannerType.CHAR_SPECIAL
            || bannerType === DbBannerType.CHAR_JOINT;
    }

    export function isWeapon(bannerType: DbBannerType): bannerType is DbBannerType.WEAPON {
        return bannerType === DbBannerType.WEAPON_STANDARD
            || bannerType === DbBannerType.WEAPON_SPECIAL;
    }

    export function isEvent(bannerType: DbBannerType): bannerType is DbBannerType.EVENT {
        return bannerType === DbBannerType.CHAR_SPECIAL
            || bannerType === DbBannerType.CHAR_JOINT
            || bannerType === DbBannerType.WEAPON_SPECIAL
            || bannerType === DbBannerType.WEAPON_STANDARD;
    }

    export function getValues(): string[] {
        return Object.values(DbBannerType)
            .filter(value => typeof value === "string");
    }
}