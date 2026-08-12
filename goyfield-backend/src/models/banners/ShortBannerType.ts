export enum ShortBannerType {
    CHAR_BEGINNER = "new-player",
    CHAR_STANDARD = "standard",
    CHAR_SPECIAL = "special",
    CHAR_JOINT = "joint",
    WEAPON = "weapon"
}

export namespace ShortBannerType {
    export function isShortBannerType(str: string): str is ShortBannerType {
        return str === ShortBannerType.CHAR_BEGINNER
            || str === ShortBannerType.CHAR_STANDARD
            || str === ShortBannerType.CHAR_SPECIAL
            || str === ShortBannerType.CHAR_JOINT
            || str === ShortBannerType.WEAPON;
    }
}