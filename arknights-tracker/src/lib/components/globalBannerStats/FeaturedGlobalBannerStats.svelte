<script lang="ts">
    import { Character } from "$lib/classes/characters/Character";
    import { Weapon } from "$lib/classes/weapons/Weapon";
    import OperatorCard from "$lib/components/cards/OperatorCard.svelte";
    import WeaponCard from "$lib/components/cards/WeaponCard.svelte";
    import GlobalBannerStatParam from "$lib/components/globalBannerStats/GlobalBannerStatParam.svelte";
    import Tooltip from "$lib/components/Tooltip.svelte";
    import { t } from "$lib/i18n";
    import { formatCount } from "$lib/utils/textUtils";

    export let featuredList: (Character | Weapon)[];
    export let totalCount: number;
    export let freeCount: number | null = null;
    export let guaranteedCount: number | null = null;

</script>

<div class="bg-white dark:bg-[#383838] dark:border-[#444444] rounded-xl p-5 shadow-sm border border-gray-100">

    {#if featuredList.length === 1}

        {@const featuredItem = featuredList[0]}

        <div class="flex items-start gap-4">

            <div class="shrink-0">

                {#if featuredItem instanceof Weapon}

                    <WeaponCard
                        weapon={featuredItem}
                        variant="small"
                        hideName={true}
                        hideDarkness={true}
                        className="w-[70px] h-[70px] shadow-sm blur-[0.3px] rotate-[0.01deg] backface-hidden transform-gpu"
                    />

                {:else}

                    <OperatorCard
                        operator={featuredItem}
                        variant="small"
                        hideName={true}
                        hideClass={true}
                        hideElement={true}
                        className="w-[70px] h-[70px] shadow-sm blur-[0.35px] rotate-[0.01deg] backface-hidden transform-gpu"
                    />

                {/if}

            </div>

            <div class="flex flex-col justify-center min-h-[70px] flex-1">

                <div class="font-bold text-[#21272C] dark:text-[#FDFDFD] leading-tight mb-1 line-clamp-2">
                    {$t(featuredItem.i18nKey)}
                </div>

                <div class="text-[10px] text-gray-500 dark:text-[#B7B6B3] uppercase tracking-wide leading-none">
                    {$t("global.totalObtained")}
                </div>

                <div class="font-nums font-bold text-xl text-[#21272C] dark:text-[#FDFDFD] leading-none mt-1">
                    {formatCount(totalCount)}
                </div>

            </div>

        </div>

    {:else}

        <h3 class="text-lg font-bold font-sdk text-[#21272C] dark:text-[#FDFDFD] mb-2">
            {$t("global.featuredList")}
        </h3>

        <div class="flex flex-wrap gap-2">

            {#each featuredList as featuredItem}

                <Tooltip
                    text={$t(featuredItem.i18nKey)}
                >

                    {#if featuredItem instanceof Weapon}

                        <WeaponCard
                            weapon={featuredItem}
                            variant="small"
                            hideName={true}
                            hideDarkness={true}
                            className="w-[70px] h-[70px] shadow-sm blur-[0.3px] rotate-[0.01deg] backface-hidden transform-gpu"
                        />

                    {:else}

                        <OperatorCard
                            operator={featuredItem}
                            variant="small"
                            hideName={true}
                            hideClass={true}
                            hideElement={true}
                            className="w-[70px] h-[70px] shadow-sm blur-[0.35px] rotate-[0.01deg] backface-hidden transform-gpu"
                        />

                    {/if}

                </Tooltip>

            {/each}

        </div>

    {/if}

    <div class="pt-3 space-y-3">

        {#if featuredList.length > 1}

            <GlobalBannerStatParam
                title={$t("global.totalObtained")}
            >
                {formatCount(totalCount)}
            </GlobalBannerStatParam>

        {/if}

        {#if freeCount !== null}

            <GlobalBannerStatParam
                title={$t("global.freeCount")}
            >
                {formatCount(freeCount)}
            </GlobalBannerStatParam>

        {/if}

        {#if guaranteedCount !== null}

            <GlobalBannerStatParam
                title={$t("global.guaranteedCount")}
            >
                {formatCount(guaranteedCount)}
            </GlobalBannerStatParam>

        {/if}

    </div>

</div>