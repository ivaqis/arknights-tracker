import { BannerType } from "@models/banners/BannerType";
import { CharPull } from "@models/pulls/CharPull";
import { WeaponPull } from "@models/pulls/WeaponPull";
import { PeriodPulls } from "@models/stablePullId/PeriodPulls";

export interface GroupedPullsByPeriod {
    [BannerType.CHAR_STANDARD]: PeriodPulls<CharPull>,
    [BannerType.CHAR_BEGINNER]: PeriodPulls<CharPull>,
    [BannerType.CHAR_SPECIAL]: PeriodPulls<CharPull>,
    [BannerType.CHAR_JOINT]: PeriodPulls<CharPull>,
    [BannerType.WEAPON]: PeriodPulls<WeaponPull>
}

export namespace GroupedPullsByPeriod {
    export function createEmpty(): GroupedPullsByPeriod {
        return {
            [BannerType.CHAR_STANDARD]: PeriodPulls.createEmpty(),
            [BannerType.CHAR_BEGINNER]: PeriodPulls.createEmpty(),
            [BannerType.CHAR_SPECIAL]: PeriodPulls.createEmpty(),
            [BannerType.CHAR_JOINT]: PeriodPulls.createEmpty(),
            [BannerType.WEAPON]: PeriodPulls.createEmpty()
        };
    }
}