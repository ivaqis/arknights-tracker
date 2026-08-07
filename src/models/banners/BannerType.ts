import { DbBannerType } from "@models/banners/DbBannerType.js";
import { ShortBannerType } from "@models/banners/ShortBannerType.js";

export enum BannerType {
    CHAR_BEGINNER = "E_CharacterGachaPoolType_Beginner",
    CHAR_STANDARD = "E_CharacterGachaPoolType_Standard",
    CHAR_SPECIAL = "E_CharacterGachaPoolType_Special",
    CHAR_JOINT = "E_CharacterGachaPoolType_Joint",
    WEAPON = "Weapon"
}

export namespace BannerType {
    export type CHAR =
        | BannerType.CHAR_BEGINNER
        | BannerType.CHAR_STANDARD
        | BannerType.CHAR_SPECIAL
        | BannerType.CHAR_JOINT;

    export function getShortBannerTypeName(bannerType: BannerType): ShortBannerType {
        switch (bannerType) {
            case BannerType.CHAR_BEGINNER: return ShortBannerType.CHAR_BEGINNER;
            case BannerType.CHAR_STANDARD: return ShortBannerType.CHAR_STANDARD;
            case BannerType.CHAR_SPECIAL: return ShortBannerType.CHAR_SPECIAL;
            case BannerType.CHAR_JOINT: return ShortBannerType.CHAR_JOINT;
            case BannerType.WEAPON: return ShortBannerType.WEAPON;
        }
    }

    export function getBannerTypeByShortName(typeName: string): BannerType | null {
        switch (typeName) {
            case "new-player": return BannerType.CHAR_BEGINNER;
            case "standard": return BannerType.CHAR_STANDARD;
            case "special": return BannerType.CHAR_SPECIAL;
            case "joint": return BannerType.CHAR_JOINT;
            case "weapon": return BannerType.WEAPON;
        }

        return null;
    }

    export function getBannerTypeByDbBannerType(bannerType: DbBannerType): BannerType {
        switch (bannerType) {
            case DbBannerType.CHAR_BEGINNER: return BannerType.CHAR_BEGINNER;
            case DbBannerType.CHAR_STANDARD: return BannerType.CHAR_STANDARD;
            case DbBannerType.CHAR_SPECIAL: return BannerType.CHAR_SPECIAL;
            case DbBannerType.CHAR_JOINT: return BannerType.CHAR_JOINT;
            case DbBannerType.WEAPON_SPECIAL: return BannerType.WEAPON;
            case DbBannerType.WEAPON_STANDARD: return BannerType.WEAPON;
        }
    }

    export function isBannerType(str: string): str is BannerType {
        return str === BannerType.CHAR_BEGINNER
            || str === BannerType.CHAR_STANDARD
            || str === BannerType.CHAR_SPECIAL
            || str === BannerType.CHAR_JOINT
            || str === BannerType.WEAPON;
    }
}