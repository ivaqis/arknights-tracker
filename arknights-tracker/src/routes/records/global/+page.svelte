<script lang="ts">
    import { browser } from "$app/environment";
    import { goto, replaceState } from "$app/navigation";
    import type { GlobalBannerData } from "$lib/api/globalBannerStats/contracts/GlobalBannerData";
    import type { GlobalBannerStatsResponse } from "$lib/api/globalBannerStats/contracts/GlobalBannerStatsResponse";
    import { fetchGlobalBannerStats } from "$lib/api/globalBannerStats/fetchGlobalBannerStats";
    import { ApiBannerType } from "$lib/classes/banners/ApiBannerType";
    import { Banner } from "$lib/classes/banners/Banner";
    import { BannerType } from "$lib/classes/banners/BannerType";
    import { GameBannerType } from "$lib/classes/banners/GameBannerType";
    import { Character } from "$lib/classes/characters/Character";
    import { Weapon } from "$lib/classes/weapons/Weapon";
    import Button from "$lib/components/Button.svelte";
    import GlobalBannerTimelineChart from "$lib/components/charts/GlobalBannerTimelineChart.svelte";
    import GlobalPityDistributionChart from "$lib/components/charts/GlobalPityDistributionChart.svelte";
    import FeaturedGlobalBannerStats from "$lib/components/globalBannerStats/FeaturedGlobalBannerStats.svelte";
    import GlobalBannerBoard from "$lib/components/globalBannerStats/GlobalBannerBoard.svelte";
    import GlobalBannerStats from "$lib/components/globalBannerStats/GlobalBannerStats.svelte";
    import GlobalItemStatList from "$lib/components/globalBannerStats/GlobalItemStatList.svelte";
    import OverviewGlobalBannerStats from "$lib/components/globalBannerStats/OverviewGlobalBannerStats.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import BannerModal from "$lib/components/modals/BannerModal.svelte";
    import Select from "$lib/components/Select.svelte";
    import type { SelectOption } from "$lib/components/SelectOption";
    import { type BannerData, banners } from "$lib/data/banners";
    import { t } from "$lib/i18n";
    import { currentLocale } from "$lib/stores/locale";
    import { getISODate } from "$lib/utils/textUtils";

    export let data;

    const typeOptions: SelectOption[] = BannerType.list.map(item => ({
        value: item.id,
        label: $t(item.i18nKey)
    }));

    let currentBannerType: ApiBannerType;
    let selectableBanners: readonly Banner[];
    let currentBanner: Banner;
    let currentBannerRawData: BannerData | null;

    let bannerOptions: SelectOption[];

    $: {
        currentBanner = data.banner;
        currentBannerRawData = banners.find(item => item.id === currentBanner.id) ?? null;
        // stats = null;
    }
    $: if (currentBannerType !== currentBanner.apiType) {
        currentBannerType = currentBanner.apiType;
        selectableBanners = Banner.getListByApiType(currentBanner.apiType);
        bannerOptions = getBannerOptions(selectableBanners);
    }

    $: hasBannerSelector =
        currentBannerType !== ApiBannerType.CHAR_BEGINNER
        && currentBannerType !== ApiBannerType.CHAR_STANDARD;

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

    $: updateBannerStats(currentBanner.gameId);

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

    let selectedBannerId: string;
    let selectedBannerType: ApiBannerType;

    $: selectedBannerId = currentBanner.gameId;
    $: selectedBannerType = currentBannerType;

    $: if (selectedBannerId !== currentBanner.gameId) {
        selectBannerId(selectedBannerId);
    }
    $: if (selectedBannerType !== currentBannerType) {
        const banners = Banner.getListByApiType(selectedBannerType);
        const banner = banners.at(-1)!;

        selectBannerId(banner.gameId);
    }

    function selectBannerId(bannerId: string): void {
        if (!browser) {
            return;
        }

        goto(`/records/global?id=${bannerId}`, {
            replaceState: true
        });
    }

    let isModalOpen: boolean = false;

    function openModal(): void {
        if (currentBannerRawData) {
            isModalOpen = true;
        }
    }

</script>

<svelte:head>
    <title>
        {$t("global.title")} - {$t("pages.records")} | Goyfield
    </title>
</svelte:head>

{#if isModalOpen && currentBannerRawData}

    <BannerModal
        banner={currentBannerRawData}
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

                {#key currentBannerType}
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
                        mode5050={currentBanner.gameType === GameBannerType.WEAPON ? "25:75" : "50:50"}
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
                            banner={currentBanner}
                        />

                    </button>

                    <GlobalBannerTimelineChart
                        values={stats.timeline}
                        minDate={currentBanner.getISOStartTime()}
                        maxDate={currentBanner.getISOEndTime() ?? getISODate(new Date())}
                    />

                    <GlobalPityDistributionChart
                        values={stats.pityDistribution6}
                        rarity={6}
                        maxPity={currentBanner.gameType === GameBannerType.WEAPON || currentBanner.gameType === GameBannerType.CHAR_BEGINNER ? 40 : 80}
                    />

                    {#if stats.pityDistribution5}

                        <GlobalPityDistributionChart
                            values={stats.pityDistribution5}
                            rarity={5}
                            maxPity={10}
                        />

                    {/if}

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <GlobalItemStatList
                            items={stats.items6}
                            rarity={6}
                            banner={currentBanner}
                        />

                        <GlobalItemStatList
                            items={stats.items5}
                            rarity={5}
                            banner={currentBanner}
                        />

                    </div>

                </div>

            </div>

        {/if}

    {/key}

</div>