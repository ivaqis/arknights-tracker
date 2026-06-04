<script>
    import {FormulaTree} from "$lib/classes/formulaTree/FormulaTree.js";
    import {Item} from "$lib/classes/items/Item.js";
    import DragPlate from "$lib/components/DragPlate.svelte";

    let {
        startItemId = "item_plant_grass_1",
        startFormula
    } = $props();

    const tree = $state(new FormulaTree());

    let startItem = $derived(Item.getItem(startItemId));

    $effect(() => {
        tree.setStartNode(startItem.id, startFormula);
    });

    let nodes = $derived([...tree.getIterator()]);


</script>

<DragPlate>
    <div class="min-h-20 min-w-20 bg-gray-600">

    </div>
</DragPlate>