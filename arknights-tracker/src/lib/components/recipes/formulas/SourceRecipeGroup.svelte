<script lang="ts">
    import type { IRecipeSource } from "$lib/classes/gameData/recipes/sources/IRecipeSource";
    import RecipeGroup from "$lib/components/recipes/formulas/RecipeGroup.svelte";
    import { t } from "$lib/i18n";

    export let recipeSource: IRecipeSource;
</script>

<RecipeGroup
    title={$t(recipeSource.i18nKey)}
    svgIcon={recipeSource.icon}
>

    <slot/>

</RecipeGroup>