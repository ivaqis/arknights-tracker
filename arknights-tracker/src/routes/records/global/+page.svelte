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
    import FeaturedGlobalBannerStats from "$lib/components/globalBannerStats/FeaturedGlobalBannerStats.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import Select from "$lib/components/Select.svelte";
    import type { SelectOption } from "$lib/components/SelectOption";
    import { t } from "$lib/i18n";
    import { currentLocale } from "$lib/stores/locale";

    const typeOptions: SelectOption[] = BannerType.list.map(item => ({
        value: item.id,
        label: $t(item.i18nKey)
    }));

    let selectedBannerType: ApiBannerType = ApiBannerType.CHAR_SPECIAL;
    let selectableBanners: readonly Banner[] = Banner.getListByApiType(selectedBannerType);
    let selectedBanner: Banner = selectableBanners.at(-1) as Banner;
    let selectedBannerId: string = selectedBanner.gameId;

    let bannerOptions: SelectOption[] = getBannerOptions(selectableBanners);

    $: selectBannerType(selectedBannerType);
    $: selectBanner(selectedBannerId);

    function selectBannerType(bannerType: ApiBannerType): void {
        selectableBanners = Banner.getListByApiType(bannerType);
        bannerOptions = getBannerOptions(selectableBanners);
        selectedBanner = selectableBanners.at(-1)!;
        selectedBannerId = selectedBanner.gameId;
    }

    function selectBanner(bannerGameId: string): void {
        selectedBanner = Banner.getByGameId(bannerGameId)!;
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

        featuredList = stats?.stats.featured?.ids.map(id => Character.getByGameId(id) ?? Weapon.getByGameId(id) ?? null).filter(item => item !== null) ?? [];
    }

    function getFeaturedList(stats: GlobalBannerData | null): (Character | Weapon)[] {
        return stats?.stats.featured?.ids
                .map(id => Character.getByGameId(id) ?? Weapon.getByGameId(id) ?? null)
                .filter(item => item !== null)
            ?? [];
    }

</script>

<div class="w-full max-w-[1800px] px-6 pb-20">

    <div class="flex items-center gap-4 mb-8">
        <Button
            variant="roundSmall"
            color="white"
            onClick={() => goto("/records")}
        >
            <Icon name="arrowLeft" class="w-5 h-5" />
        </Button>
        <h2
            class="font-sdk text-4xl md:text-5xl tracking-wide text-[#21272C] dark:text-[#FDFDFD]"
        >
            {$t("global.title") || "Global Statistics"}
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

        {#if bannerOptions.length > 1}

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

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                <div class="lg:col-span-4 xl:col-span-3 flex flex-col gap-4">

                    {#if stats.stats.featured}

                        {@const featured = stats.stats.featured}

                        <FeaturedGlobalBannerStats
                            featuredList={featuredList}
                            totalCount={featured.totalCount}
                            freeCount={featured.freeCount ?? null}
                            guaranteedCount={featured.guaranteedCount ?? null}
                        />

                    {/if}

                </div>

            </div>

        {/if}

    {/key}

</div>