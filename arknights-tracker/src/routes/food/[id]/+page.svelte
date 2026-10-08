<script lang="ts">
    import { page } from "$app/stores";
    import type { IFood } from "$lib/classes/gameData/items/food/IFood";
    import Button from "$lib/components/Button.svelte";
    import FoodDetailView from "$lib/components/food/FoodDetailView.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import NotFound from "$lib/components/NotFound.svelte";
    import { foodStorage } from "$lib/dataStorages/items/foodStorage";
    import { t } from "$lib/i18n";
    import { getImagePath } from "$lib/utils/imageUtils.js";

    export let data;

    let food: IFood | null;

    $: food = foodStorage.byGameId.get(data.itemId) ?? null;
    $: foodName = food ? $t(food.i18nKey) : "";
    $: pageTitle = foodName ? `${foodName} - ${$t("pages.food")} - Goyfield` : `${$t("pages.food")} - Goyfield`;
    $: pageDescription = $t("seo.descriptions.foodDetail", { name: foodName || data.itemId });
    $: imageUrl = food ? `${$page.url.origin}${getImagePath(food.icon.iconId, "item-icon")}` : "";
</script>

<svelte:head>
    <title>{pageTitle}</title>
    <meta name="description" content={pageDescription} />
    <meta property="og:title" content={pageTitle} />
    <meta property="og:description" content={pageDescription} />
    <meta property="og:image" content={imageUrl} />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content={pageTitle} />
    <meta name="twitter:description" content={pageDescription} />
    <meta name="twitter:image" content={imageUrl} />
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