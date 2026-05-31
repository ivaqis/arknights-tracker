<script>
    import {t} from "$lib/i18n";
    import {Item} from "$lib/classes/items/Item.js";
    import {MachineCraftSearcher} from "$lib/classes/crafts/searchers/MachineCraftSearcher.js";
    import {ManualCraftSearcher} from "$lib/classes/crafts/searchers/ManualCraftSearcher.js";
    import {HubCraftSearcher} from "$lib/classes/crafts/searchers/HubCraftSearcher.js";
    import {MinerSearcher} from "$lib/classes/crafts/searchers/MinerSearcher.js";
    import {PumpSearcher} from "$lib/classes/crafts/searchers/PumpSearcher.js";
    import {Building} from "$lib/classes/buildings/Building.js";
    import {Crafter} from "$lib/classes/buildings/Crafter.js";
    import {Miner} from "$lib/classes/buildings/Miner.js";
    import {Pump} from "$lib/classes/buildings/Pump.js";
    import Formula from "$lib/components/recipes/Formula.svelte";
    import {MachineCraft} from "$lib/classes/crafts/MachineCraft.js";
    import Icons from "$lib/components/Icons.svelte";
    import SidebarSectorLabel from "$lib/components/recipes/SidebarSectorLabel.svelte";
    import SidebarCraftSourceLabel from "$lib/components/recipes/SidebarCraftSourceLabel.svelte";
    import {ManualCraft} from "$lib/classes/crafts/ManualCraft.js";
    import {HubCraft} from "$lib/classes/crafts/HubCraft.js";
    import {ResourcePoint} from "$lib/classes/items/ResourcePoint.js";
    import {PowerStation} from "$lib/classes/buildings/PowerStation.js";
    import {PowerStationSearcher} from "$lib/classes/crafts/searchers/PowerStationSearcher.js";
    import {PowerFormula} from "$lib/classes/crafts/PowerFormula.js";
    import {Fuel} from "$lib/classes/items/Fuel.js";

    export let currentItemId = "";

    $: item = Item.getItem(currentItemId);

    const machineCraftSearcher = new MachineCraftSearcher();
    const manualCraftSearcher = new ManualCraftSearcher();
    const hubCraftSearcher = new HubCraftSearcher();
    const minerSearcher = new MinerSearcher();
    const pumpSearcher = new PumpSearcher();
    const powerStationSearcher = new PowerStationSearcher();

    let machineCraftSearchResultAsIncome;
    let manualCraftSearchResultAsIncome;
    let hubCraftSearchResultAsIncome;

    let machineCraftSearchResultAsOutcome;
    let manualCraftSearchResultAsOutcome;
    let hubCraftSearchResultAsOutcome;

    let machineCraftSearchResultAsCrafter;

    let minerSearchResult;
    let pumpSearchResult;
    let powerStationSearchResult;

    $: building = Building.getBuildingFromItemId(item?.id ?? "");
    $: buildingId = building?.id;
    $: isCrafter = Crafter.isCrafter(buildingId ?? "");
    $: miner = Miner.getMiner(buildingId ?? "");
    $: pump = Pump.getPump(buildingId ?? "");
    $: powerStation = PowerStation.getPowerStation(buildingId ?? "");

    $: if (item) {
        machineCraftSearchResultAsIncome = machineCraftSearcher.searchByItemAsIncome(item.id);
        machineCraftSearchResultAsOutcome = machineCraftSearcher.searchByItemAsOutcome(item.id);

        manualCraftSearchResultAsIncome = manualCraftSearcher.searchByItemAsIncome(item.id);
        manualCraftSearchResultAsOutcome = manualCraftSearcher.searchByItemAsOutcome(item.id);

        hubCraftSearchResultAsIncome = hubCraftSearcher.searchByItemAsIncome(item.id);
        hubCraftSearchResultAsOutcome = hubCraftSearcher.searchByItemAsOutcome(item.id);

        minerSearchResult = minerSearcher.searchByItemAsOutcome(item.id);
        pumpSearchResult = pumpSearcher.searchByItemAsOutcome(item.id);
        powerStationSearchResult = powerStationSearcher.searchByItemAsIncome(item.id);

        if (buildingId && isCrafter) {
            machineCraftSearchResultAsCrafter = machineCraftSearcher.searchByCrafter(buildingId);
        }
    }

    $: hasOutcomeFormulas = !(machineCraftSearchResultAsOutcome?.isEmpty() ?? true)
        || !(manualCraftSearchResultAsOutcome?.isEmpty() ?? true)
        || !(hubCraftSearchResultAsOutcome?.isEmpty() ?? true)
        || !(minerSearchResult?.isEmpty() ?? true)
        || !(pumpSearchResult?.isEmpty() ?? true);

    $: hasIncomeFormulas = !(machineCraftSearchResultAsIncome?.isEmpty() ?? true)
        || !(manualCraftSearchResultAsIncome?.isEmpty() ?? true)
        || !(hubCraftSearchResultAsIncome?.isEmpty() ?? true)
        || !(powerStationSearchResult?.isEmpty() ?? true);

    $: sortedEnableFuelIds = [...(powerStation?.enableFuelIds ?? [])]
        .sort((a, b) => Fuel.getFuel(a).powerProvide - Fuel.getFuel(b).powerProvide);

