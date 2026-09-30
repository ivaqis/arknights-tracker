<script lang="ts">
    import type { IFood } from "$lib/classes/gameData/items/food/IFood";
    import FoodDetailView from "$lib/components/food/FoodDetailView.svelte";
    import NotFound from "$lib/components/NotFound.svelte";
    import { foodStorage } from "$lib/dataStorages/items/foodStorage";
    import { t } from "$lib/i18n.js";

    export let data;

    let food: IFood | null;

    $: food = foodStorage.byGameId.get(data.itemId) ?? null;

    $: pageTitle = getPageTitle(food);

    function getPageTitle(food: IFood | null): string {
        if (!food) {
            return `${$t("pages.food")} - Goyfield`;
        }

        return `${$t(food.i18nKey)} - ${$t("pages.food")} - Goyfield`
    }
</script>

<svelte:head>

    <title>{pageTitle}</title>
    <meta property="og:title" content={pageTitle} />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content={pageTitle} />

</svelte:head>

{#if food !== null}

    <FoodDetailView
        item={food}
    />

{:else}

    <NotFound/>

{/if}