<script lang="ts">
    import type { IBuilding } from "$lib/classes/gameData/buildings/IBuilding";
    import RecipeGroup from "$lib/components/recipes/formulas/RecipeGroup.svelte";
    import { t } from "$lib/i18n";

    export let building: IBuilding;
</script>

<RecipeGroup
    title={$t(building.i18nKey)}
    imageIcon={building.icon}
>

    <slot/>

</RecipeGroup>