<script lang="ts">
    import type {
        GlobalPityDistributionData
    } from "$lib/api/globalBannerStats/contracts/pityDistribution/GlobalPityDistributionData";
    import type { Rarity } from "$lib/classes/Rarity";
    import { getMap } from "$lib/utils/collectionUtils";

    export let values: GlobalPityDistributionData[];

    export let rarity: Rarity;
    export let maxPity: number;

    let displayedValues: GlobalPityDistributionData[] | null;

    function getDisplayedValues(values: GlobalPityDistributionData[], maxPity: number): GlobalPityDistributionData[] | null {
        const filtered = values.filter(v => 1 <= v.pity && v.pity <= maxPity);

        if (filtered.length === 0) {
            return null;
        }

        const map = getMap(filtered, item => item.pity);

        const result: GlobalPityDistributionData[] = [];

        for (let i = 1; i <= maxPity; i++) {
            const item = map.get(i);

            if (item) {
                result.push(item);
            } else {
                result.push({
                    pity: i,
                    count: 0,
                    rate: 0
                });
            }
        }

        return result;
    }
</script>