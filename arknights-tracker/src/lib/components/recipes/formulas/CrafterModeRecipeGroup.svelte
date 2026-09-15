<script lang="ts">
    import type { ICrafterMode } from "$lib/classes/gameData/buildings/crafters/ICrafterMode";
    import RecipeGroup from "$lib/components/recipes/formulas/RecipeGroup.svelte";
    import { t } from "$lib/i18n";

    export let crafterMode: ICrafterMode;
</script>

<RecipeGroup
    title={$t(crafterMode.i18nKey)}
    svgIcon={crafterMode.icon}
>

    <slot/>

</RecipeGroup>