import { UserBannerStatRecord } from "@database/records/UserBannerStatRecord";
import { UserWeaponBannerPullsRecord } from "@database/records/UserWeaponBannerPullsRecord";

export interface UserWeaponBannerData {
    profileId: bigint;
    bannerId: string;
    stat: UserBannerStatRecord;
    pulls: UserWeaponBannerPullsRecord;
}