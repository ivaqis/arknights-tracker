import { UserBannerTypeStatEntity } from "@database/entities/UserBannerTypeStatEntity.js";
import { UserCharBannerTypePullsRecord } from "@database/records/UserCharBannerTypePullsRecord.js";
import { DbBannerType } from "@models/banners/DbBannerType.js";

export interface UserCharBannerTypeData {
    profileId: bigint;
    bannerType: DbBannerType;
    stat: UserBannerTypeStatEntity;
    pulls: UserCharBannerTypePullsRecord;
}