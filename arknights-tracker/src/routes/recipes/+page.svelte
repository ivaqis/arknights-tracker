<script>
    import { t } from "$lib/i18n";
    import { itemFilters, itemGroupMode, itemManual, itemSearch } from "$lib/stores/filterStore.js";
    import { Item } from "$lib/classes/items/Item.js";
    import { craftableItemsList } from "$lib/data/crafts/craftableItemsList.js";
    import { FactoryEvent } from "$lib/classes/events/FactoryEvent.js";

    import FormulaSidebar from "$lib/components/recipes/FormulaSidebar.svelte";
    import DataToolbar from "$lib/components/dataToolbar/DataToolbar.svelte";
    import ItemCard from "$lib/components/recipes/ItemCard.svelte";
    import BottomSheet from "$lib/components/BottomSheet.svelte";
    import Icon from "$lib/components/Icon.svelte";

    $: filters = $itemFilters;
    $: searchQuery = $itemSearch;
    $: isGrouped = $itemGroupMode || false;

    const allItems = craftableItemsList.map((itemId) => Item.getItem(itemId));

    let sortField = "itemGroup";
    let sortDirection = "desc";

    $: filteredItems = (() => {
        const baseFiltered = [...allItems].filter((item) => {
            const query = searchQuery.toLowerCase().trim();
            const localizedName = ($t(`itemNames.${item.id}`) || "").toLowerCase();
            const idStr = (item.id || "").toLowerCase();

            const matchesSearch = !query || localizedName.includes(query) || idStr.includes(query);

            if (!matchesSearch) return false;

            const matchesRarity =
                filters.rarity.length === 0
                || filters.rarity.includes(item.rarity);


            let matchesGroup =
                filters.itemSubGroups.length === 0
                || filters.itemSubGroups.includes(item.subGroupId);

            let matchesEvent = filters.factoryEvents.length === 0
                || filters.factoryEvents.includes("nonEvent")
                || filters.factoryEvents
                    .some((eventId) => FactoryEvent.getFactoryEvent(eventId).containsEventItemId(item.id));

            return matchesRarity && matchesGroup && matchesEvent;
        });

        const sortLogic = (itemA, itemB) => {
            let diff = 0;
            let aWeight = 0;
            let bWeight = 0;

            if (sortField === "itemGroup") {
                aWeight = itemGroupWeight[itemA.groupId] ?? 0;
                bWeight = itemGroupWeight[itemB.groupId] ?? 0;

                if (aWeight === bWeight) {
                    aWeight = itemSubGroupWeight[itemA.subGroupId] ?? -100;
                    bWeight = itemSubGroupWeight[itemB.subGroupId] ?? -100;
                }

            } else if (sortField === "rarity") {
                aWeight = itemA.rarity;
                bWeight = itemB.rarity;
            }

            diff = bWeight - aWeight;

            if (diff !== 0) {
                return sortDirection === "desc" ? diff : -diff;
            }

            aWeight = itemA.rarity;
            bWeight = itemB.rarity;

            diff = aWeight - bWeight;

            if (diff !== 0) {
                return diff;
            }

            return itemA.id.localeCompare(itemB.id);
        };

        return baseFiltered.sort(sortLogic);
    })();

    const itemGroupWeight = {
        "nature": 5,
        "gatherable": 2,
        "product": 4,
        "usable": 3,
        "facility": 1
    };

    const itemSubGroupWeight = {
        "facility_battle": 5,
        "facility_crafter": 8,
        "facility_miner": 10,
        "facility_other": -10,
        "facility_powerStation": 7,
        "facility_pump": 9,
        "facility_soil": 6,

        "gatherable_drop": 8,
        "gatherable_muck": 9,
        "gatherable_plant": 10,

        "nature_flowerPlant": 8,
        "nature_grassPlant": 7,
        "nature_liquid": 9,
        "nature_ore": 10,
        "nature_soilPlant": 6,
        "nature_wood": 5,

        "product_activityXiranite": 3,
        "product_amethyst": 9,
        "product_battery": 1,
        "product_carbon": 5,
        "product_component": 2,
        "product_copper": 7,
        "product_fullBottle": -10,
        "product_iron": 8,
        "product_liquid": 11,
        "product_muck": 0,
        "product_originium": 10,
        "product_powder": 6,
        "product_xiranite": 4,

        "usable_bomb": 8,
        "usable_bottledProdFood": 9,
        "usable_other": -10,
        "usable_powder": 10
    };

    let selectedItemId = "";
    let isBottomSheetOpen = false;

    function selectItem(itemId) {
        if (selectedItemId === itemId) {
            selectedItemId = "";
            isBottomSheetOpen = false;
            return;
        }

        selectedItemId = itemId;
        isBottomSheetOpen = true;
    }

    $: isSelectedItem = (itemId) => {
        return selectedItemId === itemId;
    };

    $: groupedItems = filteredItems.reduce((groups, item) => {
        let groupId = item.groupId;

        if (!groups[groupId]) groups[groupId] = [];

        groups[groupId].push(item);

        return groups;
    }, {});

    $: groupedArray = Object.entries(groupedItems)
        .map(([groupId, items]) => ({ groupId, items }));

    let displayLimit = 2;
    let flatDisplayLimit = 40;

    $: {
        const _trigger = [
            $itemSearch,
            $itemFilters,
            sortField,
            sortDirection,
            isGrouped
        ];
        displayLimit = 2;
        flatDisplayLimit = 40;
        setTimeout(checkScroll, 50);
    }

    $: displayedGroups = groupedArray.slice(0, displayLimit);
    $: displayedItems = filteredItems.slice(0, flatDisplayLimit);

    function loadMore() {
        let changed = false;
        if (isGrouped && displayLimit < groupedArray.length) {
            displayLimit += 2;
            changed = true;
        } else if (!isGrouped && flatDisplayLimit < filteredItems.length) {
            flatDisplayLimit += 40;
            changed = true;
        }
        if (changed) {
            setTimeout(checkScroll, 50);
        }
    }

    function checkScroll() {
        if (typeof window === "undefined" || typeof document === "undefined")
            return;
        const currentScroll = window.innerHeight + window.scrollY;
        const totalHeight = document.body.offsetHeight;
        if (totalHeight - currentScroll < 1000) {
            loadMore();
        }
    }
