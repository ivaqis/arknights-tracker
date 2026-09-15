export enum DbBannerType {
    CHAR_BEGINNER = "new-player",
    CHAR_STANDARD = "standard",
    CHAR_SPECIAL = "special",
    CHAR_JOINT = "joint",
    CHAR_RERUN = "rerun",
    WEAPON_STANDARD = "weap-standard",
    WEAPON_SPECIAL = "weap-special",
    WEAPON_RERUN = "weapon_rerun",
}

export namespace DbBannerType {
    export type CHAR =
        | DbBannerType.CHAR_BEGINNER
        | DbBannerType.CHAR_STANDARD
        | DbBannerType.CHAR_SPECIAL
        | DbBannerType.CHAR_JOINT
        | DbBannerType.CHAR_RERUN;

    export type WEAPON =
        | DbBannerType.WEAPON_SPECIAL
        | DbBannerType.WEAPON_STANDARD
        | DbBannerType.WEAPON_RERUN;

    export type EVENT =
        | DbBannerType.CHAR_SPECIAL
        | DbBannerType.CHAR_JOINT
        | DbBannerType.CHAR_RERUN
        | DbBannerType.WEAPON_SPECIAL
        | DbBannerType.WEAPON_STANDARD
        | DbBannerType.WEAPON_RERUN;

    export function isDbBannerType(str: string): str is DbBannerType {
        return getValues()
            .includes(str);
    }

    export function isChar(bannerType: DbBannerType): bannerType is DbBannerType.CHAR {
        return bannerType === DbBannerType.CHAR_BEGINNER
            || bannerType === DbBannerType.CHAR_STANDARD
            || bannerType === DbBannerType.CHAR_SPECIAL
            || bannerType === DbBannerType.CHAR_JOINT
            || bannerType === DbBannerType.CHAR_RERUN;
    }

    export function isWeapon(bannerType: DbBannerType): bannerType is DbBannerType.WEAPON {
        return bannerType === DbBannerType.WEAPON_STANDARD
            || bannerType === DbBannerType.WEAPON_SPECIAL
            || bannerType === DbBannerType.WEAPON_RERUN;
    }

    export function isEvent(bannerType: DbBannerType): bannerType is DbBannerType.EVENT {
        return bannerType === DbBannerType.CHAR_SPECIAL
            || bannerType === DbBannerType.CHAR_JOINT
            || bannerType === DbBannerType.CHAR_RERUN
            || bannerType === DbBannerType.WEAPON_SPECIAL
            || bannerType === DbBannerType.WEAPON_STANDARD
            || bannerType === DbBannerType.WEAPON_RERUN;
    }

    export function getValues(): string[] {
        return Object.values(DbBannerType)
            .filter(value => typeof value === "string");
    }
}