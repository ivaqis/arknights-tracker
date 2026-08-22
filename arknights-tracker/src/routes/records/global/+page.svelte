<script lang="ts">
    import { goto } from "$app/navigation";
    import type { GlobalBannerData } from "$lib/api/globalBannerStats/contracts/GlobalBannerData";
    import type { GlobalBannerStatsResponse } from "$lib/api/globalBannerStats/contracts/GlobalBannerStatsResponse";
    import { fetchGlobalBannerStats } from "$lib/api/globalBannerStats/fetchGlobalBannerStats";
    import { ApiBannerType } from "$lib/classes/banners/ApiBannerType";
    import { Banner } from "$lib/classes/banners/Banner";
    import { BannerType } from "$lib/classes/banners/BannerType";
    import { Character } from "$lib/classes/characters/Character";
    import { Weapon } from "$lib/classes/weapons/Weapon";
    import Button from "$lib/components/Button.svelte";
    import GlobalBannerTimelineChart from "$lib/components/charts/GlobalBannerTimelineChart.svelte";
    import FeaturedGlobalBannerStats from "$lib/components/globalBannerStats/FeaturedGlobalBannerStats.svelte";
    import GlobalBannerBoard from "$lib/components/globalBannerStats/GlobalBannerBoard.svelte";
    import GlobalBannerStats from "$lib/components/globalBannerStats/GlobalBannerStats.svelte";
    import OverviewGlobalBannerStats from "$lib/components/globalBannerStats/OverviewGlobalBannerStats.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import BannerModal from "$lib/components/modals/BannerModal.svelte";
    import Select from "$lib/components/Select.svelte";
    import type { SelectOption } from "$lib/components/SelectOption";
    import { type BannerData, banners } from "$lib/data/banners";
    import { t } from "$lib/i18n";
    import { currentLocale } from "$lib/stores/locale";
    import { getISODate } from "$lib/utils/textUtils";

    const typeOptions: SelectOption[] = BannerType.list.map(item => ({
        value: item.id,
        label: $t(item.i18nKey)
    }));

    let selectedBannerType: ApiBannerType = ApiBannerType.CHAR_SPECIAL;
    let selectableBanners: readonly Banner[] = Banner.getListByApiType(selectedBannerType);
    let selectedBanner: Banner = selectableBanners.at(-1) as Banner;
    let selectedBannerId: string = selectedBanner.gameId;
    let selectedBannerRawData: BannerData | null = banners.find(item => item.id === selectedBannerId || item.gameId === selectedBannerId) ?? null;

    let bannerOptions: SelectOption[] = getBannerOptions(selectableBanners);

    $: selectBannerType(selectedBannerType);
    $: selectBanner(selectedBannerId);

    $: hasBannerSelector =
        selectedBannerType !== ApiBannerType.CHAR_BEGINNER
        && selectedBannerType !== ApiBannerType.CHAR_STANDARD;

    function selectBannerType(bannerType: ApiBannerType): void {
        selectableBanners = Banner.getListByApiType(bannerType);
        bannerOptions = getBannerOptions(selectableBanners);
        selectedBanner = selectableBanners.at(-1)!;
        selectedBannerId = selectedBanner.gameId;
    }

    function selectBanner(bannerGameId: string): void {
        selectedBanner = selectedBanner.gameId === bannerGameId
            ? selectedBanner
            : Banner.getByGameId(bannerGameId)!;

        selectedBannerRawData = banners.find(item => item.id === selectedBannerId || item.gameId === selectedBannerId) ?? null;
    }

    function getBannerOptions(selectableBanners: readonly Banner[]): SelectOption[] {
        return selectableBanners.toReversed().map(item => ({
            value: item.gameId,
            label: $t(`banners.${item.id}`),
            subLabel: `${item.getFormattedStartTime($currentLocale)} - ${item.getFormattedEndTime($currentLocale) ?? $t("permanent")}`,
            iconId: item.miniIcon ? item.miniIcon.replace(/\.[^/.]+$/, "") : item.id
        }));
    }

    let stats: GlobalBannerData | null = null;

    let featuredList: (Character | Weapon)[] = [];

    $: updateBannerStats(selectedBannerId);

    async function updateBannerStats(bannerId: string): Promise<void> {
        let res: GlobalBannerStatsResponse | null = null;

        try {
            res = await fetchGlobalBannerStats(bannerId);
        } catch (error) {
            console.error(error);
        }

        stats = res?.stats ?? null;

        featuredList = getFeaturedList(stats);
    }

    function getFeaturedList(stats: GlobalBannerData | null): (Character | Weapon)[] {
        return stats?.stats.featured?.ids
                .map(id => Character.getByGameId(id) ?? Weapon.getByGameId(id) ?? null)
                .filter(item => item !== null)
            ?? [];
    }

    let isModalOpen: boolean = false;

    function openModal(): void {
        if (selectedBannerRawData) {
            isModalOpen = true;
        }
    }

