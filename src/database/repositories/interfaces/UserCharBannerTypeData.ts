import { UserBannerTypeStatEntity } from "@database/entities/UserBannerTypeStatEntity";
import { UserCharBannerTypePullsRecord } from "@database/records/UserCharBannerTypePullsRecord";
import { DbBannerType } from "@models/banners/DbBannerType";

export interface UserCharBannerTypeData {
    profileId: bigint;
    bannerType: DbBannerType;
    stat: UserBannerTypeStatEntity;
    pulls: UserCharBannerTypePullsRecord;
}