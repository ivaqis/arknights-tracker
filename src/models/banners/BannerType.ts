export enum BannerType {
    CHAR_BEGINNER = "E_CharacterGachaPoolType_Beginner",
    CHAR_STANDARD = "E_CharacterGachaPoolType_Standard",
    CHAR_SPECIAL = "E_CharacterGachaPoolType_Special",
    CHAR_JOINT = "E_CharacterGachaPoolType_Joint",
    WEAPON = "Weapon"
}

export namespace BannerType {
    export function getShortBannerTypeName(bannerType: BannerType): string {
        switch (bannerType) {
            case BannerType.CHAR_BEGINNER: return "new-player";
            case BannerType.CHAR_STANDARD: return "standard";
            case BannerType.CHAR_SPECIAL: return "special";
            case BannerType.CHAR_JOINT: return "joint";
            case BannerType.WEAPON: return "weapon";
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
}