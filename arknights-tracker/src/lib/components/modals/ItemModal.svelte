<script lang="ts">
    import { t } from "$lib/i18n";
    import { currentLocale } from "$lib/stores/locale";
    import { selectedItemId, closeItemModal, openItemModal } from "$lib/stores/itemModal";
    import { items } from "$lib/data/items/items";
    import { characters } from "$lib/data/characters.js";
    import { getRarityColor } from "$lib/utils/colorUtils.js";
    import { parseRichText } from "$lib/utils/richText.js";
    import Image from "$lib/components/Image.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import OperatorCard from "$lib/components/cards/OperatorCard.svelte";
    import WeaponCard from "$lib/components/cards/WeaponCard.svelte";
    import Modal from "$lib/components/modals/Modal.svelte";
    import Button from "$lib/components/Button.svelte";
    import { weapons } from "$lib/data/weapons.js";
    import { enemies, enemyVariantMap } from "$lib/data/enemies.js";
    import { RecipeDataStorage } from "$lib/classes/storages/recipes/RecipeDataStorage";
    import { machineCraftDataStorage } from "$lib/dataStorages/crafts/machineCraftDataStorage";
    import { manualCraftDataStorage } from "$lib/dataStorages/crafts/manualCraftDataStorage";
    import { hubCraftDataStorage } from "$lib/dataStorages/crafts/hubCraftDataStorage";
    import { buildings } from "$lib/data/buildings/buildings";
    import RecipeFormula from "$lib/components/recipes/formulas/RecipeFormula.svelte";
    import ItemStackCard from "$lib/components/cards/ItemStackCard.svelte";
    import ResourcePointCard from "$lib/components/cards/ResourcePointCard.svelte";
    import { itemObtainIcons } from "$lib/data/items/itemObtainIcons";
    import { chests } from "$lib/data/items/chests";
    import { CardSize } from "$lib/components/cards/CardSize";
    import { changelogData } from "$lib/data/versions.js";
    import { itemStorage } from "$lib/dataStorages/items/itemStorage";
    import { gasEnvStorage } from "$lib/dataStorages/gasEnv/gasEnvStorage";
    import { minerStorage } from "$lib/dataStorages/buildings/minerStorage";
    import { gasMinerStorage } from "$lib/dataStorages/buildings/gasMinerStorage";
    import { pumpStorage } from "$lib/dataStorages/buildings/pumpStorage";
    import type { IGasEnv } from "$lib/classes/gameData/gasEnv/IGasEnv";
    import type { IResourcePoint } from "$lib/classes/gameData/resourcePoints/IResourcePoint";

    const machineRecipeStorage = new RecipeDataStorage(machineCraftDataStorage.list);
    const manualRecipeStorage = new RecipeDataStorage(manualCraftDataStorage.list);
    const hubRecipeStorage = new RecipeDataStorage(hubCraftDataStorage.list);

    interface ModalRecipe {
        id: string;
        type: 'machine' | 'manual' | 'hub' | 'mining' | 'pump';
        buildingNameKey?: string;
        buildingIconId?: string;
        craftTimeMs?: number;
        gasEnv?: IGasEnv | null;
        resourcePoint?: IResourcePoint | null;
        ingredients: ReadonlyArray<{ itemId: string; count: number }>;
        outcomes: ReadonlyArray<{ itemId: string; count: number }>;
    }

    interface ItemLocaleData {
        name: string;
        type: string;
        desc: string;
        decoDesc: string;
        obtainWays: string[];
    }

    const localeLoaders: Record<string, () => Promise<any>> = import.meta.glob("/src/lib/locales/*/items.json");

    let currentItemLocale: ItemLocaleData | null = null;
    let copiedSuccess = false;

    const latestVersion = [...changelogData].sort((a, b) =>
        b.version.localeCompare(a.version, undefined, { numeric: true })
    )[0];
    const latestItems = new Set(latestVersion?.items || []);

    $: itemId = $selectedItemId;
    $: isNew = itemId ? latestItems.has(itemId) : false;
    $: isOpen = Boolean(itemId);
    $: itemData = itemId ? items[itemId] : null;
    $: rarity = itemData?.rarity || 3;
    $: rarityColor = getRarityColor(rarity);

    $: if (itemId && $currentLocale) {
        loadLocale(itemId, $currentLocale);
    }

    async function loadLocale(id: string, lang: string) {
        const safeLang = lang ? lang.toLowerCase().replace("-", "") : "en";
        const path = `/src/lib/locales/${safeLang}/items.json`;
        const fallbackPath = `/src/lib/locales/en/items.json`;

        const loader = localeLoaders[path] || localeLoaders[fallbackPath];
        if (loader) {
            try {
                const mod = await loader();
                const dict = mod.default || mod;
                currentItemLocale = dict[id] || null;
            } catch {
                currentItemLocale = null;
            }
        } else {
            currentItemLocale = null;
        }
    }

    $: itemName = currentItemLocale?.name || (itemId ? $t(`itemNames.${itemId}`) : "");
    $: itemType = currentItemLocale?.type || "";
    $: itemDesc = currentItemLocale?.desc || "";
    $: itemDecoDesc = currentItemLocale?.decoDesc || "";
    $: obtainWays = currentItemLocale?.obtainWays || [];

    $: usedByChars = itemData?.usedByChars || [];
    $: charObjects = usedByChars
        .map((charId: string) => {
            const found = (characters as Record<string, any>)[charId] || Object.values(characters).find((c: any) => c.id === charId || c.gameId === charId);
            return found || null;
        })
        .filter(Boolean);

    $: usedByWeapons = itemData?.usedByWeapons || [];
    $: weaponObjects = [
        ...usedByWeapons
            .map((wId: string) => (weapons as Record<string, any>)[wId] || Object.values(weapons).find((w: any) => w.id === wId || w.gameId === wId) || null),
        ...Object.values(weapons).filter((w: any) => w.isForesight && w.materials && (w.materials.includes(itemId) || (itemData?.id && w.materials.includes(itemData.id))))
    ].filter((w, idx, self) => w && self.findIndex((other: any) => other?.id === w.id) === idx);

    $: droppedByEnemies = (itemData?.droppedByEnemies || []).filter((enemyId: string) => {
        const baseId = (enemyVariantMap as Record<string, any>)[enemyId]?.baseId || enemyId;
        const enemy = (enemies as Record<string, any>)[baseId];
        return enemy?.rarity !== undefined || $t(`enemies.${baseId}`) !== `enemies.${baseId}`;
    });

    $: itemRecipes = getItemRecipes(itemId);

    function getItemRecipes(id: string | null): ModalRecipe[] {
        if (!id) return [];
        const result: ModalRecipe[] = [];

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

        const miners = minerStorage.byMineableId.get(id) || [];
        for (const miner of miners) {
            const recipe = miner.getRecipe(id);
            if (!recipe) continue;
            result.push({
                id: `${miner.gameId}_${id}`,
                type: 'mining',
                buildingNameKey: miner.i18nKey,
                buildingIconId: miner.icon?.iconId,
                craftTimeMs: recipe.processTimeMs,
                resourcePoint: recipe.resourcePoint,
                ingredients: recipe.ingredients.map(ing => ({ itemId: ing.item.gameId, count: ing.count })),
                outcomes: recipe.outcomes.map(out => ({ itemId: out.item.gameId, count: out.count })),
            });
        }

        const gasMiners = gasMinerStorage.byMineableId.get(id) || [];
        for (const miner of gasMiners) {
            const recipe = miner.getRecipe(id);
            if (!recipe) continue;
            result.push({
                id: `${miner.gameId}_${id}`,
                type: 'mining',
                buildingNameKey: miner.i18nKey,
                buildingIconId: miner.icon?.iconId,
                craftTimeMs: recipe.processTimeMs,
                resourcePoint: recipe.resourcePoint,
                ingredients: recipe.ingredients.map(ing => ({ itemId: ing.item.gameId, count: ing.count })),
                outcomes: recipe.outcomes.map(out => ({ itemId: out.item.gameId, count: out.count })),
            });
        }

        const pumps = pumpStorage.byEnableLiquidId.get(id) || [];
        for (const pump of pumps) {
            const recipe = pump.getRecipe(id);
            if (!recipe) continue;
            result.push({
                id: `${pump.gameId}_${id}`,
                type: 'pump',
                buildingNameKey: pump.i18nKey,
                buildingIconId: pump.icon?.iconId,
                craftTimeMs: recipe.processTimeMs,
                resourcePoint: recipe.resourcePoint,
                ingredients: recipe.ingredients.map(ing => ({ itemId: ing.item.gameId, count: ing.count })),
                outcomes: recipe.outcomes.map(out => ({ itemId: out.item.gameId, count: out.count })),
            });
        }

        return result;
    }

    $: usedInRecipes = getUsedInRecipes(itemId);

    function getUsedInRecipes(id: string | null): ModalRecipe[] {
        if (!id) return [];
        const result: ModalRecipe[] = [];

        for (const f of machineRecipeStorage.asIncome.get(id) || []) {
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

        for (const f of manualRecipeStorage.asIncome.get(id) || []) {
            result.push({
                id: f.id,
                type: 'manual',
                buildingNameKey: 'formulaSidebar.craftSource.manual',
                ingredients: f.ingredients || [],
                outcomes: f.outcomes || [],
            });
        }

        for (const f of hubRecipeStorage.asIncome.get(id) || []) {
            result.push({
                id: f.id,
                type: 'hub',
                buildingNameKey: 'formulaSidebar.craftSource.hub',
                ingredients: f.ingredients || [],
                outcomes: f.outcomes || [],
            });
        }

        const consumerMiners = minerStorage.byConsumeItemId.get(id) || [];
        for (const miner of consumerMiners) {
            for (const mineable of miner.mineableList) {
                if (mineable.consumeItem?.item.gameId === id) {
                    const recipe = miner.getRecipe(mineable.miningItem.gameId);
                    if (!recipe) continue;
                    result.push({
                        id: `${miner.gameId}_${mineable.miningItem.gameId}`,
                        type: 'mining',
                        buildingNameKey: miner.i18nKey,
                        buildingIconId: miner.icon?.iconId,
                        craftTimeMs: recipe.processTimeMs,
                        resourcePoint: recipe.resourcePoint,
                        ingredients: recipe.ingredients.map(ing => ({ itemId: ing.item.gameId, count: ing.count })),
                        outcomes: recipe.outcomes.map(out => ({ itemId: out.item.gameId, count: out.count })),
                    });
                }
            }
        }

        return result;
    }

    $: usedInOutcomeItems = (() => {
        const map = new Map<string, { id: string; count: number }>();
        for (const r of usedInRecipes) {
            for (const out of r.outcomes) {
                if (!map.has(out.itemId)) {
                    map.set(out.itemId, { id: out.itemId, count: out.count });
                }
            }
        }
        return Array.from(map.values());
    })();

    let itemHistory: string[] = [];
    $: canGoBack = itemHistory.length > 0;

    $: if (!itemId) {
        itemHistory = [];
    }

    function navigateToItem(id: string) {
        if (!id || id === itemId) return;
        if (itemId) {
            itemHistory = [...itemHistory, itemId];
        }
        openItemModal(id);
        const container = document.getElementById("item-modal-scroll-container");
        if (container) {
            container.scrollTop = 0;
        }
    }

    function handleBack() {
        if (itemHistory.length === 0) return;
        const previousId = itemHistory[itemHistory.length - 1];
        itemHistory = itemHistory.slice(0, -1);
        if (previousId) {
            openItemModal(previousId);
            const container = document.getElementById("item-modal-scroll-container");
            if (container) {
                container.scrollTop = 0;
            }
        }
    }

    $: iconId = itemData?.iconId || itemId;
    $: chestData = itemId ? chests[itemId] : null;

    async function copyImage() {
        if (!iconId) return;
        try {
            const imageUrl = `/images/items/${iconId}.png`;
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            await navigator.clipboard.write([
                new ClipboardItem({
                    [blob.type]: blob,
                }),
            ]);
            copiedSuccess = true;
            setTimeout(() => {
                copiedSuccess = false;
            }, 2000);
        } catch {
            copiedSuccess = false;
        }
    }

    function downloadImage() {
        if (!iconId) return;
        const link = document.createElement("a");
        link.href = `/images/items/${iconId}.png`;
        link.download = `${iconId}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
</script>

<Modal {isOpen} on:close={closeItemModal}>
    <div
        class="relative z-10 w-full max-w-[540px] max-h-[85vh] bg-white dark:bg-[#383838] text-[#21272C] dark:text-white rounded-3xl border border-gray-200 dark:border-[#444444] shadow-2xl flex flex-col overflow-hidden animate-fadeIn"
    >
        <div
            class="absolute top-0 left-0 right-0 h-24 sm:h-28 pointer-events-none z-0"
            style="background: linear-gradient(180deg, {rarityColor}40 0%, {rarityColor}12 70%, transparent 100%);"
        ></div>

        <button
            class="hover:bg-[#FACC15] text-white hover:text-[#21272C] absolute top-3.5 right-3.5 p-2 z-20 bg-black/30 rounded-full transition-colors backdrop-blur-md cursor-pointer"
            on:click={closeItemModal}
            aria-label="Close"
        >
            <Icon name="close" class="w-5 h-5" />
        </button>

        {#if isNew}
            <div
                class="absolute right-0 mr-[-3px] top-[68px] sm:top-[74px] h-[18px] sm:h-[20px] flex items-stretch z-30 pointer-events-none"
            >
                <div class="w-[3px] mr-[1.5px] bg-[#FFC107]/85 -skew-x-[24deg]"></div>
                <div class="w-[3px] mr-[1.5px] bg-[#FFC107]/85 -skew-x-[24deg]"></div>
                <div class="relative bg-[#FFC107]/85 pl-1 pr-1.5 -skew-x-[24deg] flex items-center justify-center">
                    <div class="absolute left-[-4px] w-[8px] top-0 bottom-0"></div>
                    <span class="relative z-10 text-[#111111] font-black text-[10px] sm:text-[11px] -skew-x-[-24deg] tracking-widest leading-none uppercase">
                        {$t("systemNames.new")}
                    </span>
                </div>
            </div>
        {/if}

        <div id="item-modal-scroll-container" class="overflow-y-auto custom-scrollbar p-6 relative z-10 flex flex-col gap-3">
            <div class="flow-root">
                <div class="float-right ml-4 mb-2 flex flex-col items-end select-none -mt-1 sm:-mt-2">
                    <div class="w-[120px] sm:w-[145px] aspect-square flex items-center justify-center">
                        <Image
                            id={iconId}
                            variant="item-game"
                            interactive={false}
                            className="w-full h-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.25)] dark:drop-shadow-[0_8px_20px_rgba(0,0,0,0.6)]"
                            alt={itemName}
                        />
                    </div>

                    <div class="flex items-center justify-end w-full gap-2">
                        <button
                            class="flex items-center justify-center w-8 h-8 bg-black/60 hover:bg-[#FFD800] text-white hover:text-black backdrop-blur rounded-full transition-all duration-300 shadow-md group/down cursor-pointer"
                            title={copiedSuccess ? $t("common.copied") : $t("common.copy")}
                            on:click|stopPropagation={copyImage}
                        >
                            {#if copiedSuccess}
                                <Icon name="success" class="w-3.5 h-3.5 text-yellow-500 dark:text-yellow-400" />
                            {:else}
                                <Icon name="copy" class="w-3.5 h-3.5" />
                            {/if}
                        </button>

                        <button
                            class="flex items-center justify-center w-8 h-8 bg-black/60 hover:bg-[#FFD800] text-white hover:text-black backdrop-blur rounded-full transition-all duration-300 shadow-md group/down cursor-pointer"
                            title={$t("profile.download_png")}
                            on:click|stopPropagation={downloadImage}
                        >
                            <Icon name="import" class="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {#if canGoBack}
                    <div class="mb-1 w-fit">
                        <Button
                            variant="roundSmall"
                            color="white"
                            onClick={handleBack}
                        >
                            <Icon name="arrowLeft" class="w-5 h-5" />
                        </Button>
                    </div>
                {/if}

                <h2 class="text-2xl font-bold font-sdk text-[#21272C] dark:text-white leading-tight break-words pr-2">
                    {itemName}
                </h2>

                {#if itemType}
                    <div class="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
                        {itemType}
                    </div>
                {/if}

                <div class="flex items-center gap-1 mt-1 mb-2">
                    {#each Array(rarity) as _}
                        <Icon name="star" class="w-6 h-6 shrink-0" style="color: {rarityColor};" />
                    {/each}
                </div>

                {#if itemDesc}
                    <div class="text-sm text-gray-700 dark:text-gray-200 leading-relaxed break-words">
                        {@html parseRichText(itemDesc)}
                    </div>
                {/if}

                {#if itemDecoDesc}
                    <div class="text-sm text-gray-500 dark:text-[#888888] leading-relaxed break-words mt-2.5">
                        {@html parseRichText(itemDecoDesc)}
                    </div>
                {/if}
            </div>

            {#if chestData}
                <div class="flex flex-col gap-2.5">
                    <div class="flex items-center justify-between">
                        <h3 class="font-bold text-[#21272C] dark:text-white font-sdk">
                            {chestData.type > 0 && chestData.selectedCount > 0
                                ? $t("itemModal.chestChoices")
                                : $t("itemModal.chestContents")}
                        </h3>
                        {#if chestData.type > 0 && chestData.selectedCount > 0}
                            <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-[#FFD800] border border-amber-500/20">
                                {$t("itemModal.selectCount", { count: chestData.selectedCount })}
                            </span>
                        {/if}
                    </div>

                    <div class="flex flex-wrap gap-2.5">
                        {#each chestData.options as opt}
                            {#if opt.length === 1}
                                {@const optItem = opt[0]}
                                {#if optItem.type === "weapon"}
                                    {@const wObj = (weapons as Record<string, any>)[optItem.id] || Object.values(weapons).find((w: any) => w.id === optItem.id || w.gameId === optItem.id)}
                                    <a
                                        href={`/weapons/${optItem.id}`}
                                        class="block w-[72px] sm:w-[80px] aspect-square shrink-0 cursor-pointer"
                                        on:click={closeItemModal}
                                    >
                                        <WeaponCard
                                            weapon={wObj || { id: optItem.id }}
                                            variant="small"
                                            asLink={false}
                                            className="w-full h-full"
                                        />
                                    </a>
                                {:else if optItem.type === "character"}
                                    {@const cObj = (characters as Record<string, any>)[optItem.id] || Object.values(characters).find((c: any) => c.id === optItem.id || c.gameId === optItem.id)}
                                    <a
                                        href={`/operators/${optItem.id}`}
                                        class="block w-[72px] sm:w-[80px] aspect-[3/4] shrink-0 cursor-pointer"
                                        on:click={closeItemModal}
                                    >
                                        <OperatorCard
                                            operator={cObj || { id: optItem.id }}
                                            variant="small"
                                            className="w-full h-full"
                                        />
                                    </a>
                                {:else}
                                    {@const sItem = itemStorage.byGameId.get(optItem.id)}
                                    {#if sItem}
                                        <button
                                            type="button"
                                            class="shrink-0 cursor-pointer text-left focus:outline-none"
                                            on:click={() => navigateToItem(optItem.id)}
                                        >
                                            <ItemStackCard
                                                item={sItem}
                                                amount={optItem.count > 1 ? optItem.count : null}
                                                size={CardSize.SMALL}
                                                showTooltip={true}
                                                showHoverEffect={true}
                                            />
                                        </button>
                                    {:else}
                                        <button
                                            type="button"
                                            class="w-[72px] h-[72px] sm:w-[80px] sm:h-[80px] shrink-0 flex flex-col items-center justify-center p-1 bg-white dark:bg-[#383838] border border-gray-200 dark:border-[#444444] rounded-xl relative cursor-pointer hover:border-amber-400 dark:hover:border-amber-400 transition-colors"
                                            on:click={() => navigateToItem(optItem.id)}
                                        >
                                            <Image
                                                id={optItem.id}
                                                variant="item-game"
                                                className="w-9 h-9 object-contain"
                                                interactive={false}
                                                width={36}
                                                height={36}
                                            />
                                            {#if optItem.count > 1}
                                                <span class="text-[10px] font-semibold text-amber-600 dark:text-[#FFD800]">×{optItem.count}</span>
                                            {/if}
                                            <span class="text-[10px] font-bold text-gray-700 dark:text-gray-300 truncate w-full text-center mt-0.5">
                                                {$t(`itemNames.${optItem.id}`)}
                                            </span>
                                        </button>
                                    {/if}
                                {/if}
                            {:else}
                                <div class="flex items-center gap-1.5 p-1.5 rounded-lg bg-gray-50 dark:bg-[#2c2c2c]">
                                    {#each opt as optItem, idx}
                                        {#if idx > 0}
                                            <span class="text-xs font-bold text-gray-400 select-none">+</span>
                                        {/if}
                                        {#if optItem.type === "weapon"}
                                            {@const wObj = (weapons as Record<string, any>)[optItem.id] || Object.values(weapons).find((w: any) => w.id === optItem.id || w.gameId === optItem.id)}
                                            <a
                                                href={`/weapons/${optItem.id}`}
                                                class="block w-[64px] sm:w-[72px] aspect-square shrink-0 cursor-pointer"
                                                on:click={closeItemModal}
                                            >
                                                <WeaponCard
                                                    weapon={wObj || { id: optItem.id }}
                                                    variant="small"
                                                    asLink={false}
                                                    className="w-full h-full"
                                                />
                                            </a>
                                        {:else if optItem.type === "character"}
                                            {@const cObj = (characters as Record<string, any>)[optItem.id] || Object.values(characters).find((c: any) => c.id === optItem.id || c.gameId === optItem.id)}
                                            <a
                                                href={`/operators/${optItem.id}`}
                                                class="block w-[64px] sm:w-[72px] aspect-[3/4] shrink-0 cursor-pointer"
                                                on:click={closeItemModal}
                                            >
                                                <OperatorCard
                                                    operator={cObj || { id: optItem.id }}
                                                    variant="small"
                                                    className="w-full h-full"
                                                />
                                            </a>
                                        {:else}
                                            {@const sItem = itemStorage.byGameId.get(optItem.id)}
                                            {#if sItem}
                                                <button
                                                    type="button"
                                                    class="shrink-0 cursor-pointer text-left focus:outline-none"
                                                    on:click={() => navigateToItem(optItem.id)}
                                                >
                                                    <ItemStackCard
                                                        item={sItem}
                                                        amount={optItem.count > 1 ? optItem.count : null}
                                                        size={CardSize.MICRO}
                                                        showTooltip={true}
                                                        showHoverEffect={true}
                                                    />
                                                </button>
                                            {:else}
                                                <button
                                                    type="button"
                                                    class="w-[60px] h-[60px] shrink-0 flex flex-col items-center justify-center p-1 bg-white dark:bg-[#383838] border border-gray-200 dark:border-[#444444] rounded-lg relative cursor-pointer"
                                                    on:click={() => navigateToItem(optItem.id)}
                                                >
                                                    <Image
                                                        id={optItem.id}
                                                        variant="item-game"
                                                        className="w-7 h-7 object-contain"
                                                        interactive={false}
                                                        width={28}
                                                        height={28}
                                                    />
                                                    {#if optItem.count > 1}
                                                        <span class="text-[10px] font-semibold text-amber-600 dark:text-[#FFD800]">×{optItem.count}</span>
                                                    {/if}
                                                </button>
                                            {/if}
                                        {/if}
                                    {/each}
                                </div>
                            {/if}
                        {/each}
                    </div>
                </div>
            {/if}

            {#if obtainWays.length > 0}
                <div class="flex flex-col gap-2.5">
                    <h3 class="font-bold text-[#21272C] dark:text-white font-sdk">
                        {$t("itemModal.sources")}
                    </h3>

                    <div class="flex flex-col gap-2">
                        {#each obtainWays as way, idx}
                            {@const iconId = (itemId ? itemObtainIcons[itemId]?.[idx] : null) || null}
                            <div class="bg-gray-50 dark:bg-[#2c2c2c] border border-gray-200 dark:border-[#444444] rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                                {#if iconId}
                                    <Image
                                        id={iconId}
                                        variant="item-tips"
                                        className="w-full h-full object-contain brightness-0 dark:brightness-100 opacity-80 dark:opacity-95"
                                        interactive={false}
                                        width={20}
                                        height={20}
                                    />
                                {/if}
                                <span class="leading-relaxed">{@html parseRichText(way)}</span>
                            </div>
                        {/each}
                    </div>
                </div>
            {/if}

            {#if itemRecipes.length > 0}
                <div class="flex flex-col gap-2.5">
                    <div class="flex items-center justify-between">
                        <h3 class="font-bold text-[#21272C] dark:text-white font-sdk">
                            {$t("pages.recipes")}
                        </h3>
                        <div class="flex items-center gap-3">
                            <a
                                href={`/recipes/tree?itemId=${itemId}`}
                                on:click={closeItemModal}
                                class="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-[#FFD800] hover:underline"
                            >
                                <span>{$t("pages.recipeTree")}</span>
                                <Icon name="sendToLink" class="w-3.5 h-3.5" />
                            </a>
                            <a
                                href={`/recipes?id=${itemId}`}
                                on:click={closeItemModal}
                                class="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-[#FFD800] hover:underline"
                            >
                                <span>{$t("pages.recipes")}</span>
                                <Icon name="sendToLink" class="w-3.5 h-3.5" />
                            </a>
                        </div>
                    </div>

                    <div class="flex flex-col gap-2.5">
                        {#each itemRecipes as recipe (recipe.id)}
                            <div class="bg-gray-50 dark:bg-[#2c2c2c] border border-gray-200 dark:border-[#444444] rounded-2xl p-3 flex flex-col gap-2">
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
                                                        on:click={() => navigateToItem(ing.itemId)}
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
                                                        on:click={() => navigateToItem(ing.itemId)}
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
                                                        on:click={() => navigateToItem(outcome.itemId)}
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
                                                        on:click={() => navigateToItem(outcome.itemId)}
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
            {/if}

            {#if itemId !== "item_gold" && (charObjects.length > 0 || weaponObjects.length > 0 || usedInOutcomeItems.length > 0)}
                <div class="flex flex-col gap-3">
                    <h3 class="font-bold text-[#21272C] dark:text-white font-sdk">
                        {$t("itemModal.usedFor")}
                    </h3>

                    {#if usedInOutcomeItems.length > 0}
                        <div class="flex flex-col gap-2 {(charObjects.length > 0 || weaponObjects.length > 0) ? 'mt-2' : ''}">
                            <div class="flex items-center justify-between">
                                <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    {$t("itemModal.crafting")}
                                </span>
                                <div class="flex items-center gap-3">
                                    <a
                                        href={`/recipes/tree?itemId=${itemId}`}
                                        on:click={closeItemModal}
                                        class="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-[#FFD800] hover:underline"
                                    >
                                        <span>{$t("pages.recipeTree")}</span>
                                        <Icon name="sendToLink" class="w-3.5 h-3.5" />
                                    </a>
                                    <a
                                        href={`/recipes?id=${itemId}`}
                                        on:click={closeItemModal}
                                        class="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-[#FFD800] hover:underline"
                                    >
                                        <span>{$t("pages.recipes")}</span>
                                        <Icon name="sendToLink" class="w-3.5 h-3.5" />
                                    </a>
                                </div>
                            </div>
                            <div class="flex flex-wrap gap-2.5">
                                {#each usedInOutcomeItems as outItem (outItem.id)}
                                    {@const item = itemStorage.byGameId.get(outItem.id)}
                                    {#if item}
                                        <button
                                            type="button"
                                            class="shrink-0 cursor-pointer text-left focus:outline-none"
                                            on:click={() => navigateToItem(outItem.id)}
                                        >
                                            <ItemStackCard
                                                {item}
                                                size={CardSize.SMALL}
                                                showTooltip={true}
                                                showHoverEffect={true}
                                            />
                                        </button>
                                    {:else}
                                        <button
                                            type="button"
                                            class="w-[80px] h-[80px] shrink-0 flex flex-col items-center justify-center p-1 bg-white dark:bg-[#383838] border border-gray-200 dark:border-[#444444] rounded-[6px] relative cursor-pointer"
                                            on:click={() => navigateToItem(outItem.id)}
                                        >
                                            <Image id={outItem.id} variant="item-game" className="w-10 h-10 object-contain" interactive={false} width={40} height={40} />
                                            <span class="text-[10px] font-bold text-gray-700 dark:text-gray-300 truncate w-full text-center mt-1">
                                                {$t(`itemNames.${outItem.id}`)}
                                            </span>
                                        </button>
                                    {/if}
                                {/each}
                            </div>
                        </div>
                    {/if}

                    {#if charObjects.length > 0}
                        <div class="flex flex-col gap-2">
                            <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {$t("pages.operators")}
                            </span>
                            <div class="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
                                {#each charObjects as char (char.id)}
                                    <a
                                        href={`/operators/${char.id}`}
                                        class="block w-full aspect-[3/4] cursor-pointer"
                                        on:click={closeItemModal}
                                    >
                                        <OperatorCard
                                            operator={char}
                                            variant="small"
                                            className="w-full h-full"
                                        />
                                    </a>
                                {/each}
                            </div>
                        </div>
                    {/if}

                    {#if weaponObjects.length > 0}
                        <div class="flex flex-col gap-2 {charObjects.length > 0 ? 'mt-2' : ''}">
                            <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {$t("pages.weapons")}
                            </span>
                            <div class="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
                                {#each weaponObjects as weapon (weapon.id)}
                                    <a
                                        href={`/weapons/${weapon.id}`}
                                        class="block w-full aspect-square cursor-pointer"
                                        on:click={closeItemModal}
                                    >
                                        <WeaponCard
                                            {weapon}
                                            variant="small"
                                            asLink={false}
                                            className="w-full h-full"
                                        />
                                    </a>
                                {/each}
                            </div>
                        </div>
                    {/if}

                    
                </div>
            {/if}

            {#if droppedByEnemies.length > 0}
                <div class="flex flex-col gap-2.5">
                    <h3 class="font-bold text-[#21272C] dark:text-white font-sdk">
                        {$t("itemModal.droppedBy")}
                    </h3>

                    <div class="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                        {#each droppedByEnemies as enemyId (enemyId)}
                            <a
                                href={`/enemies/${enemyId}`}
                                class="block w-full aspect-square cursor-pointer"
                                on:click={closeItemModal}
                            >
                                <WeaponCard
                                    weapon={{ id: enemyId }}
                                    isEnemy={true}
                                    variant="small"
                                    hideDarkness={true}
                                    hidePot={true}
                                    asLink={false}
                                    className="w-full h-full"
                                />
                            </a>
                        {/each}
                    </div>
                </div>
            {/if}
        </div>
    </div>
</Modal>
