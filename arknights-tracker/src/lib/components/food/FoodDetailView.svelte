<script lang="ts">
    import type { IBoardable } from "$lib/classes/gameData/IBoardable";
    import type { IFood } from "$lib/classes/gameData/items/food/IFood";
    import type { IFoodBuff } from "$lib/classes/gameData/items/food/IFoodBuff";
    import { RichTextParamParser } from "$lib/classes/richText/expressions/RichTextParamParser";
    import Icon from "$lib/components/Icon.svelte";
    import Image from "$lib/components/Image.svelte";
    import { t } from "$lib/i18n";
    import { currentLocale } from "$lib/stores/locale";
    import { getRarityColor } from "$lib/utils/colorUtils";
    import { parseRichText } from "$lib/utils/richText";

    export let item: IFood;

    export let inColumn: boolean = false;
    
    const foodLocaleModules: Record<string, Record<string, () => Promise<unknown>>> = {
        en: import.meta.glob("/src/lib/locales/en/usableItems.json"),
        ru: import.meta.glob("/src/lib/locales/ru/usableItems.json"),
        de: import.meta.glob("/src/lib/locales/de/usableItems.json"),
        es: import.meta.glob("/src/lib/locales/es/usableItems.json"),
        fr: import.meta.glob("/src/lib/locales/fr/usableItems.json"),
        id: import.meta.glob("/src/lib/locales/id/usableItems.json"),
        it: import.meta.glob("/src/lib/locales/it/usableItems.json"),
        ja: import.meta.glob("/src/lib/locales/ja/usableItems.json"),
        ko: import.meta.glob("/src/lib/locales/ko/usableItems.json"),
        pt: import.meta.glob("/src/lib/locales/pt/usableItems.json"),
        th: import.meta.glob("/src/lib/locales/th/usableItems.json"),
        vi: import.meta.glob("/src/lib/locales/vi/usableItems.json"),
        zhcn: import.meta.glob("/src/lib/locales/zhcn/usableItems.json"),
        zhtw: import.meta.glob("/src/lib/locales/zhtw/usableItems.json"),
    } as const;
    
    const equipLocaleModules: Record<string, Record<string, () => Promise<unknown>>> = {
        en: import.meta.glob("/src/lib/locales/en/equipItems.json"),
        ru: import.meta.glob("/src/lib/locales/ru/equipItems.json"),
        de: import.meta.glob("/src/lib/locales/de/equipItems.json"),
        es: import.meta.glob("/src/lib/locales/es/equipItems.json"),
        fr: import.meta.glob("/src/lib/locales/fr/equipItems.json"),
        id: import.meta.glob("/src/lib/locales/id/equipItems.json"),
        it: import.meta.glob("/src/lib/locales/it/equipItems.json"),
        ja: import.meta.glob("/src/lib/locales/ja/equipItems.json"),
        ko: import.meta.glob("/src/lib/locales/ko/equipItems.json"),
        pt: import.meta.glob("/src/lib/locales/pt/equipItems.json"),
        th: import.meta.glob("/src/lib/locales/th/equipItems.json"),
        vi: import.meta.glob("/src/lib/locales/vi/equipItems.json"),
        zhcn: import.meta.glob("/src/lib/locales/zhcn/equipItems.json"),
        zhtw: import.meta.glob("/src/lib/locales/zhtw/equipItems.json"),
    } as const;

    let foodDetailLocale: { desc: string } | null = null;
    let equipDetailLocale: { desc: string; extraDesc: string } | null = null;

    $: loadLocales(item.gameId, $currentLocale);

    async function loadLocales(itemId: string, lang: string) {
        lang = lang || "en";
        const safeLang = lang.toLowerCase().replace("-", "");

        loadFoodDetails(itemId, safeLang);
        loadEquipDetails(itemId, safeLang);
    }

    async function loadFoodDetails(itemId: string, safeLang: string) {
        const foodLocalePath = `/src/lib/locales/${safeLang}/usableItems.json`;
        const foodFallbackPath = `/src/lib/locales/en/usableItems.json`;

        let foodLoader = foodLocaleModules[safeLang]?.[foodLocalePath];

        if (!foodLoader) {
            foodLoader = foodLocaleModules["en"]?.[foodFallbackPath];
        }

        const mod = await foodLoader() as any;
        const locales = mod.default || mod;

        foodDetailLocale = locales[itemId];
    }

    async function loadEquipDetails(itemId: string, safeLang: string) {
        const equipLocalePath = `/src/lib/locales/${safeLang}/equipItems.json`;
        const equipFallbackPath = `/src/lib/locales/en/equipItems.json`;

        let equipLoader = equipLocaleModules[safeLang]?.[equipLocalePath];

        if (!equipLoader) {
            equipLoader = equipLocaleModules["en"]?.[equipFallbackPath];
        }

        const mod = await equipLoader() as any;
        const locales = mod.default || mod;

        equipDetailLocale = locales[itemId];
    }

    function parseFoodDesc(food: IBoardable, desc: string): string {
        let raw = desc;

        const parser = new RichTextParamParser(key => food.getValue(key));

        raw = raw.replace(RichTextParamParser.REGEX, (match, expr) => {
            return parser.parseSafe(expr);
        });

        return raw;
    }

    function getFoodBBValue(food: IFood, key: string, ns: string | null): number {
        let buff: IFoodBuff;

        if (ns) {
            buff = food.getBuff(ns)!;
        } else {
            buff = food.buffs[0];
        }

        return buff.getBBEntry(key)!.value;
    }

    let rarityColor: string;

    $: rarityColor = getRarityColor(item.rarity);