</script>

<div class="flex overflow-auto h-full w-full
    bg-white dark:bg-[#383838] rounded-3xl border border-gray-200 dark:border-[#444] transition-colors">

    {#if (item)}
        <div class="flex flex-col justify-start w-full">

            <div class="flex items-center pl-6 pr-6 pt-3 pb-3 min-h-16 overflow-hidden border-b border-gray-200 dark:border-[#444]">
                <h2 class="font-sdk text-xl md:text-2xl font-bold text-[#21272C] dark:text-[#FDFDFD] leading-tight drop-shadow-sm">
                    {$t(`itemNames.${currentItemId}`)}
                </h2>
            </div>

            <div class="flex flex-col justify-start w-full pl-6 pr-6 pt-3 pb-6 gap-10">
                {#if (hasOutcomeFormulas)}
                    <div class="flex flex-col justify-start w-full gap-3">

                        <SidebarSectorLabel text={$t("formulaSidebar.sector.source")}/>

                        {#if (!hubCraftSearchResultAsOutcome.isEmpty())}
                            <SidebarCraftSourceLabel
                                text={$t("formulaSidebar.craftSource.hub")}
                                iconVariant="hubCraft"
                            />
                        {/if}

                        {#each hubCraftSearchResultAsOutcome.craftList as craftId}

                            <Formula
                                formula={HubCraft.getHubCraft(craftId)}
                                highlightItemId={currentItemId}
                            />

                        {/each}

                        {#if (!manualCraftSearchResultAsOutcome.isEmpty())}
                            <SidebarCraftSourceLabel
                                text={$t("formulaSidebar.craftSource.manual")}
                                iconVariant="manualCraft"
                            />
                        {/if}

                        {#each manualCraftSearchResultAsOutcome.craftList as craftId}

                            <Formula
                                formula={ManualCraft.getManualCraft(craftId)}
                                highlightItemId={currentItemId}
                            />

                        {/each}

                        {#each minerSearchResult.buildingIdList as minerId}
                            {#if (ResourcePoint.isItemResourcePoint(currentItemId))}

                                <SidebarCraftSourceLabel
                                    text={$t(`buildingNames.${minerId}`)}
                                    iconId={Miner.getMiner(minerId).iconId}
                                    iconVariant="building-icon"
                                />

                                <Formula
                                    formula={Miner.getMiner(minerId).getMiningFormula(currentItemId)}
                                    highlightItemId={currentItemId}
                                />

                            {/if}
                        {/each}

                        {#each pumpSearchResult.buildingIdList as pumpId}
                            {#if (ResourcePoint.isItemResourcePoint(currentItemId))}

                                <SidebarCraftSourceLabel
                                    text={$t(`buildingNames.${pumpId}`)}
                                    iconId={Pump.getPump(pumpId).iconId}
                                    iconVariant="building-icon"
                                />

                                <Formula
                                    formula={Pump.getPump(pumpId).getPumpingFormula(currentItemId)}
                                    highlightItemId={currentItemId}
                                />

                            {/if}
                        {/each}

                        {#each machineCraftSearchResultAsOutcome.getCrafterIdList() as crafterId}

                            <SidebarCraftSourceLabel
                                text={$t(`buildingNames.${crafterId}`)}
                                iconId={Building.getBuilding(crafterId).iconId}
                                iconVariant="building-icon"
                            />

                            {#each machineCraftSearchResultAsOutcome.getCrafterModeList(crafterId) as crafterMode}
                                {#each machineCraftSearchResultAsOutcome.getCraftList(crafterId, crafterMode) as craftId}

                                    <Formula
                                        formula={MachineCraft.getMachineCraft(craftId)}
                                        highlightItemId={currentItemId}
                                    />

                                {/each}
                            {/each}

                        {/each}

                    </div>
                {/if}

                {#if (hasIncomeFormulas)}
                    <div class="flex flex-col justify-start w-full gap-3">

                        <SidebarSectorLabel text={$t("formulaSidebar.sector.using")}/>

                        {#if (!hubCraftSearchResultAsIncome.isEmpty())}
                            <SidebarCraftSourceLabel
                                text={$t("formulaSidebar.craftSource.hub")}
                                iconVariant="hubCraft"
                            />
                        {/if}

                        {#each hubCraftSearchResultAsIncome.craftList as craftId}

                            <Formula
                                formula={HubCraft.getHubCraft(craftId)}
                                highlightItemId={currentItemId}
                            />

                        {/each}

                        {#if (!manualCraftSearchResultAsIncome.isEmpty())}
                            <SidebarCraftSourceLabel
                                text={$t("formulaSidebar.craftSource.manual")}
                                iconVariant="manualCraft"
                            />
                        {/if}

                        {#each manualCraftSearchResultAsIncome.craftList as craftId}

                            <Formula
                                formula={ManualCraft.getManualCraft(craftId)}
                                highlightItemId={currentItemId}
                            />

                        {/each}

                        {#each machineCraftSearchResultAsIncome.getCrafterIdList() as crafterId}

                            <SidebarCraftSourceLabel
                                text={$t(`buildingNames.${crafterId}`)}
                                iconId={Building.getBuilding(crafterId).iconId}
                                iconVariant="building-icon"
                            />

                            {#each machineCraftSearchResultAsIncome.getCrafterModeList(crafterId) as crafterMode}
                                {#each machineCraftSearchResultAsIncome.getCraftList(crafterId, crafterMode) as craftId}

                                    <Formula
                                        formula={MachineCraft.getMachineCraft(craftId)}
                                        highlightItemId={currentItemId}
                                    />

                                {/each}
                            {/each}

                        {/each}

                        {#each powerStationSearchResult.buildingIdList as powerStationId}

                            <SidebarCraftSourceLabel
                                text={$t(`buildingNames.${powerStationId}`)}
                                iconId={PowerStation.getPowerStation(powerStationId).iconId}
                                iconVariant="building-icon"
                            />

                            <Formula
                                formula={PowerFormula.getPowerFormulaFromId(powerStationId, currentItemId)}
                                highlightItemId={currentItemId}
                            />

                        {/each}

                    </div>
                {/if}

                {#if (isCrafter)}
                    <div class="flex flex-col justify-start w-full gap-3">

                        <SidebarSectorLabel text={$t("formulaSidebar.sector.availableFormulas")}/>

                        {#each machineCraftSearchResultAsCrafter.getCrafterModeList(buildingId) as crafterMode}

                            <SidebarCraftSourceLabel
                                text={$t(`buildingModes.${crafterMode}`)}
                                iconVariant="buildingMode"
                                buildingModeName={crafterMode}
                            />

                            {#each machineCraftSearchResultAsCrafter.getCraftList(buildingId, crafterMode) as craftId}

                                <Formula
                                    formula={MachineCraft.getMachineCraft(craftId)}
                                    highlightItemId={currentItemId}
                                />

                            {/each}

                        {/each}

                    </div>
                {/if}

                {#if (miner)}
                    <div class="flex flex-col justify-start w-full gap-3">

                        <SidebarSectorLabel text={$t("formulaSidebar.sector.resourceCollection")}/>

                        {#each miner.mineableItemIds as itemId}
                            {#if (ResourcePoint.isItemResourcePoint(itemId))}
                                <Formula
                                    formula={miner.getMiningFormula(itemId)}
                                    highlightItemId={currentItemId}
                                />
                            {/if}
                        {/each}

                    </div>
                {/if}

                {#if (pump)}
                    <div class="flex flex-col justify-start w-full gap-3">

                        <SidebarSectorLabel text={$t("formulaSidebar.sector.resourceCollection")}/>

                        {#each pump.enableLiquidIds as itemId}
                            {#if (ResourcePoint.isItemResourcePoint(itemId))}
                                <Formula
                                    formula={pump.getPumpingFormula(itemId)}
                                    highlightItemId={currentItemId}
                                />
                            {/if}
                        {/each}

                    </div>
                {/if}

                {#if (powerStation)}
                    <div class="flex flex-col justify-start w-full gap-3">

                        <SidebarSectorLabel text={$t("formulaSidebar.sector.availableFunctions")} />

                        {#each sortedEnableFuelIds as itemId}
                            <Formula
                                formula={PowerFormula.getPowerFormulaFromId(buildingId, itemId)}
                            />
                        {/each}

                    </div>
                {/if}

            </div>

        </div>

    {:else}

        <div class="flex-1 flex flex-col justify-center items-center">
            <Icons name="noData" class="w-16 h-16" />
        </div>

    {/if}


</div>