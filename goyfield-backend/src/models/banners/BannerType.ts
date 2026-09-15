import { DbBannerType } from "@models/banners/DbBannerType.js";
import { ShortBannerType } from "@models/banners/ShortBannerType.js";

export enum BannerType {
    CHAR_BEGINNER = "E_CharacterGachaPoolType_Beginner",
    CHAR_STANDARD = "E_CharacterGachaPoolType_Standard",
    CHAR_SPECIAL = "E_CharacterGachaPoolType_Special",
    CHAR_JOINT = "E_CharacterGachaPoolType_Joint",
    CHAR_RERUN = "E_CharacterGachaPoolType_Rerun",
    WEAPON = "Weapon",
    WEAPON_RERUN = "weapon_rerun", // todo поменять
}

export namespace BannerType {
    export type Character =
        | BannerType.CHAR_BEGINNER
        | BannerType.CHAR_STANDARD
        | BannerType.CHAR_SPECIAL
        | BannerType.CHAR_JOINT
        | BannerType.CHAR_RERUN;

    export type Weapon =
        | BannerType.WEAPON
        | BannerType.WEAPON_RERUN;

    export function getShortBannerTypeName(bannerType: BannerType): ShortBannerType {
        switch (bannerType) {
            case BannerType.CHAR_BEGINNER: return ShortBannerType.CHAR_BEGINNER;
            case BannerType.CHAR_STANDARD: return ShortBannerType.CHAR_STANDARD;
            case BannerType.CHAR_SPECIAL: return ShortBannerType.CHAR_SPECIAL;
            case BannerType.CHAR_JOINT: return ShortBannerType.CHAR_JOINT;
            case BannerType.CHAR_RERUN: return ShortBannerType.CHAR_RERUN;
            case BannerType.WEAPON: return ShortBannerType.WEAPON;
            case BannerType.WEAPON_RERUN: return ShortBannerType.WEAPON_RERUN;
        }
    }

    export function getBannerTypeByShortName(typeName: string): BannerType | null {
        switch (typeName) {
            case "new-player": return BannerType.CHAR_BEGINNER;
            case "standard": return BannerType.CHAR_STANDARD;
            case "special": return BannerType.CHAR_SPECIAL;
            case "joint": return BannerType.CHAR_JOINT;
            case "rerun": return BannerType.CHAR_RERUN;
            case "weapon": return BannerType.WEAPON;
            case "weapon_rerun": return BannerType.WEAPON_RERUN;
        }

        return null;
    }

    export function getBannerTypeByDbBannerType(bannerType: DbBannerType): BannerType {
        switch (bannerType) {
            case DbBannerType.CHAR_BEGINNER: return BannerType.CHAR_BEGINNER;
            case DbBannerType.CHAR_STANDARD: return BannerType.CHAR_STANDARD;
            case DbBannerType.CHAR_SPECIAL: return BannerType.CHAR_SPECIAL;
            case DbBannerType.CHAR_JOINT: return BannerType.CHAR_JOINT;
            case DbBannerType.CHAR_RERUN: return BannerType.CHAR_RERUN;
            case DbBannerType.WEAPON_SPECIAL: return BannerType.WEAPON;
            case DbBannerType.WEAPON_STANDARD: return BannerType.WEAPON;
            case DbBannerType.WEAPON_RERUN: return BannerType.WEAPON_RERUN;
        }
    }

    export function isBannerType(str: string): str is BannerType {
        return str === BannerType.CHAR_BEGINNER
            || str === BannerType.CHAR_STANDARD
            || str === BannerType.CHAR_SPECIAL
            || str === BannerType.CHAR_JOINT
            || str === BannerType.CHAR_RERUN
            || str === BannerType.WEAPON
            || str === BannerType.WEAPON_RERUN;
    }
}