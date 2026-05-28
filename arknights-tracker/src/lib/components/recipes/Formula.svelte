<script>
    import {MachineCraft} from "$lib/classes/crafts/MachineCraft.js";
    import {ManualCraft} from "$lib/classes/crafts/ManualCraft.js";
    import {HubCraft} from "$lib/classes/crafts/HubCraft.js";
    import {MiningFormula} from "$lib/classes/crafts/MiningFormula.js";
    import {PumpingFormula} from "$lib/classes/crafts/PumpingFormula.js";

    export let formula;

    $: mode = formula instanceof MachineCraft ? "machineCraft"
        : formula instanceof ManualCraft ? "manualCraft"
        : formula instanceof HubCraft ? "hubCraft"
        : formula instanceof MiningFormula ? "miningFormula"
        : formula instanceof PumpingFormula ? "pumpingFormula"
        : "";

    
</script>