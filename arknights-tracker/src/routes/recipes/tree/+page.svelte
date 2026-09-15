<script lang="ts">

    import type { IMachineCraftFactory } from "$lib/classes/factories/recipes/IMachineCraftFactory";
    import type { IManualCraftFactory } from "$lib/classes/factories/recipes/IManualCraftFactory";
    import { MachineCraftFactory } from "$lib/classes/factories/recipes/MachineCraftFactory";
    import { ManualCraftFactory } from "$lib/classes/factories/recipes/ManualCraftFactory";
    import type { IItemRecipeTreeNode } from "$lib/classes/formulaTree/nodes/IItemRecipeTreeNode";
    import type { NodeRecipeGeneric } from "$lib/classes/formulaTree/nodes/NodeRecipeGeneric";
    import type { IBuilding } from "$lib/classes/gameData/buildings/IBuilding";
    import type { IItem } from "$lib/classes/gameData/items/IItem";
    import type { IItemStack } from "$lib/classes/gameData/items/IItemStack";
    import { RecipeType } from "$lib/classes/gameData/recipes/RecipeType";
    import { RecipeSource } from "$lib/classes/gameData/recipes/sources/RecipeSource";
    import type { IMachineCraftSearcher } from "$lib/classes/searchers/recipes/IMachineCraftSearcher";
    import type { IManualCraftSearcher } from "$lib/classes/searchers/recipes/IManualCraftSearcher";
    import type { IMinerRecipeSearcher } from "$lib/classes/searchers/recipes/IMinerRecipeSearcher";
    import type { IPowerRecipeSearcher } from "$lib/classes/searchers/recipes/IPowerRecipeSearcher";
    import type { IPumpRecipeSearcher } from "$lib/classes/searchers/recipes/IPumpRecipeSearcher";
    import { MachineCraftSearcher } from "$lib/classes/searchers/recipes/MachineCraftSearcher";
    import { ManualCraftSearcher } from "$lib/classes/searchers/recipes/ManualCraftSearcher";
    import { MinerRecipeSearcher } from "$lib/classes/searchers/recipes/MinerRecipeSearcher";
    import { PowerRecipeSearcher } from "$lib/classes/searchers/recipes/PowerRecipeSearcher";
    import { PumpRecipeSearcher } from "$lib/classes/searchers/recipes/PumpRecipeSearcher";
    import { BuildingRecipeDataStorage } from "$lib/classes/storages/recipes/BuildingRecipeDataStorage";
    import { RecipeDataStorage } from "$lib/classes/storages/recipes/RecipeDataStorage";
    import BottomSheet from "$lib/components/BottomSheet.svelte";
    import Button from "$lib/components/Button.svelte";
    import BuildingRecipeGroup from "$lib/components/recipes/formulas/BuildingRecipeGroup.svelte";
    import RecipeFormula from "$lib/components/recipes/formulas/RecipeFormula.svelte";
    import RecipeItemChain from "$lib/components/recipes/formulas/RecipeItemChain.svelte";
    import SourceRecipeGroup from "$lib/components/recipes/formulas/SourceRecipeGroup.svelte";
    import FuelEnergyCard from "$lib/components/recipes/FuelEnergyCard.svelte";
    import RecipeSidebar from "$lib/components/recipes/sidebar/RecipeSidebar.svelte";
    import RecipeSidebarSector from "$lib/components/recipes/sidebar/RecipeSidebarSector.svelte";
    import RecipeTree from "$lib/components/recipes/tree/RecipeTree.svelte";
    import { crafterStorage } from "$lib/dataStorages/buildings/crafterStorage";
    import { gasMinerStorage } from "$lib/dataStorages/buildings/gasMinerStorage";
    import { minerStorage } from "$lib/dataStorages/buildings/minerStorage";
    import { powerStationStorage } from "$lib/dataStorages/buildings/powerStationStorage";
    import { pumpStorage } from "$lib/dataStorages/buildings/pumpStorage";
    import { hubCraftDataStorage } from "$lib/dataStorages/crafts/hubCraftDataStorage";
    import { machineCraftDataStorage } from "$lib/dataStorages/crafts/machineCraftDataStorage";
    import { manualCraftDataStorage } from "$lib/dataStorages/crafts/manualCraftDataStorage";
    import { itemStorage } from "$lib/dataStorages/items/itemStorage";
    import { t } from "$lib/i18n.js";
    import { getRecipeTreeUrlBuilding, getRecipeTreeUrlCraft, getRecipeTreeUrlItem } from "$lib/utils/linkUtils";

    export let data;

    const machineCraftStorage = new BuildingRecipeDataStorage(machineCraftDataStorage.list, craft => craft.buildingId);
    const manualCraftStorage = new RecipeDataStorage(manualCraftDataStorage.list);
    const hubCraftStorage = new RecipeDataStorage(hubCraftDataStorage.list);

    const machineCraftFactory: IMachineCraftFactory = new MachineCraftFactory(itemStorage, crafterStorage);
    const manualCraftFactory: IManualCraftFactory = new ManualCraftFactory(itemStorage);

    const machineCraftSearcher: IMachineCraftSearcher = new MachineCraftSearcher(machineCraftStorage, machineCraftFactory, machineCraftDataStorage);
    const manualCraftSearcher: IManualCraftSearcher = new ManualCraftSearcher(manualCraftStorage, manualCraftFactory, manualCraftDataStorage);
    const hubCraftSearcher: IManualCraftSearcher = new ManualCraftSearcher(hubCraftStorage, manualCraftFactory, hubCraftDataStorage);
    const minerRecipeSearcher: IMinerRecipeSearcher = new MinerRecipeSearcher(minerStorage);
    const gasMinerRecipeSearcher: IMinerRecipeSearcher = new MinerRecipeSearcher(gasMinerStorage);
    const pumpRecipeSearcher: IPumpRecipeSearcher = new PumpRecipeSearcher(pumpStorage);
    const powerRecipeSearcher: IPowerRecipeSearcher = new PowerRecipeSearcher(powerStationStorage);

    let startItem: IItem;
    let startRecipe: NodeRecipeGeneric | null;

    $: startItem = itemStorage.byGameId.getOrThrow(data.itemId);
    $: startRecipe = getStartRecipe(data.itemId, data.recipeType, data.recipeId, data.buildingId);

    function getStartRecipe(itemId: string, recipeType: RecipeType | null, recipeId: string | null, buildingId: string | null): NodeRecipeGeneric | null {
        if (!recipeType) {
            return null;
        }

        switch (recipeType) {
            case RecipeType.MACHINE:
                return {
                    type: RecipeType.MACHINE,
                    recipe: machineCraftFactory.create(machineCraftDataStorage.byId.getOrThrow(recipeId!))
                };
            case RecipeType.MANUAL:
                return {
                    type: RecipeType.MANUAL,
                    recipe: manualCraftFactory.create(manualCraftDataStorage.byId.getOrThrow(recipeId!))
                };
            case RecipeType.HUB:
                return {
                    type: RecipeType.HUB,
                    recipe: manualCraftFactory.create(hubCraftDataStorage.byId.getOrThrow(recipeId!))
                };
            case RecipeType.MINING:
                return {
                    type: RecipeType.MINING,
                    recipe: minerStorage.byGameId.getOrThrow(buildingId!).getRecipe(itemId)!
                };
            case RecipeType.GAS_MINING:
                return {
                    type: RecipeType.GAS_MINING,
                    recipe: gasMinerStorage.byGameId.getOrThrow(buildingId!).getRecipe(itemId)!
                };
            case RecipeType.PUMPING:
                return {
                    type: RecipeType.PUMPING,
                    recipe: pumpStorage.byGameId.getOrThrow(buildingId!).getRecipe(itemId)!
                };
        }
    }

    let changeRecipe: (node: IItemRecipeTreeNode, recipe: NodeRecipeGeneric) => void;

    function onFormulaClick(node: IItemRecipeTreeNode, recipe: NodeRecipeGeneric) {
        changeRecipe(node, recipe);

        isBottomSheetOpen = false;
    }

    let selectedItemNode: IItemRecipeTreeNode | null;
    let selectedBuildingNode: IItemRecipeTreeNode | null;

    let sidebarTitleKey: string | null;
    let sidebarButtonUrl: string | null;

    $: sidebarTitleKey = getSidebarTitleKey(selectedItemNode, selectedBuildingNode);
    $: sidebarButtonUrl = getSidebarButtonUrl(selectedItemNode, selectedBuildingNode);

    function getSidebarTitleKey(selectedItemNode: IItemRecipeTreeNode | null, selectedBuildingNode: IItemRecipeTreeNode | null): string | null {
        if (selectedItemNode) {
            return selectedItemNode.item.i18nKey;
        }

        if (selectedBuildingNode) {
            const formula = selectedBuildingNode.recipe!;

            if (formula.type === RecipeType.MANUAL) {
                return RecipeSource.MANUAL.i18nKey;
            }

            if (formula.type === RecipeType.HUB) {
                return RecipeSource.HUB.i18nKey;
            }

            return formula.recipe.building.i18nKey;
        }

        return null;
    }

    function getSidebarButtonUrl(selectedItemNode: IItemRecipeTreeNode | null, selectedBuildingNode: IItemRecipeTreeNode | null): string | null {
        if (selectedItemNode) {
            const formula = selectedItemNode.recipe;

            if (formula) {
                if (formula.type === RecipeType.MACHINE || formula.type === RecipeType.MANUAL || formula.type === RecipeType.HUB) {
                    return getRecipeTreeUrlCraft(formula.type, selectedItemNode.item.gameId, formula.recipe.gameId);
                }
                else if (formula.type === RecipeType.MINING || formula.type === RecipeType.GAS_MINING || formula.type === RecipeType.PUMPING) {
                    return getRecipeTreeUrlBuilding(formula.type, selectedItemNode.item.gameId, formula.recipe.building.gameId);
                }
            }

            return getRecipeTreeUrlItem(selectedItemNode.item.gameId);
        }

        if (selectedBuildingNode) {
            const formula = selectedBuildingNode.recipe!;

            if (formula.type !== RecipeType.MANUAL && formula.type !== RecipeType.HUB) {
                return getRecipeTreeUrlItem(formula.recipe.building.item.gameId);
            }
        }

        return null;
    }

    function getCurrentFormulaList(itemNode: IItemRecipeTreeNode): NodeRecipeGeneric[] {
        const incoming = itemNode.recipe;
        const outcoming = itemNode.parent?.recipe ?? null;

        return [incoming, outcoming].filter(r => r !== null);
    }

    function highlightItem(stack: IItemStack): boolean {
        if (selectedItemNode) {
            return stack.item.gameId === selectedItemNode.item.gameId;
        }

        if (selectedBuildingNode) {
            const formula = selectedBuildingNode.recipe!;

            if (formula.type !== RecipeType.MANUAL && formula.type !== RecipeType.HUB) {
                return stack.item.gameId === formula.recipe.building.item.gameId;
            }
        }

        return false;
    }

    function getItemStackUrl(stack: IItemStack): string {
        return getRecipeTreeUrlItem(stack.item.gameId);
    }

    function getBuildingFromFormula(formula: NodeRecipeGeneric): IBuilding | null {
        if (formula.type === RecipeType.MANUAL || formula.type === RecipeType.HUB) {
            return null;
        }

        return formula.recipe.building;
    }

    let isBottomSheetOpen: boolean = false;

