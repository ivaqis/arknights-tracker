<script lang="ts">
    import type { IFood } from "$lib/classes/gameData/items/food/IFood";
    import FoodDetailView from "$lib/components/food/FoodDetailView.svelte";
    import NotFound from "$lib/components/NotFound.svelte";
    import { foodStorage } from "$lib/dataStorages/items/foodStorage";

    export let data;

    let food: IFood | null;

    $: food = foodStorage.byGameId.get(data.itemId) ?? null;
</script>

{#if food !== null}

    <FoodDetailView
        item={food}
    />

{:else}

    <NotFound/>

{/if}