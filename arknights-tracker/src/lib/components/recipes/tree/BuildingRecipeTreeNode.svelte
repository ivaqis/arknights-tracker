<script lang="ts">
    import type { IItemRecipeTreeNode } from "$lib/classes/formulaTree/nodes/IItemRecipeTreeNode";
    import { RecipeType } from "$lib/classes/gameData/recipes/RecipeType";
    import { RecipeSource } from "$lib/classes/gameData/recipes/sources/RecipeSource";
    import type { IImageIcon } from "$lib/classes/icons/IImageIcon";
    import type { ISvgIcon } from "$lib/classes/icons/ISvgIcon";
    import Icon from "$lib/components/Icon.svelte";
    import Image from "$lib/components/Image.svelte";
    import { t } from "$lib/i18n";

    export let node: IItemRecipeTreeNode;

    export let highlight: boolean = false;

    let title: string;
    let processTimeMs: number | null = null;
    let imageIcon: IImageIcon | null = null;
    let svgIcon: ISvgIcon | null = null;

    $: title = $t(getTitleKey(node));
    $: processTimeMs = getProcessTimeMs(node);
    $: imageIcon = getImageIcon(node);
    $: svgIcon = getSvgIcon(node);

    function getTitleKey(node: IItemRecipeTreeNode): string {
        const formula = node.recipe;

        if (formula.type === RecipeType.MANUAL) {
            return RecipeSource.MANUAL.i18nKey;
        }

        if (formula.type === RecipeType.HUB) {
            return RecipeSource.HUB.i18nKey;
        }

        return formula.recipe.building.i18nKey;
    }

    function getProcessTimeMs(node: IItemRecipeTreeNode): number | null {
        const formula = node.recipe;

        if (formula.type === RecipeType.MANUAL || formula.type === RecipeType.HUB) {
            return null;
        }

        return formula.recipe.processTimeMs;
    }

    function getImageIcon(node: IItemRecipeTreeNode): IImageIcon | null {
        const formula = node.recipe;

        if (formula.type === RecipeType.MANUAL || formula.type === RecipeType.HUB) {
            return null;
        }

        return formula.recipe.building.icon;
    }

    function getSvgIcon(node: IItemRecipeTreeNode): ISvgIcon | null {
        const formula = node.recipe;

        if (formula.type === RecipeType.MANUAL) {
            return RecipeSource.MANUAL.icon;
        }

        if (formula.type === RecipeType.HUB) {
            return RecipeSource.HUB.icon;
        }

        return null;
    }

    $: highlightRing = highlight ? "ring-4 ring-[#F9B90C]" : "";

</script>

<div
    class="relative flex flex-row items-center w-[350px] min-h-14 bg-[#1f1f1f] rounded-md p-3 gap-3 group {highlightRing} border border-[#444]"
>

    <div
        class="absolute inset-0 border-[2px] border-white rounded-[5px] z-30 pointer-events-none transition-opacity duration-200 opacity-0 group-hover:opacity-100"
    ></div>

    {#if imageIcon}

        <div class="flex-shrink-0 flex justify-center items-center h-8 w-8">

            <Image
                id={imageIcon.iconId}
                variant={imageIcon.imageVariant}
                className="w-full h-full object-contain blur-[0.3px] rotate-[0.01deg] backface-hidden transform-gpu transition-all duration-300"
            />

        </div>

    {:else if svgIcon}

        <div class="flex-shrink-0 flex justify-center items-center h-8 w-8">

            <Icon
                name={svgIcon.iconId}
                class="text-[#FDFDFD] dark:text-[#FDFDFD] h-full w-full"
            />

        </div>

    {/if}

    <div class="flex-1 flex items-center w-full">

        <span class="font-sdk text-lg text-left text-[#FDFDFD] dark:text-[#FDFDFD]">
            {title}
        </span>

    </div>

    {#if processTimeMs !== null}

        <div class="flex-shrink-0 flex items-center">

            <span class="font-nums text-sm text-gray-400">
                {processTimeMs / 1000}s
            </span>

        </div>

    {/if}

</div>