</script>

<svelte:head>
    <title>
        {$t("global.title")} - {$t("pages.records")} | Goyfield
    </title>
</svelte:head>

{#if isModalOpen && selectedBannerRawData}

    <BannerModal
        banner={selectedBannerRawData}
        pageContext="global"
        on:close={() => isModalOpen = false}
    />

{/if}

<div class="w-full max-w-[1800px] px-6 pb-20">

    <div class="flex items-center gap-4 mb-8">

        <Button
            variant="roundSmall"
            color="white"
            onClick={() => goto("/records")}
        >

            <Icon
                name="arrowLeft"
                class="w-5 h-5"
            />

        </Button>

        <h2 class="font-sdk text-4xl md:text-5xl tracking-wide text-[#21272C] dark:text-[#FDFDFD]">
            {$t("global.title")}
        </h2>

    </div>

    <div class="flex flex-col sm:flex-row gap-4 mb-8 max-w-2xl">

        <div class="w-full sm:w-1/2">

            <Select
                options={typeOptions}
                bind:value={selectedBannerType}
                variant="black"
                placeholder={$t("global.selectType")}
            />

        </div>

        {#if hasBannerSelector}

            <div class="w-full sm:w-1/2">

                {#key selectedBannerType}
                    <Select
                        options={bannerOptions}
                        bind:value={selectedBannerId}
                        variant="black"
                        placeholder={$t("global.selectBanner")}
                    />
                {/key}

            </div>

        {/if}

    </div>

    {#key stats}

        {#if stats}

            {@const featured = stats.stats.featured}
            {@const overview = stats.stats.overview}
            {@const stats6 = stats.stats.stats6}
            {@const stats5 = stats.stats.stats5}

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                <div class="lg:col-span-4 xl:col-span-3 flex flex-col gap-4">

                    {#if featured}

                        <FeaturedGlobalBannerStats
                            featuredList={featuredList}
                            totalCount={featured.totalCount}
                            freeCount={featured.freeCount}
                            guaranteedCount={featured.guaranteedCount}
                        />

                    {/if}

                    <OverviewGlobalBannerStats
                        totalUsers={overview.totalUsers}
                        totalPulls={overview.totalPulls}
                        freePulls={overview.freePulls}
                        oroberylSpent={overview.oroberylSpent}
                        arsenalTicketsSpent={overview.arsenalTicketsSpent}
                    />

                    <GlobalBannerStats
                        rarity={6}
                        totalRate={stats6.totalRate}
                        totalCount={stats6.totalCount}
                        medianPity={stats6.medianPity}
                        winrate={stats6.winrate}
                        freeRate={stats6.freeRate}
                        freeCount={stats6.freeCount}
                        freeWinrate={stats6.freeWinrate}
                    />

                    <GlobalBannerStats
                        rarity={5}
                        totalRate={stats5.totalRate}
                        totalCount={stats5.totalCount}
                        medianPity={stats5.medianPity}
                        freeRate={stats5.freeRate}
                        freeCount={stats5.freeCount}
                    />

                </div>

                <div class="lg:col-span-8 xl:col-span-8 flex flex-col gap-6">

                    <button
                        tabindex="0"
                        class="select-none cursor-pointer outline-none rounded-xl focus:ring-4 focus:ring-[#FACC15]"
                        on:click={openModal}
                        on:keydown={(e) => (e.key === "Enter" || e.key === " ") && openModal()}
                    >

                        <GlobalBannerBoard
                            banner={selectedBanner}
                        />

                    </button>

                    <GlobalBannerTimelineChart
                        values={stats.timeline}
                        minDate={selectedBanner.getISOStartTime()}
                        maxDate={selectedBanner.getISOEndTime() ?? getISODate(new Date())}
                    />

                </div>

            </div>

        {/if}

    {/key}

</div>