</script>

<svelte:window on:scroll={checkScroll} on:resize={checkScroll} />

<div class="max-w-[100%] max-h-[100%] min-h-screen h-full flex flex-col xl:flex-row">
    <div class="w-full xl:w-[calc(100%-max(470px,30%))] mr-6">
        <div class="flex items-baseline flex-wrap gap-2 md:gap-3 mb-8 font-sdk">
            <h2 class="text-3xl md:text-5xl tracking-wide text-[#21272C] dark:text-[#FDFDFD]">
                {$t("pages.recipes") || "Recipes"}
            </h2>
            <span class="text-gray-400 text-xl md:text-3xl font-normal">
                / {filteredItems.length}
            </span>
        </div>

        <div class="w-full xl:w-[70%] mb-4">
            <DataToolbar
                bind:sortField
                bind:sortDirection
                bind:filters={$itemFilters}
                bind:searchQuery={$itemSearch}
                bind:manualMode={$itemManual}
                bind:groupMode={$itemGroupMode}
                mode="items"
            />
        </div>

        <div class="w-full pb-8">

            {#if isGrouped}

                {#each displayedGroups as group}
                    <div class="flex flex-col gap-1 animate-fadeIn pb-5">
                        <div class="flex items-center gap-3 mb-2">
                            <h3 class="text-xl font-bold text-[#21272C] dark:text-[#E4E4E4] font-sdk pl-0.5">
                                {$t(`sort.itemGroups.${group.groupId}`)}
                            </h3>
                        </div>

                        <div class="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] md:grid-cols-[repeat(auto-fill,110px)] gap-3 justify-start">
                            {#each group.items as item}

                                <button
                                    tabindex="0"
                                    class="relative w-[110px] h-[110px] rounded-[6px] cursor-pointer text-left aspect-square transition-all duration-300"
                                    on:click|preventDefault|stopPropagation={() => selectItem(item.id)}
                                >

                                    <ItemCard item={item} />

                                    {#if isSelectedItem(item.id)}
                                        <div
                                            class="absolute inset-[-3px] border-[3px] border-[#F9B90C] rounded-[9px] z-30 pointer-events-none"
                                        ></div>
                                    {/if}

                                </button>

                            {/each}
                        </div>
                    </div>
                {/each}

            {:else}

                <div class="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] md:grid-cols-[repeat(auto-fill,110px)] gap-3 justify-start">
                    {#each displayedItems as item}
                        <button
                            tabindex="0"
                            class="relative w-[110px] h-[110px] rounded-[6px] cursor-pointer text-left aspect-square transition-all duration-300"
                            on:click|preventDefault|stopPropagation={() => selectItem(item.id)}
                        >

                            <ItemCard item={item} />

                            {#if isSelectedItem(item.id)}
                                <div
                                    class="absolute inset-[-3px] border-[3px] border-[#F9B90C] rounded-[9px] z-30 pointer-events-none"
                                ></div>
                            {/if}

                        </button>
                    {/each}
                </div>

            {/if}

            {#if (isGrouped && displayLimit < groupedArray.length) || (!isGrouped && flatDisplayLimit < filteredItems.length)}
                <div class="h-10 w-full mt-4 flex items-center justify-center opacity-50">
                    <div class="w-8 h-8 animate-spin dark:text-white">
                        <Icon name="loading" class="w-8 h-8 opacity-100" />
                    </div>
                </div>
            {/if}

        </div>
    </div>
        <BottomSheet
            bind:isOpen={isBottomSheetOpen}
        >
            <div class="w-full min-h-[50vh] h-full xl:h-[calc(100vh-64px)] sticky top-8">
                <FormulaSidebar
                    currentItemId={selectedItemId}
                    mode="recipes"
                    itemsAsLink={true}
                />
            </div>
        </BottomSheet>
</div>

{#if !isBottomSheetOpen}
    {#if selectedItemId}
        <button
            type="button"
            class="xl:hidden fixed bottom-6 right-6 z-40 w-14 h-14 bg-[#F9B90C] hover:bg-[#FFC01E] text-black rounded-full shadow-lg flex items-center justify-center transition-all active:scale-95 border border-white dark:border-[#1A1A1A] cursor-pointer"
            on:click={() => (isBottomSheetOpen = true)}
            title="Results"
        >
            <Icon name="inbox" class="w-6 h-6 text-black" />
        </button>
    {/if}
{/if}