<script lang="ts">
    import type { IBoardable } from "$lib/classes/gameData/IBoardable";
    import type { IFood } from "$lib/classes/gameData/items/food/IFood";
    import { RichTextParamParser } from "$lib/classes/richText/expressions/RichTextParamParser";
    import Icon from "$lib/components/Icon.svelte";
    import Image from "$lib/components/Image.svelte";
    import { craftableItemsList } from "$lib/data/crafts/craftableItemsList";
    import { t } from "$lib/i18n";
    import { currentLocale } from "$lib/stores/locale";
    import { getRarityColor } from "$lib/utils/colorUtils";
    import { hyperlinkAction, parseRichText } from "$lib/utils/richText";
    import { changelogData } from "$lib/data/versions.js";
    import { RecipeDataStorage } from "$lib/classes/storages/recipes/RecipeDataStorage";
    import { machineCraftDataStorage } from "$lib/dataStorages/crafts/machineCraftDataStorage";
    import { manualCraftDataStorage } from "$lib/dataStorages/crafts/manualCraftDataStorage";
    import { hubCraftDataStorage } from "$lib/dataStorages/crafts/hubCraftDataStorage";
    import { buildings } from "$lib/data/buildings/buildings";
    import RecipeFormula from "$lib/components/recipes/formulas/RecipeFormula.svelte";
    import ItemStackCard from "$lib/components/cards/ItemStackCard.svelte";
    import ResourcePointCard from "$lib/components/cards/ResourcePointCard.svelte";
    import { CardSize } from "$lib/components/cards/CardSize";
    import { itemStorage } from "$lib/dataStorages/items/itemStorage";
    import { gasEnvStorage } from "$lib/dataStorages/gasEnv/gasEnvStorage";
    import { openItemModal } from "$lib/stores/itemModal";
    import { getImagePath } from "$lib/utils/imageUtils.js";
    import type { IGasEnv } from "$lib/classes/gameData/gasEnv/IGasEnv";
    import type { IResourcePoint } from "$lib/classes/gameData/resourcePoints/IResourcePoint";

    export let item: IFood;

    export let inColumn: boolean = false;
    export let showSelfLink: boolean = false;

    let copiedImageId: string | null = null;

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

    function parseFoodDesc(desc: string): string {
        return parseBoardableDesc(item, desc);
    }

    function parseBoardableDesc(food: IBoardable, desc: string): string {
        let raw = desc;

        const parser = new RichTextParamParser(key => food.getValue(key));

        raw = raw.replace(RichTextParamParser.REGEX, (match, expr) => {
            return parser.parseSafe(expr);
        });

        return raw;
    }

    let rarityColor: string;
    let hasRecipe: boolean;

    $: rarityColor = getRarityColor(item.rarity);
    $: hasRecipe = craftableItemsList.includes(item.gameId);

    const machineRecipeStorage = new RecipeDataStorage(machineCraftDataStorage.list);
    const manualRecipeStorage = new RecipeDataStorage(manualCraftDataStorage.list);
    const hubRecipeStorage = new RecipeDataStorage(hubCraftDataStorage.list);

    interface FoodRecipe {
        id: string;
        type: 'machine' | 'manual' | 'hub';
        buildingNameKey?: string;
        buildingIconId?: string;
        craftTimeMs?: number;
        gasEnv?: IGasEnv | null;
        resourcePoint?: IResourcePoint | null;
        ingredients: ReadonlyArray<{ itemId: string; count: number }>;
        outcomes: ReadonlyArray<{ itemId: string; count: number }>;
    }

    function getItemRecipes(id: string | null | undefined): FoodRecipe[] {
        if (!id) return [];
        const result: FoodRecipe[] = [];

        for (const f of machineRecipeStorage.asOutcome.get(id) || []) {
            const b = buildings[f.buildingId];
            result.push({
                id: f.id,
                type: 'machine',
                buildingNameKey: b ? `itemNames.${b.itemId}` : undefined,
                buildingIconId: b?.iconId,
                craftTimeMs: f.craftTimeMs,
                gasEnv: f.gasEnv ? (gasEnvStorage.byId.get(f.gasEnv) ?? null) : null,
                ingredients: f.ingredients || [],
                outcomes: f.outcomes || [],
            });
        }

        for (const f of manualRecipeStorage.asOutcome.get(id) || []) {
            result.push({
                id: f.id,
                type: 'manual',
                buildingNameKey: 'formulaSidebar.craftSource.manual',
                craftTimeMs: undefined,
                gasEnv: null,
                ingredients: f.ingredients || [],
                outcomes: f.outcomes || [],
            });
        }

        for (const f of hubRecipeStorage.asOutcome.get(id) || []) {
            result.push({
                id: f.id,
                type: 'hub',
                buildingNameKey: 'formulaSidebar.craftSource.hub',
                craftTimeMs: undefined,
                gasEnv: null,
                ingredients: f.ingredients || [],
                outcomes: f.outcomes || [],
            });
        }

        return result;
    }

    $: itemRecipes = getItemRecipes(item?.gameId);
    $: addedVersion = changelogData.find((v) => v.items?.includes(item.gameId))?.version || (item ? "1.0" : null);
