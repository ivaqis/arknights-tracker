import { GlobalBannerDataBeginner } from "@models/globalBannerStats/entities/GlobalBannerDataBeginner.js";
import { GlobalBannerDataJointV1 } from "@models/globalBannerStats/entities/GlobalBannerDataJointV1.js";
import { GlobalBannerDataJointV2 } from "@models/globalBannerStats/entities/GlobalBannerDataJointV2.js";
import { GlobalBannerDataSpecialV1 } from "@models/globalBannerStats/entities/GlobalBannerDataSpecialV1.js";
import { GlobalBannerDataSpecialV2 } from "@models/globalBannerStats/entities/GlobalBannerDataSpecialV2.js";
import { GlobalBannerDataStandard } from "@models/globalBannerStats/entities/GlobalBannerDataStandard.js";
import { GlobalBannerDataWeaponV1 } from "@models/globalBannerStats/entities/GlobalBannerDataWeaponV1.js";
import { GlobalBannerDataWeaponV2 } from "@models/globalBannerStats/entities/GlobalBannerDataWeaponV2.js";

export type GlobalBannerData =
    | GlobalBannerDataBeginner
    | GlobalBannerDataStandard
    | GlobalBannerDataSpecialV1
    | GlobalBannerDataSpecialV2
    | GlobalBannerDataJointV1
    | GlobalBannerDataJointV2
    | GlobalBannerDataWeaponV1
    | GlobalBannerDataWeaponV2;