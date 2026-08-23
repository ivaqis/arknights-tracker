<script lang="ts">
    import type { Rarity } from "$lib/classes/Rarity";
    import GlobalBannerStatParam from "$lib/components/globalBannerStats/GlobalBannerStatParam.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import { t } from "$lib/i18n";
    import { formatCount, formatRate } from "$lib/utils/textUtils";

    export let rarity: Rarity;
    export let mode5050: "50:50" | "25:75" = "50:50";

    export let totalRate: number;
    export let totalCount: number;
    export let medianPity: number | null = null;
    export let winrate: number | null = null;
    export let freeRate: number | null = null;
    export let freeCount: number | null = null;
    export let freeWinrate: number | null = null;
</script>

<div class="bg-white dark:bg-[#383838] dark:border-[#444444] rounded-xl p-5 shadow-sm border border-gray-100">

    <div class="flex items-center gap-1 text-lg font-bold font-sdk text-[#21272C] dark:text-[#FDFDFD] mb-2">

        {rarity}

        <Icon
            name="star"
            class="w-5 h-5 text-[#21272C] dark:text-[#FDFDFD]"
        />

        {$t("global.stats")}

    </div>

    <div class="pt-3 space-y-3">

        <GlobalBannerStatParam
            title={$t("global.count")}
        >
            {formatCount(totalCount)}
        </GlobalBannerStatParam>

        {#if freeCount !== null}

            <GlobalBannerStatParam
                title={$t("global.freeCount")}
            >
                {formatCount(freeCount)}
            </GlobalBannerStatParam>

        {/if}

        <GlobalBannerStatParam
            title={$t("global.rate")}
        >
            {formatRate(totalRate, 3)}
        </GlobalBannerStatParam>

        {#if medianPity !== null}

            <GlobalBannerStatParam
                title={$t("global.median")}
            >
                {formatCount(medianPity)}
            </GlobalBannerStatParam>

        {/if}

        {#if winrate !== null}

            <GlobalBannerStatParam
                title={`${$t("global.won")} ${mode5050}`}
            >
                {formatRate(winrate, 2)}
            </GlobalBannerStatParam>

        {/if}

        {#if freeRate !== null}

            <GlobalBannerStatParam
                title={$t("global.freeRate")}
            >
                {formatRate(freeRate, 3)}
            </GlobalBannerStatParam>

        {/if}

        {#if freeWinrate !== null}

            <GlobalBannerStatParam
                title={`${$t("global.won")} ${mode5050} (${$t("global.free")})`}
            >
                {formatRate(freeWinrate, 2)}
            </GlobalBannerStatParam>

        {/if}

    </div>

</div>