</script>

<svelte:head>
    <title>{$t("pages.recipeTree")} - Goyfield</title>
    <meta
        name="description"
        content={$t("seo.descriptions.recipeTree")}
    />
    <meta
        property="og:title"
        content={`${$t("pages.recipeTree")} - Goyfield`}
    />
    <meta
        property="og:description"
        content={$t("seo.descriptions.recipeTree")}
    />
</svelte:head>

<div class="max-w-[100%] flex flex-col xl:flex-row">

    <div class="w-full xl:w-[calc(100%-max(470px,30%))] mr-6">

        <div class="flex flex-row gap-6 items-center mb-8 h-12">

            <Button
                variant="roundSmall"
                color="white"
                onClick={() => history.back()}
            >

                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                >
                    <path
                        d="M15 18l-6-6 6-6"
                    />
                </svg>

            </Button>

            <div class="flex items-baseline flex-wrap gap-2 md:gap-3 font-sdk">

                <h2 class="text-3xl md:text-5xl tracking-wide text-[#21272C] dark:text-[#FDFDFD]">
                    {$t("pages.recipeTree")}
                </h2>

            </div>

        </div>

        <div class="w-full h-[calc(100vh-144px)]">

            <RecipeTree
                machineCraftSearcher={machineCraftSearcher}
                manualCraftSearcher={manualCraftSearcher}
                hubCraftSearcher={hubCraftSearcher}
                minerRecipeSearcher={minerRecipeSearcher}
                gasMinerRecipeSearcher={gasMinerRecipeSearcher}
                pumpRecipeSearcher={pumpRecipeSearcher}
                startItem={startItem}
                startFormula={startRecipe}
                bind:isBottomSheetOpen
                bind:selectedItemNode
                bind:selectedBuildingNode
                bind:changeRecipe
            />

        </div>

    </div>

    <BottomSheet
        bind:isOpen={isBottomSheetOpen}
    >

        <div class="w-full min-h-[50vh] h-full xl:h-[calc(100vh-64px)] sticky top-8">

            <RecipeSidebar
                title={sidebarTitleKey ? $t(sidebarTitleKey) : null}
                buttonTitle={sidebarButtonUrl ? $t("formulaSidebar.treeSwitchButton.changeTree") : null}
                buttonUrl={sidebarButtonUrl}
            >

                {#if selectedItemNode !== null}

                    {@const selectedItem = selectedItemNode.item}

                    {@const currentFormulas = getCurrentFormulaList(selectedItemNode)}

                    {@const machineAsOutcome = machineCraftSearcher.searchByItemAsOutcome(selectedItem.gameId)}
                    {@const manualAsOutcome = manualCraftSearcher.searchByItemAsOutcome(selectedItem.gameId)}
                    {@const hubAsOutcome = hubCraftSearcher.searchByItemAsOutcome(selectedItem.gameId)}
                    {@const minerAsOutcome = minerRecipeSearcher.searchByItemAsOutcome(selectedItem.gameId)}
                    {@const gasMinerAsOutcome = gasMinerRecipeSearcher.searchByItemAsOutcome(selectedItem.gameId)}
                    {@const pumpAsOutcome = pumpRecipeSearcher.searchByItemAsOutcome(selectedItem.gameId)}

                    {@const hasSource = !machineAsOutcome.isEmpty
                        || !manualAsOutcome.isEmpty
                        || !hubAsOutcome.isEmpty
                        || !minerAsOutcome.isEmpty
                        || !gasMinerAsOutcome.isEmpty
                        || !pumpAsOutcome.isEmpty}

                    <div class="flex flex-col justify-start gap-10">

                        <RecipeSidebarSector
                            title={$t("formulaSidebar.sector.currentFormulas")}
                        >

                            {#each currentFormulas as formula}

                                {#if formula.type === RecipeType.MANUAL || formula.type === RecipeType.HUB}

                                    <SourceRecipeGroup
                                        recipeSource={RecipeSource.get(formula.type)}
                                    >

                                        <RecipeFormula>

                                            <RecipeItemChain
                                                slot="left"
                                                items={formula.recipe.ingredients}
                                                highlightItemFn={highlightItem}
                                                getItemUrlFn={getItemStackUrl}
                                            />

                                            <RecipeItemChain
                                                slot="right"
                                                items={formula.recipe.outcomes}
                                                highlightItemFn={highlightItem}
                                                getItemUrlFn={(stack) => getRecipeTreeUrlCraft(formula.type, stack.item.gameId, formula.recipe.gameId)}
                                            />

                                        </RecipeFormula>

                                    </SourceRecipeGroup>

                                {:else if formula.type === RecipeType.MACHINE}

                                    <BuildingRecipeGroup
                                        building={formula.recipe.building}
                                    >

                                        <RecipeFormula
                                            processTimeMs={formula.recipe.processTimeMs}
                                        >

                                            <RecipeItemChain
                                                slot="left"
                                                items={formula.recipe.ingredients}
                                                highlightItemFn={highlightItem}
                                                getItemUrlFn={getItemStackUrl}
                                            />

                                            <RecipeItemChain
                                                slot="right"
                                                items={formula.recipe.outcomes}
                                                highlightItemFn={highlightItem}
                                                getItemUrlFn={(stack) => getRecipeTreeUrlCraft(formula.type, stack.item.gameId, formula.recipe.gameId)}
                                            />

                                        </RecipeFormula>

                                    </BuildingRecipeGroup>

                                {:else}

                                    <BuildingRecipeGroup
                                        building={formula.recipe.building}
                                    >

                                        <RecipeFormula
                                            processTimeMs={formula.recipe.processTimeMs}
                                        >

                                            <RecipeItemChain
                                                slot="left"
                                                items={formula.recipe.ingredients}
                                                resourcePoint={formula.recipe.resourcePoint}
                                                highlightItemFn={highlightItem}
                                                getItemUrlFn={getItemStackUrl}
                                            />

                                            <RecipeItemChain
                                                slot="right"
                                                items={formula.recipe.outcomes}
                                                highlightItemFn={highlightItem}
                                                getItemUrlFn={(stack) => getRecipeTreeUrlBuilding(formula.type, stack.item.gameId, formula.recipe.building.gameId)}
                                            />

                                        </RecipeFormula>

                                    </BuildingRecipeGroup>

                                {/if}

                            {/each}

                        </RecipeSidebarSector>

                        {#if hasSource}

                            <RecipeSidebarSector
                                title={$t("formulaSidebar.sector.source")}
                            >

                                {#if !hubAsOutcome.isEmpty}

                                    <SourceRecipeGroup
                                        recipeSource={RecipeSource.HUB}
                                    >

                                        {#each hubAsOutcome.list as recipe}

                                            {@const formula: NodeRecipeGeneric = { type: RecipeType.HUB, recipe }}

                                            <button
                                                on:click|preventDefault|stopPropagation={() => onFormulaClick(selectedItemNode!, formula)}
                                            >

                                                <RecipeFormula
                                                    showHoverEffect={true}
                                                >

                                                    <RecipeItemChain
                                                        slot="left"
                                                        items={recipe.ingredients}
                                                        highlightItemFn={highlightItem}
                                                    />

                                                    <RecipeItemChain
                                                        slot="right"
                                                        items={recipe.outcomes}
                                                        highlightItemFn={highlightItem}
                                                    />

                                                </RecipeFormula>

                                            </button>

                                        {/each}

                                    </SourceRecipeGroup>

                                {/if}

                                {#if !manualAsOutcome.isEmpty}

                                    <SourceRecipeGroup
                                        recipeSource={RecipeSource.MANUAL}
                                    >

                                        {#each manualAsOutcome.list as recipe}

                                            {@const formula: NodeRecipeGeneric = { type: RecipeType.MANUAL, recipe }}

                                            <button
                                                on:click|preventDefault|stopPropagation={() => onFormulaClick(selectedItemNode!, formula)}
                                            >

                                                <RecipeFormula
                                                    showHoverEffect={true}
                                                >

                                                    <RecipeItemChain
                                                        slot="left"
                                                        items={recipe.ingredients}
                                                        highlightItemFn={highlightItem}
                                                    />

                                                    <RecipeItemChain
                                                        slot="right"
                                                        items={recipe.outcomes}
                                                        highlightItemFn={highlightItem}
                                                    />

                                                </RecipeFormula>

                                            </button>

                                        {/each}

                                    </SourceRecipeGroup>

                                {/if}

                                {#if !machineAsOutcome.isEmpty}

                                    {@const grouped = machineAsOutcome.groupByBuilding()}

                                    {#each grouped.values() as group}

                                        <BuildingRecipeGroup
                                            building={group.building}
                                        >

                                            {#each group.list as recipe}

                                                {@const
                                                    formula: NodeRecipeGeneric = { type: RecipeType.MACHINE, recipe }}

                                                <button
                                                    on:click|preventDefault|stopPropagation={() => onFormulaClick(selectedItemNode!, formula)}
                                                >

                                                    <RecipeFormula
                                                        processTimeMs={recipe.processTimeMs}
                                                        showHoverEffect={true}
                                                    >

                                                        <RecipeItemChain
                                                            slot="left"
                                                            items={recipe.ingredients}
                                                            highlightItemFn={highlightItem}
                                                        />

                                                        <RecipeItemChain
                                                            slot="right"
                                                            items={recipe.outcomes}
                                                            highlightItemFn={highlightItem}
                                                        />

                                                    </RecipeFormula>

                                                </button>

                                            {/each}

                                        </BuildingRecipeGroup>

                                    {/each}

                                {/if}

                                {#if !minerAsOutcome.isEmpty}

                                    {@const grouped = minerAsOutcome.groupByBuilding()}

                                    {#each grouped.values() as group}

                                        <BuildingRecipeGroup
                                            building={group.building}
                                        >

                                            {#each group.list as recipe}

                                                {@const
                                                    formula: NodeRecipeGeneric = { type: RecipeType.MINING, recipe }}

                                                <button
                                                    on:click|preventDefault|stopPropagation={() => onFormulaClick(selectedItemNode!, formula)}
                                                >

                                                    <RecipeFormula
                                                        processTimeMs={recipe.processTimeMs}
                                                        showHoverEffect={true}
                                                    >

                                                        <RecipeItemChain
                                                            slot="left"
                                                            items={recipe.ingredients}
                                                            resourcePoint={recipe.resourcePoint}
                                                            highlightItemFn={highlightItem}
                                                        />

                                                        <RecipeItemChain
                                                            slot="right"
                                                            items={recipe.outcomes}
                                                            highlightItemFn={highlightItem}
                                                        />

                                                    </RecipeFormula>

                                                </button>

                                            {/each}

                                        </BuildingRecipeGroup>

                                    {/each}

                                {/if}

                                {#if !gasMinerAsOutcome.isEmpty}

                                    {@const grouped = gasMinerAsOutcome.groupByBuilding()}

                                    {#each grouped.values() as group}

                                        <BuildingRecipeGroup
                                            building={group.building}
                                        >

                                            {#each group.list as recipe}

                                                {@const formula: NodeRecipeGeneric = {
                                                    type: RecipeType.GAS_MINING,
                                                    recipe
                                                }}

                                                <button
                                                    on:click|preventDefault|stopPropagation={() => onFormulaClick(selectedItemNode!, formula)}
                                                >

                                                    <RecipeFormula
                                                        processTimeMs={recipe.processTimeMs}
                                                        showHoverEffect={true}
                                                    >

                                                        <RecipeItemChain
                                                            slot="left"
                                                            items={recipe.ingredients}
                                                            resourcePoint={recipe.resourcePoint}
                                                            highlightItemFn={highlightItem}
                                                        />

                                                        <RecipeItemChain
                                                            slot="right"
                                                            items={recipe.outcomes}
                                                            highlightItemFn={highlightItem}
                                                        />

                                                    </RecipeFormula>

                                                </button>

                                            {/each}

                                        </BuildingRecipeGroup>

                                    {/each}

                                {/if}

                                {#if !pumpAsOutcome.isEmpty}

                                    {@const grouped = pumpAsOutcome.groupByBuilding()}

                                    {#each grouped.values() as group}

                                        <BuildingRecipeGroup
                                            building={group.building}
                                        >

                                            {#each group.list as recipe}

                                                {@const
                                                    formula: NodeRecipeGeneric = { type: RecipeType.PUMPING, recipe }}

                                                <button
                                                    on:click|preventDefault|stopPropagation={() => onFormulaClick(selectedItemNode!, formula)}
                                                >

                                                    <RecipeFormula
                                                        processTimeMs={recipe.processTimeMs}
                                                        showHoverEffect={true}
                                                    >

                                                        <RecipeItemChain
                                                            slot="left"
                                                            items={recipe.ingredients}
                                                            resourcePoint={recipe.resourcePoint}
                                                            highlightItemFn={highlightItem}
                                                        />

                                                        <RecipeItemChain
                                                            slot="right"
                                                            items={recipe.outcomes}
                                                            highlightItemFn={highlightItem}
                                                        />

                                                    </RecipeFormula>

                                                </button>

                                            {/each}

                                        </BuildingRecipeGroup>

                                    {/each}

                                {/if}

                            </RecipeSidebarSector>

                        {/if}

                        {#if selectedItemNode.parent === null}

                            {@const machineAsIncome = machineCraftSearcher.searchByItemAsIncome(selectedItem.gameId)}
                            {@const manualAsIncome = manualCraftSearcher.searchByItemAsIncome(selectedItem.gameId)}
                            {@const hubAsIncome = hubCraftSearcher.searchByItemAsIncome(selectedItem.gameId)}
                            {@const minerAsIncome = minerRecipeSearcher.searchByItemAsIncome(selectedItem.gameId)}
                            {@const gasMinerAsIncome = gasMinerRecipeSearcher.searchByItemAsIncome(selectedItem.gameId)}
                            {@const
                                powerStationAsIncome = powerRecipeSearcher.searchByItemAsIncome(selectedItem.gameId)}

                            {@const hasUsing = !machineAsIncome.isEmpty
                                || !manualAsIncome.isEmpty
                                || !hubAsIncome.isEmpty
                                || !minerAsIncome.isEmpty
                                || !gasMinerAsIncome.isEmpty
                                || !powerStationAsIncome.isEmpty}

                            {#if hasUsing}

                                <RecipeSidebarSector
                                    title={$t("formulaSidebar.sector.using")}
                                >

                                    {#if !hubAsIncome.isEmpty}

                                        <SourceRecipeGroup
                                            recipeSource={RecipeSource.HUB}
                                        >

                                            {#each hubAsIncome.list as recipe}

                                                <RecipeFormula>

                                                    <RecipeItemChain
                                                        slot="left"
                                                        items={recipe.ingredients}
                                                        highlightItemFn={highlightItem}
                                                        getItemUrlFn={getItemStackUrl}
                                                    />

                                                    <RecipeItemChain
                                                        slot="right"
                                                        items={recipe.outcomes}
                                                        highlightItemFn={highlightItem}
                                                        getItemUrlFn={(stack) => getRecipeTreeUrlCraft(RecipeType.HUB, stack.item.gameId, recipe.gameId)}
                                                    />

                                                </RecipeFormula>

                                            {/each}

                                        </SourceRecipeGroup>

                                    {/if}

                                    {#if !manualAsIncome.isEmpty}

                                        <SourceRecipeGroup
                                            recipeSource={RecipeSource.MANUAL}
                                        >

                                            {#each manualAsIncome.list as recipe}

                                                <RecipeFormula>

                                                    <RecipeItemChain
                                                        slot="left"
                                                        items={recipe.ingredients}
                                                        highlightItemFn={highlightItem}
                                                        getItemUrlFn={getItemStackUrl}
                                                    />

                                                    <RecipeItemChain
                                                        slot="right"
                                                        items={recipe.outcomes}
                                                        highlightItemFn={highlightItem}
                                                        getItemUrlFn={(stack) => getRecipeTreeUrlCraft(RecipeType.MANUAL, stack.item.gameId, recipe.gameId)}
                                                    />

                                                </RecipeFormula>

                                            {/each}

                                        </SourceRecipeGroup>

                                    {/if}

                                    {#if !machineAsIncome.isEmpty}

                                        {@const grouped = machineAsIncome.groupByBuilding()}

                                        {#each grouped.values() as group}

                                            <BuildingRecipeGroup
                                                building={group.building}
                                            >

                                                {#each group.list as recipe}

                                                    <RecipeFormula
                                                        processTimeMs={recipe.processTimeMs}
                                                    >

                                                        <RecipeItemChain
                                                            slot="left"
                                                            items={recipe.ingredients}
                                                            highlightItemFn={highlightItem}
                                                            getItemUrlFn={getItemStackUrl}
                                                        />

                                                        <RecipeItemChain
                                                            slot="right"
                                                            items={recipe.outcomes}
                                                            highlightItemFn={highlightItem}
                                                            getItemUrlFn={(stack) => getRecipeTreeUrlCraft(RecipeType.MACHINE, stack.item.gameId, recipe.gameId)}
                                                        />

                                                    </RecipeFormula>

                                                {/each}

                                            </BuildingRecipeGroup>

                                        {/each}

                                    {/if}

                                    {#if !minerAsIncome.isEmpty}

                                        {@const grouped = minerAsIncome.groupByBuilding()}

                                        {#each grouped.values() as group}

                                            <BuildingRecipeGroup
                                                building={group.building}
                                            >

                                                {#each group.list as recipe}

                                                    <RecipeFormula
                                                        processTimeMs={recipe.processTimeMs}
                                                    >

                                                        <RecipeItemChain
                                                            slot="left"
                                                            items={recipe.ingredients}
                                                            resourcePoint={recipe.resourcePoint}
                                                            highlightItemFn={highlightItem}
                                                            getItemUrlFn={getItemStackUrl}
                                                        />

                                                        <RecipeItemChain
                                                            slot="right"
                                                            items={recipe.outcomes}
                                                            highlightItemFn={highlightItem}
                                                            getItemUrlFn={(stack) => getRecipeTreeUrlBuilding(RecipeType.MINING, stack.item.gameId, recipe.building.gameId)}
                                                        />

                                                    </RecipeFormula>

                                                {/each}

                                            </BuildingRecipeGroup>

                                        {/each}

                                    {/if}

                                    {#if !gasMinerAsIncome.isEmpty}

                                        {@const grouped = gasMinerAsIncome.groupByBuilding()}

                                        {#each grouped.values() as group}

                                            <BuildingRecipeGroup
                                                building={group.building}
                                            >

                                                {#each group.list as recipe}

                                                    <RecipeFormula
                                                        processTimeMs={recipe.processTimeMs}
                                                    >

                                                        <RecipeItemChain
                                                            slot="left"
                                                            items={recipe.ingredients}
                                                            resourcePoint={recipe.resourcePoint}
                                                            highlightItemFn={highlightItem}
                                                            getItemUrlFn={getItemStackUrl}
                                                        />

                                                        <RecipeItemChain
                                                            slot="right"
                                                            items={recipe.outcomes}
                                                            highlightItemFn={highlightItem}
                                                            getItemUrlFn={(stack) => getRecipeTreeUrlBuilding(RecipeType.GAS_MINING, stack.item.gameId, recipe.building.gameId)}
                                                        />

                                                    </RecipeFormula>

                                                {/each}

                                            </BuildingRecipeGroup>

                                        {/each}

                                    {/if}

                                    {#if !powerStationAsIncome.isEmpty}

                                        {@const grouped = powerStationAsIncome.groupByBuilding()}

                                        {#each grouped.values() as group}

                                            <BuildingRecipeGroup
                                                building={group.building}
                                            >

                                                {#each group.list as recipe}

                                                    <RecipeFormula
                                                        processTimeMs={recipe.processTimeMs}
                                                    >

                                                        <RecipeItemChain
                                                            slot="left"
                                                            items={recipe.ingredients}
                                                            highlightItemFn={highlightItem}
                                                            getItemUrlFn={getItemStackUrl}
                                                        />

                                                        <FuelEnergyCard
                                                            slot="right"
                                                            powerProvide={recipe.powerProvide}
                                                        />

                                                    </RecipeFormula>

                                                {/each}

                                            </BuildingRecipeGroup>

                                        {/each}

                                    {/if}

                                </RecipeSidebarSector>

                            {/if}

                        {/if}

                    </div>

                {:else if selectedBuildingNode !== null}

                    {@const currentFormula = selectedBuildingNode.recipe!}
                    {@const building = getBuildingFromFormula(currentFormula)}

                    {@const hubAsOutcome = building ? hubCraftSearcher.searchByItemAsOutcome(building.item.gameId) : null}

                    <div class="flex flex-col justify-start gap-10">

                        <RecipeSidebarSector
                            title={$t("formulaSidebar.sector.currentFormulas")}
                        >

                            {#if currentFormula.type === RecipeType.MANUAL || currentFormula.type === RecipeType.HUB}

                                <RecipeFormula>

                                    <RecipeItemChain
                                        slot="left"
                                        items={currentFormula.recipe.ingredients}
                                        highlightItemFn={highlightItem}
                                        getItemUrlFn={getItemStackUrl}
                                    />

                                    <RecipeItemChain
                                        slot="right"
                                        items={currentFormula.recipe.outcomes}
                                        highlightItemFn={highlightItem}
                                        getItemUrlFn={(stack) => getRecipeTreeUrlCraft(currentFormula.type, stack.item.gameId, currentFormula.recipe.gameId)}
                                    />

                                </RecipeFormula>

                            {:else if currentFormula.type === RecipeType.MACHINE}

                                <RecipeFormula
                                    processTimeMs={currentFormula.recipe.processTimeMs}
                                >

                                    <RecipeItemChain
                                        slot="left"
                                        items={currentFormula.recipe.ingredients}
                                        highlightItemFn={highlightItem}
                                        getItemUrlFn={getItemStackUrl}
                                    />

                                    <RecipeItemChain
                                        slot="right"
                                        items={currentFormula.recipe.outcomes}
                                        highlightItemFn={highlightItem}
                                        getItemUrlFn={(stack) => getRecipeTreeUrlCraft(currentFormula.type, stack.item.gameId, currentFormula.recipe.gameId)}
                                    />

                                </RecipeFormula>

                            {:else}

                                <RecipeFormula
                                    processTimeMs={currentFormula.recipe.processTimeMs}
                                >

                                    <RecipeItemChain
                                        slot="left"
                                        items={currentFormula.recipe.ingredients}
                                        resourcePoint={currentFormula.recipe.resourcePoint}
                                        highlightItemFn={highlightItem}
                                        getItemUrlFn={getItemStackUrl}
                                    />

                                    <RecipeItemChain
                                        slot="right"
                                        items={currentFormula.recipe.outcomes}
                                        highlightItemFn={highlightItem}
                                        getItemUrlFn={(stack) => getRecipeTreeUrlBuilding(currentFormula.type, stack.item.gameId, currentFormula.recipe.building.gameId)}
                                    />

                                </RecipeFormula>

                            {/if}

                        </RecipeSidebarSector>

                        {#if hubAsOutcome && !hubAsOutcome.isEmpty}

                            <RecipeSidebarSector
                                title={$t("formulaSidebar.sector.source")}
                            >

                                <SourceRecipeGroup
                                    recipeSource={RecipeSource.HUB}
                                >

                                    {#each hubAsOutcome.list as recipe}

                                        <RecipeFormula>

                                            <RecipeItemChain
                                                slot="left"
                                                items={recipe.ingredients}
                                                highlightItemFn={highlightItem}
                                                getItemUrlFn={getItemStackUrl}
                                            />

                                            <RecipeItemChain
                                                slot="right"
                                                items={recipe.outcomes}
                                                highlightItemFn={highlightItem}
                                                getItemUrlFn={(stack) => getRecipeTreeUrlCraft(RecipeType.HUB, stack.item.gameId, recipe.gameId)}
                                            />

                                        </RecipeFormula>

                                    {/each}

                                </SourceRecipeGroup>

                            </RecipeSidebarSector>

                        {/if}

                    </div>

                {/if}

            </RecipeSidebar>

        </div>

    </BottomSheet>

</div>