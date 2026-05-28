<script>
    import {Item} from "$lib/classes/items/Item.js";
    import ItemStackCard from "$lib/components/ItemStackCard.svelte";
    import {MachineCraftSearcher} from "$lib/classes/crafts/searchers/MachineCraftSearcher.js";
    import {ManualCraftSearcher} from "$lib/classes/crafts/searchers/ManualCraftSearcher.js";
    import {HubCraftSearcher} from "$lib/classes/crafts/searchers/HubCraftSearcher.js";
    import {MinerSearcher} from "$lib/classes/crafts/searchers/MinerSearcher.js";
    import {PumpSearcher} from "$lib/classes/crafts/searchers/PumpSearcher.js";
    import {Building} from "$lib/classes/buildings/Building.js";
    import {Crafter} from "$lib/classes/buildings/Crafter.js";
    import {Miner} from "$lib/classes/buildings/Miner.js";
    import {Pump} from "$lib/classes/buildings/Pump.js";
    import ResourcePointCard from "$lib/components/recipes/ResourcePointCard.svelte";

    export let currentItemId = "";

    $: item = Item.getItem(currentItemId);

    const machineCraftSearcher = new MachineCraftSearcher();
    const manualCraftSearcher = new ManualCraftSearcher();
    const hubCraftSearcher = new HubCraftSearcher();
    const minerSearcher = new MinerSearcher();
    const pumpSearcher = new PumpSearcher();

    let machineCraftSearchResultAsIncome;
    let manualCraftSearchResultAsIncome;
    let hubCraftSearchResultAsIncome;

    let machineCraftSearchResultAsOutcome;
    let manualCraftSearchResultAsOutcome;
    let hubCraftSearchResultAsOutcome;

    let machineCraftSearchResultAsCrafter;

    let availableMiners;
    let availablePumps;

    $: buildingId = Building.getBuildingIdFromItemId(item?.id ?? "");
    $: isCrafter = Crafter.isCrafter(buildingId ?? "") ?? false;
    $: miner = Miner.getMiner(buildingId ?? "");
    $: pump = Pump.getPump(buildingId ?? "");

    $: if (item) {
        machineCraftSearchResultAsIncome = machineCraftSearcher.searchByItemAsIncome(item.id);
        machineCraftSearchResultAsOutcome = machineCraftSearcher.searchByItemAsOutcome(item.id);

        manualCraftSearchResultAsIncome = manualCraftSearcher.searchByItemAsIncome(item.id);
        manualCraftSearchResultAsOutcome = manualCraftSearcher.searchByItemAsOutcome(item.id);

        hubCraftSearchResultAsIncome = hubCraftSearcher.searchByItemAsIncome(item.id);
        hubCraftSearchResultAsOutcome = hubCraftSearcher.searchByItemAsOutcome(item.id);

        availableMiners = minerSearcher.searchByItemAsOutcome(item.id);
        availablePumps = pumpSearcher.searchByItemAsOutcome(item.id);

        if (buildingId && isCrafter) {
            machineCraftSearchResultAsCrafter = machineCraftSearcher.searchByCrafter(buildingId);
        }
    }

</script>

<div class="flex-grow flex flex-col justify-start min-w-[300px] overflow-auto sticky top-10 h-[95vh]
    bg-white dark:bg-[#383838] rounded-3xl border border-gray-200 dark:border-[#444] transition-colors">

    {#if (currentItemId)}

        <div class="relative flex p-6 overflow-hidden border-b border-gray-200 dark:border-[#444]">
            <h2 class="font-sdk text-xl md:text-2xl font-bold text-[#21272C] dark:text-[#FDFDFD] leading-tight drop-shadow-sm">
                {currentItemId}
            </h2>
        </div>

    {/if}

    <div class="relative flex p-6 overflow-hidden gap-2">
        <ItemStackCard itemId={currentItemId} amount={50000}/>
        <ItemStackCard itemId={currentItemId} amount={50000} size="small"/>
        <ItemStackCard itemId={currentItemId} amount={10} size="micro"/>
    </div>

    <div class="relative flex p-6 overflow-hidden gap-2">
        <ResourcePointCard itemId="item_copper_ore" resourcePoint="miner"/>
        <ResourcePointCard itemId="item_copper_ore" resourcePoint="miner" size="small"/>
        <ResourcePointCard itemId="item_copper_ore" resourcePoint="miner" size="micro"/>
    </div>

    <div class="relative flex p-6 overflow-hidden gap-2">
        <ResourcePointCard itemId="item_liquid_acid" resourcePoint="liquid"/>
        <ResourcePointCard itemId="item_liquid_acid" resourcePoint="liquid" size="small"/>
        <ResourcePointCard itemId="item_liquid_acid" resourcePoint="liquid" size="micro"/>
    </div>

</div>