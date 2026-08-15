export enum ApiBannerType {
    CHAR_BEGINNER = "new-player",
    CHAR_STANDARD = "standard",
    CHAR_SPECIAL = "special",
    CHAR_JOINT = "joint",
    WEAPON_STANDARD = "weap-standard",
    WEAPON_SPECIAL = "weap-special"
}

export namespace ApiBannerType {
    export type Char =
        | ApiBannerType.CHAR_BEGINNER
        | ApiBannerType.CHAR_STANDARD
        | ApiBannerType.CHAR_SPECIAL
        | ApiBannerType.CHAR_JOINT;

    export type Weapon =
        | ApiBannerType.WEAPON_SPECIAL
        | ApiBannerType.WEAPON_STANDARD;

    export type Event =
        | ApiBannerType.CHAR_SPECIAL
        | ApiBannerType.CHAR_JOINT
        | ApiBannerType.WEAPON_SPECIAL
        | ApiBannerType.WEAPON_STANDARD;

    export function isApiBannerType(str: string): str is ApiBannerType {
        return (getValues() as string[])
            .includes(str);
    }

    export function isChar(bannerType: ApiBannerType): bannerType is ApiBannerType.Char {
        return bannerType === ApiBannerType.CHAR_BEGINNER
            || bannerType === ApiBannerType.CHAR_STANDARD
            || bannerType === ApiBannerType.CHAR_SPECIAL
            || bannerType === ApiBannerType.CHAR_JOINT;
    }

    export function isWeapon(bannerType: ApiBannerType): bannerType is ApiBannerType.Weapon {
        return bannerType === ApiBannerType.WEAPON_STANDARD
            || bannerType === ApiBannerType.WEAPON_SPECIAL;
    }

    export function isEvent(bannerType: ApiBannerType): bannerType is ApiBannerType.Event {
        return bannerType === ApiBannerType.CHAR_SPECIAL
            || bannerType === ApiBannerType.CHAR_JOINT
            || bannerType === ApiBannerType.WEAPON_SPECIAL
            || bannerType === ApiBannerType.WEAPON_STANDARD;
    }

    export function getValues(): ApiBannerType[] {
        return Object.values(ApiBannerType)
            .filter(value => typeof value === "string");
    }
}