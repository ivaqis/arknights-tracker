<script lang="ts">
    import Icon from "$lib/components/Icon.svelte";

    export let processTimeMs: number | undefined = undefined;

    export let showHoverEffect: boolean = false;

    let displayedTime: string | null = null;

    $: displayedTime = getDisplayedTime(processTimeMs);

    function getDisplayedTime(processTimeMs: number | undefined): string | null {
        if (processTimeMs === undefined || processTimeMs <= 0) {
            return null;
        }

        return `${(processTimeMs / 1000).toFixed()}s`;
    }
</script>

<div
    class="flex flex-row gap-3 h-[68px] w-full pl-1 pt-1 pb-1 rounded-md"
    class:hover:bg-gray-200={showHoverEffect}
    class:dark:hover:bg-[#424242]={showHoverEffect}
>

    <slot name="left"/>

    <div class="flex flex-col gap-1 items-center justify-center w-6">

        {#if processTimeMs}

            <span class="font-sdk text-xs text-[#21272C] dark:text-[#FDFDFD]">
                {displayedTime}
            </span>

        {/if}

        <Icon
            name="doubleArrows"
            class="text-[#21272C] dark:text-[#FDFDFD] w-full"
        />

    </div>

    <slot name="right"/>

</div>