</script>

<div class="md:py-1 pb-10 font-sans transition-colors">

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
                            className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)] transform-gpu scale-100"
                            id={item.icon.iconId}
                            interactive={true}
                            variant={item.icon.imageVariant}
                        />
                    </div>

                    <div class="absolute top-4 right-4 z-20 flex flex-col gap-2">
                        <button
                            class="flex items-center justify-center w-8 h-8 bg-black/60 hover:bg-[#FFD800] text-white hover:text-black backdrop-blur rounded-full transition-all duration-300 shadow-md group/copy cursor-pointer"
                            title={copiedImageId === "icon" ? $t("common.copied") : $t("common.copy")}
                            on:click|stopPropagation={async () => {
                                try {
                                    const imageUrl = getImagePath(item.icon.iconId, item.icon.imageVariant);
                                    const response = await fetch(imageUrl);
                                    const blob = await response.blob();
                                    await navigator.clipboard.write([
                                        new ClipboardItem({
                                            [blob.type]: blob,
                                        }),
                                    ]);

                                    copiedImageId = "icon";
                                    setTimeout(() => {
                                        if (copiedImageId === "icon")
                                            copiedImageId = null;
                                    }, 2000);
                                } catch (err) {
                                    console.error("Error copying:", err);
                                }
                            }}
                        >
                            {#if copiedImageId === "icon"}
                                <Icon name="success" class="w-3.5 h-3.5 text-yellow-400" />
                            {:else}
                                <Icon name="copy" class="w-3.5 h-3.5 transition-transform group-hover/copy:scale-110" />
                            {/if}
                        </button>

                        <button
                            class="flex items-center justify-center w-8 h-8 bg-black/60 hover:bg-[#FFD800] text-white hover:text-black backdrop-blur rounded-full transition-all duration-300 shadow-md group/down cursor-pointer"
                            title={$t("profile.download_png")}
                            on:click|stopPropagation={() => {
                                const link = document.createElement("a");
                                link.href = getImagePath(item.icon.iconId, item.icon.imageVariant);
                                link.download = `${item.gameId || item.icon.iconId}_food.png`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                            }}
                        >
                            <Icon name="import" class="w-4 h-4 transition-transform group-hover/down:scale-110" />
                        </button>
                    </div>

                    <div class="relative z-20 gap-1 flex flex-col h-full w-[65%]">

                        <svelte:element
                            class="font-sdk text-3xl md:text-4xl font-bold text-[#21272C] dark:text-[#FDFDFD] leading-tight drop-shadow-sm mb-3"
                            class:hover:underline={showSelfLink}
                            href={showSelfLink ? `/food/${item.gameId}` : undefined}
                            this={showSelfLink ? "a" : "h2"}
                        >
                            {$t(item.i18nKey)}
                        </svelte:element>

                        <div class="flex items-center gap-3 mb-6">

                            <div class="flex items-center gap-3">
                                <div class="w-9 h-9 rounded bg-[#21272C] flex items-center justify-center shadow-sm min-w-[35px]">
                                    <Icon name="usableItem" class="w-6 h-6 text-white" />
                                </div>
                                <span class="text-[15px] font-bold text-[#21272C] dark:text-[#E4E4E4]">
                                    {$t("sort.usable")}
                                </span>
                            </div>
                            <div class="w-[2px] h-6 bg-gray-300 dark:bg-[#555] rounded"></div>

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

                <div class="px-6 pb-5 flex flex-col gap-4 mt-4">

                    {#if foodDetailLocale}
                        <div class="flex flex-col gap-0.5">

                            <span class="text-lg text-[#21272C] dark:text-[#FDFDFD] font-bold font-sdk">
                                {$t("sort.usageEffect")}
                            </span>

                            <div
                                class="text-gray-700 dark:text-[#E0E0E0] whitespace-pre-wrap text-[14px] leading-relaxed"
                                use:hyperlinkAction
                            >

                                {@html parseRichText(parseFoodDesc(foodDetailLocale.desc))}

                            </div>

                        </div>

                    {/if}

                    <div class="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">

                        {#each item.getDetailList($t) as node}

                            <div class="flex flex-col gap-0.5">

                                <span class="text-lg text-[#21272C] dark:text-[#FDFDFD] font-bold font-sdk">
                                    {node.key}
                                </span>

                                <span class="text-gray-700 dark:text-[#E0E0E0] whitespace-pre-wrap text-[14px] leading-relaxed">
                                        {node.value}
                                </span>

                            </div>

                        {/each}

                    </div>

                    {#if item.buffs.length > 0}

                        <div>

                            <h2 class="text-lg font-bold text-[#21272C] dark:text-[#FDFDFD] font-sdk pb-1.5">
                                {$t("stats.effects")}
                            </h2>

                            <div class="flex flex-col gap-2.5 pl-2">

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
                                                    - {$t(entry.i18nKey)}:
                                                    <span class="text-[#22bbff] font-bold">
                                                        {entry.getFormattedValue($t)}
                                                    </span>
                                                </span>

                                                {/if}

                                            {/each}

                                        </div>

                                    </div>

                                {/each}

                            </div>

                        </div>

                    {/if}

                    {#if addedVersion}
                        <div class="flex justify-end pt-1">
                            <a
                                href="/changelog?version={addedVersion}"
                                class="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                {$t("systemNames.addedInVersion", { version: addedVersion })}
                            </a>
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

                            <div
                                class="text-gray-700 dark:text-[#E0E0E0] whitespace-pre-wrap text-[14px] leading-relaxed mb-4"
                                use:hyperlinkAction
                            >

                                {@html parseRichText(parseBoardableDesc(tactical, equipDetailLocale.extraDesc))}

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

        <div
            class="col-span-1 flex flex-col gap-6 {
                inColumn
                    ? 'w-full'
                    : 'xl:col-span-5'
            }"
        >

            {#if itemRecipes.length > 0}
                <div class="bg-white dark:bg-[#2b2b2b] rounded-3xl flex flex-col overflow-hidden border border-gray-200 dark:border-[#444] transition-colors shadow-sm">
                    <div class="px-6 pb-5 flex flex-col gap-3 mt-4">
                        <div class="flex items-center justify-between border-b border-gray-100 dark:border-[#444] pb-3 mb-1">
                            <h2 class="text-2xl font-bold text-[#21272C] dark:text-[#FDFDFD] font-sdk">
                                {$t("page.food.recipe")}
                            </h2>
                            <div class="flex items-center gap-3">
                                <a
                                    href={`/recipes/tree?itemId=${item.gameId}`}
                                    class="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-[#FFD800] hover:underline"
                                >
                                    <span>{$t("pages.recipeTree")}</span>
                                    <Icon name="sendToLink" class="w-3.5 h-3.5" />
                                </a>
                                <a
                                    href={`/recipes?id=${item.gameId}`}
                                    class="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-[#FFD800] hover:underline"
                                >
                                    <span>{$t("pages.recipes")}</span>
                                    <Icon name="sendToLink" class="w-3.5 h-3.5" />
                                </a>
                            </div>
                        </div>

                        <div class="flex flex-col gap-2.5">
                            {#each itemRecipes as recipe (recipe.id)}
                                <div class="bg-gray-50 dark:bg-[#242424] border border-gray-200 dark:border-[#444444] rounded-2xl p-3 flex flex-col gap-2">
                                    {#if recipe.buildingNameKey || recipe.buildingIconId}
                                        <div class="flex items-center gap-1.5 text-xs text-gray-500 dark:text-[#aaaaaa] font-medium">
                                            {#if recipe.buildingIconId}
                                                <div class="w-4 h-4 shrink-0 flex items-center justify-center overflow-hidden">
                                                    <Image
                                                        id={recipe.buildingIconId}
                                                        variant="building-icon"
                                                        className="w-full h-full object-contain"
                                                        width={16}
                                                        height={16}
                                                    />
                                                </div>
                                            {/if}
                                            {#if recipe.buildingNameKey}
                                                <span class="font-sdk text-gray-700 dark:text-gray-300">
                                                    {$t(recipe.buildingNameKey)}
                                                </span>
                                            {/if}
                                        </div>
                                    {/if}

                                    <div class="overflow-x-auto py-0.5">
                                        <RecipeFormula
                                            processTimeMs={recipe.craftTimeMs}
                                            gasEnv={recipe.gasEnv}
                                        >
                                            <div slot="left" class="flex flex-row items-center gap-2 h-full">
                                                {#if recipe.resourcePoint}
                                                    <div class="shrink-0">
                                                        <ResourcePointCard
                                                            resourcePoint={recipe.resourcePoint}
                                                            size={CardSize.MICRO}
                                                            showTooltip={true}
                                                        />
                                                    </div>
                                                    {#if recipe.ingredients.length > 0}
                                                        <span class="font-sdk text-base text-gray-500 dark:text-gray-400 select-none">
                                                            +
                                                        </span>
                                                    {/if}
                                                {/if}

                                                {#each recipe.ingredients as ing, idx (ing.itemId)}
                                                    {@const ingItem = itemStorage.byGameId.get(ing.itemId)}
                                                    {#if idx > 0}
                                                        <span class="font-sdk text-base text-gray-500 dark:text-gray-400 select-none">
                                                            +
                                                        </span>
                                                    {/if}
                                                    {#if ingItem}
                                                        <button
                                                            type="button"
                                                            class="shrink-0 cursor-pointer text-left focus:outline-none"
                                                            on:click={() => openItemModal(ing.itemId)}
                                                        >
                                                            <ItemStackCard
                                                                item={ingItem}
                                                                amount={ing.count}
                                                                size={CardSize.MICRO}
                                                                showTooltip={true}
                                                                showHoverEffect={true}
                                                            />
                                                        </button>
                                                    {:else}
                                                        <button
                                                            type="button"
                                                            class="w-[60px] h-[60px] shrink-0 flex flex-col items-center justify-center p-1 bg-white dark:bg-[#383838] border border-gray-200 dark:border-[#444444] rounded-[6px] relative cursor-pointer"
                                                            on:click={() => openItemModal(ing.itemId)}
                                                        >
                                                            <Image id={ing.itemId} variant="item-game" className="w-8 h-8 object-contain" interactive={false} width={32} height={32} />
                                                            <span class="text-[10px] font-semibold text-amber-600 dark:text-[#FFD800]">×{ing.count}</span>
                                                        </button>
                                                    {/if}
                                                {/each}
                                            </div>

                                            <div slot="right" class="flex flex-row items-center gap-2 h-full">
                                                {#each recipe.outcomes as outcome, idx (outcome.itemId)}
                                                    {@const outcomeItem = itemStorage.byGameId.get(outcome.itemId)}
                                                    {#if idx > 0}
                                                        <span class="font-sdk text-base text-gray-500 dark:text-gray-400 select-none">
                                                            +
                                                        </span>
                                                    {/if}
                                                    {#if outcomeItem}
                                                        <button
                                                            type="button"
                                                            class="shrink-0 cursor-pointer text-left focus:outline-none"
                                                            on:click={() => openItemModal(outcome.itemId)}
                                                        >
                                                            <ItemStackCard
                                                                item={outcomeItem}
                                                                amount={outcome.count}
                                                                size={CardSize.MICRO}
                                                                showTooltip={true}
                                                                showHoverEffect={true}
                                                            />
                                                        </button>
                                                    {:else}
                                                        <button
                                                            type="button"
                                                            class="w-[60px] h-[60px] shrink-0 flex flex-col items-center justify-center p-1 bg-white dark:bg-[#383838] border border-gray-200 dark:border-[#444444] rounded-[6px] relative cursor-pointer"
                                                            on:click={() => openItemModal(outcome.itemId)}
                                                        >
                                                            <Image id={outcome.itemId} variant="item-game" className="w-8 h-8 object-contain" interactive={false} width={32} height={32} />
                                                            <span class="text-[10px] font-semibold text-amber-600 dark:text-[#FFD800]">×{outcome.count}</span>
                                                        </button>
                                                    {/if}
                                                {/each}
                                            </div>
                                        </RecipeFormula>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    </div>
                </div>
            {:else if hasRecipe}
                <div class="bg-white dark:bg-[#2b2b2b] rounded-3xl flex flex-col overflow-hidden border border-gray-200 dark:border-[#444] transition-colors shadow-sm">
                    <div class="px-6 pb-5 flex flex-col gap-1 mt-4">
                        <h2 class="text-2xl font-bold text-[#21272C] dark:text-[#FDFDFD] font-sdk border-b border-gray-100 dark:border-[#444] pb-3 mb-4">
                            {$t("page.food.recipe")}
                        </h2>

                        <a
                            class="flex flex-row items-center gap-2 py-2 px-6 rounded-full w-fit font-sdk text-xl text-[#21272c] bg-[#f9b90c] hover:bg-[#ffc01e]"
                            href="/recipes?id={item.gameId}"
                        >
                            <span>
                                {$t("page.food.openRecipe")}
                            </span>
                            <Icon
                                name="sendToLink"
                                class="w-5 h-5"
                            />
                        </a>
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
