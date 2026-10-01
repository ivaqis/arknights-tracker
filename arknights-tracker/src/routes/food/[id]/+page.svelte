<script lang="ts">
    import type { IFood } from "$lib/classes/gameData/items/food/IFood";
    import Button from "$lib/components/Button.svelte";
    import FoodDetailView from "$lib/components/food/FoodDetailView.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import NotFound from "$lib/components/NotFound.svelte";
    import { foodStorage } from "$lib/dataStorages/items/foodStorage";
    import { t } from "$lib/i18n";

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

    <div class="w-full max-w-[1500px] mx-auto mb-6">
        <Button variant="roundSmall" color="white" onClick={() => history.back()}>
            <Icon name="arrowLeft" class="w-5 h-5" />
        </Button>
    </div>

    <FoodDetailView
        item={food}
    />

{:else}

    <NotFound/>

{/if}