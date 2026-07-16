<script>
    import { page } from "$app/stores";
    import { Miner } from "$lib/classes/buildings/Miner.js";
    import { Pump } from "$lib/classes/buildings/Pump.js";
    import { HubCraft } from "$lib/classes/crafts/HubCraft.js";
    import { MachineCraft } from "$lib/classes/crafts/MachineCraft.js";
    import { ManualCraft } from "$lib/classes/crafts/ManualCraft.js";
    import BottomSheet from "$lib/components/BottomSheet.svelte";
    import Button from "$lib/components/Button.svelte";
    import FormulaSidebar from "$lib/components/recipes/FormulaSidebar.svelte";
    import FormulaTreePlate from "$lib/components/recipes/FormulaTreePlate.svelte";
    import { t } from "$lib/i18n";

    $: startItemId = $page.url.searchParams.get("itemId");
    $: startFormulaType = $page.url.searchParams.get("type");
    $: startFromulaId = $page.url.searchParams.get("formulaId");
    $: startFormulaBuildingId = $page.url.searchParams.get("buildingId");

    let startFormula;

    $: if (startFormulaType === "machineCraft" && startFromulaId) {
        startFormula = MachineCraft.getMachineCraft(startFromulaId);

    } else if (startFormulaType === "manualCraft" && startFromulaId) {
        startFormula = ManualCraft.getManualCraft(startFromulaId);

    } else if (startFormulaType === "hubCraft" && startFromulaId) {
        startFormula = HubCraft.getHubCraft(startFromulaId);

    } else if (startFormulaType === "miningFormula" && startFormulaBuildingId) {
        startFormula = Miner.getMiner(startFormulaBuildingId)?.getMiningFormula(startItemId);

    } else if (startFormulaType === "pumpingFormula" && startFormulaBuildingId) {
        startFormula = Pump.getPump(startFormulaBuildingId)?.getPumpingFormula(startItemId);

    } else {
        startFormula = null;
    }

    let isBottomSheetOpen = false;
    let sidebarMode = "tree";

    let selectedItemNode;
    let selectedBuildingNode;

    let currentItemId;
    let currentBuildingId;
    let currentFormulas = [];
    let isHeadItem = false;

    $: if (selectedItemNode) {
        sidebarMode = "tree";

        currentItemId = selectedItemNode.itemId;

        currentFormulas = [];

        let formula = selectedItemNode.formula;
        if (formula) {
            currentFormulas.push(formula);
        }

        let parentFormula = selectedItemNode.parentNode?.formula;
        if (parentFormula) {
            currentFormulas.push(parentFormula);
        }

        isHeadItem = !selectedItemNode.parentNode;

    } else if (selectedBuildingNode) {
        sidebarMode = "building";

        currentItemId = selectedBuildingNode.itemId;

        currentFormulas = [];

        let formula = selectedBuildingNode.formula;
        if (formula) {
            currentFormulas.push(formula);

            currentBuildingId = formula.crafterId || formula.minerId || formula.pumpId;

            if (formula.formulaType === "manualCraft") sidebarMode = "manual";
            if (formula.formulaType === "hubCraft") sidebarMode = "hub";

        } else {
            currentBuildingId = null;
        }

        isHeadItem = false;

    } else {
        currentItemId = null;
        currentBuildingId = null;
        currentFormulas = [];
        isHeadItem = false;
        sidebarMode = "";
    }


    let selectedFormula;


</script>

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
                    <path d="M15 18l-6-6 6-6"/>
                </svg>
            </Button>

            <div class="flex items-baseline flex-wrap gap-2 md:gap-3 font-sdk">
                <h2 class="text-3xl md:text-5xl tracking-wide text-[#21272C] dark:text-[#FDFDFD]">
                    {$t("pages.recipeTree")}
                </h2>
            </div>

        </div>

        <div class="w-full h-[calc(100vh-144px)]">

            <FormulaTreePlate
                startItemId={startItemId}
                startFormula={startFormula}
                bind:selectedFormula={selectedFormula}
                bind:isBottomSheetOpen={isBottomSheetOpen}
                bind:selectedItemNode={selectedItemNode}
                bind:selectedBuildingNode={selectedBuildingNode}
            />

        </div>

    </div>

    <BottomSheet bind:isOpen={isBottomSheetOpen}>
        <div class="w-full min-h-[50vh] h-full xl:h-[calc(100vh-64px)] sticky top-8">

            <FormulaSidebar
                currentItemId={currentItemId}
                currentBuildingId={currentBuildingId}
                mode="{sidebarMode}"
                currentFormulas={currentFormulas}
                isHeadItem={isHeadItem}
                bind:selectedFormula={selectedFormula}
                bind:isBottomSheetOpen={isBottomSheetOpen}
            />

        </div>
    </BottomSheet>

</div>