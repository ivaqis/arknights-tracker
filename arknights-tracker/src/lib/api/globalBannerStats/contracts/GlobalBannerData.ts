import type { GlobalBannerDataBeginner } from "$lib/api/globalBannerStats/contracts/GlobalBannerDataBeginner";
import type { GlobalBannerDataJointV1 } from "$lib/api/globalBannerStats/contracts/GlobalBannerDataJointV1";
import type { GlobalBannerDataJointV2 } from "$lib/api/globalBannerStats/contracts/GlobalBannerDataJointV2";
import type { GlobalBannerDataSpecialV1 } from "$lib/api/globalBannerStats/contracts/GlobalBannerDataSpecialV1";
import type { GlobalBannerDataSpecialV2 } from "$lib/api/globalBannerStats/contracts/GlobalBannerDataSpecialV2";
import type { GlobalBannerDataStandard } from "$lib/api/globalBannerStats/contracts/GlobalBannerDataStandard";
import type { GlobalBannerDataWeaponV1 } from "$lib/api/globalBannerStats/contracts/GlobalBannerDataWeaponV1";
import type { GlobalBannerDataWeaponV2 } from "$lib/api/globalBannerStats/contracts/GlobalBannerDataWeaponV2";

export type GlobalBannerData =
    | GlobalBannerDataBeginner
    | GlobalBannerDataStandard
    | GlobalBannerDataSpecialV1
    | GlobalBannerDataSpecialV2
    | GlobalBannerDataJointV1
    | GlobalBannerDataJointV2
    | GlobalBannerDataWeaponV1
    | GlobalBannerDataWeaponV2;