</script>

<div class="md:px-1 md:py-1 pb-10 font-sans transition-colors">

    <div
        class="w-full max-w-[1500px] mx-auto grid grid-cols-1 gap-8 items-start"
        class:xl:grid-cols-12={!inColumn}
    >

        <div
            class="col-span-1 flex flex-col gap-6 {
                inColumn
                    ? 'w-full'
                    : 'xl:col-span-7'
            }"
        >

            <div class="bg-white dark:bg-[#2b2b2b] rounded-3xl flex flex-col overflow-hidden border border-gray-200 dark:border-[#444] transition-colors shadow-sm">

                <div class="relative min-h-[230px] flex p-6 overflow-hidden bg-white dark:bg-[#2b2b2b]">

                    <div
                        class="absolute inset-0 z-0 pointer-events-none card-gradient"
                        style="--rarity-color: {rarityColor};"
                    ></div>

                    <div
                        class="absolute right-[-25px] md:right-[0px] top-1/2 -translate-y-1/2 w-[240px] h-[240px] md:w-[280px] md:h-[280px] z-10 pointer-events-none"
                    >
                        <Image
                            id={item.icon.iconId}
                            variant={item.icon.imageVariant}
                            interactive={true}
                            className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)] transform-gpu scale-100"
                        />
                    </div>

                    <div class="relative z-20 gap-1 flex flex-col h-full w-[65%]">

                        <h1 class="font-sdk text-3xl md:text-4xl font-bold text-[#21272C] dark:text-[#FDFDFD] leading-tight drop-shadow-sm mb-3">
                            {$t(item.i18nKey)}
                        </h1>

                        <div class="flex items-center gap-3 mb-6">

                            <div class="flex">

                                {#each Array(item.rarity) as _}
                                    <Icon
                                        name="star"
                                        class="w-8 h-8"
                                        style="color: {rarityColor};"
                                    />
                                {/each}

                            </div>

                        </div>

                    </div>

                </div>

                <div class="px-6 pb-5 flex flex-col gap-1 mt-4">

                    {#if foodDetailLocale}

                        <div class="pl-1 text-gray-700 dark:text-[#E0E0E0] whitespace-pre-wrap text-[14px] leading-relaxed">

                            {@html parseRichText(parseFoodDesc(item, foodDetailLocale.desc))}

                        </div>

                    {/if}

                    {#if item.buffs.length > 0}

                        <h2 class="text-xl font-bold text-[#21272C] dark:text-[#FDFDFD] font-sdk pb-2 mt-4 mb-2">
                            {$t("stats.effects")}
                        </h2>

                        <div class="flex flex-col gap-3 pl-6">

                            {#each item.buffs as buff}

                                <div class="flex flex-col gap-1">

                                    <div class="flex flex-row items-center gap-2">

                                        <Icon
                                            name="circle"
                                            class="w-3 h-3 text-[#888888]"
                                        />

                                        <h3 class="font-medium text-[#21272C] dark:text-[#E4E4E4] text-[15px] leading-tight">
                                            {$t(buff.i18nKey)}
                                        </h3>

                                    </div>

                                    <div class="flex flex-col gap-1 pl-5">

                                        {#each buff.blackboard as entry}

                                            {#if entry.displayable}

                                                <span class="text-[14px] text-gray-700 dark:text-[#A0A0A0]">
                                                    {$t(entry.i18nKey)}: {entry.getFormattedValue()}
                                                </span>

                                            {/if}

                                        {/each}

                                    </div>

                                </div>

                            {/each}

                        </div>

                    {/if}

                </div>

            </div>

            {#if item.tactical}

                {@const tactical = item.tactical}

                <div class="bg-white dark:bg-[#2b2b2b] rounded-3xl flex flex-col overflow-hidden border border-gray-200 dark:border-[#444] transition-colors shadow-sm">

                    <div class="px-6 pb-5 flex flex-col gap-1 mt-4">

                        <h2 class="text-2xl font-bold text-[#21272C] dark:text-[#FDFDFD] font-sdk border-b border-gray-100 dark:border-[#444] pb-3 mb-4">
                            {$t("page.food.tactical")}
                        </h2>

                        {#if equipDetailLocale}

                            <div class="pl-1 text-gray-700 dark:text-[#E0E0E0] whitespace-pre-wrap text-[14px] leading-relaxed mb-4">

                                {@html parseRichText(parseFoodDesc(tactical, equipDetailLocale.extraDesc))}

                            </div>

                        {/if}

                        <div class="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">

                            {#each tactical.getDetailList($t) as node}

                                <div class="flex flex-col">

                                    <span class="text-xs text-gray-500 dark:text-[#A0A0A0] font-bold uppercase">
                                        {node.key}
                                    </span>

                                    <span class="text-lg font-bold text-[#21272C] dark:text-[#FDFDFD] truncate">
                                        {node.value}
                                    </span>

                                </div>

                            {/each}

                        </div>

                    </div>

                </div>

            {/if}

        </div>

    </div>

</div>

<style>
    .card-gradient {
        background: linear-gradient(
                to right,
                #ffffff 20%,
                var(--rarity-color) 100%
        );
        opacity: 0.9;
    }
    :global(.dark) .card-gradient {
        background: linear-gradient(
                to right,
                #383838 20%,
                var(--rarity-color) 100%
        );
        opacity: 0.85;
    }
</style>
