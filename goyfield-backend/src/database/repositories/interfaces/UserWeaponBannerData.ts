import { UserBannerStatRecord } from "@database/records/UserBannerStatRecord.js";
import { UserWeaponBannerPullsRecord } from "@database/records/UserWeaponBannerPullsRecord.js";

export interface UserWeaponBannerData {
    profileId: bigint;
    bannerId: string;
    stat: UserBannerStatRecord;
    pulls: UserWeaponBannerPullsRecord;
}