import type { PullRecord } from "$lib/classes/pulls/PullTypes";
import { PullDateHelper } from "$lib/classes/pulls/PullDateHelper";

export class PullPityCalculator {
    public static calculate(
        pulls: PullRecord[],
        bannerId: string,
        accountServerId: string | null = null
    ): PullRecord[] {
        const isSpecialCategory = bannerId?.includes("special") && !bannerId.includes("weap");
        const isJointCategory = bannerId?.includes("joint");

        let pityCounter = 0;
        const bannerSpecificCounts: Record<string, number> = {};

        return pulls.map((pull) => {
            const uniqueBannerKey = PullDateHelper.getDistinctBannerId(pull, accountServerId);

            if (!bannerSpecificCounts[uniqueBannerKey]) {
                bannerSpecificCounts[uniqueBannerKey] = 0;
            }

            let isFreePull: boolean;
            if (typeof pull.isFree === "boolean") {
                isFreePull = pull.isFree;
            } else {
                const countInThisBanner = bannerSpecificCounts[uniqueBannerKey];
                isFreePull = (isSpecialCategory || isJointCategory)
                    && 30 <= countInThisBanner && countInThisBanner < 40;
            }

            bannerSpecificCounts[uniqueBannerKey]++;

            if (!isFreePull) {
                pityCounter++;
            }

            if (pull.rarity === 6) {
                const currentPityValue = isFreePull ? 1 : pityCounter;
                if (!isFreePull) {
                    pityCounter = 0;
                }
                return {
                    ...pull,
                    pity: currentPityValue,
                    isFree: isFreePull
                };
            }

            return {
                ...pull,
                pity: isFreePull ? 1 : pityCounter,
                isFree: isFreePull
            };
        });
    }
}
