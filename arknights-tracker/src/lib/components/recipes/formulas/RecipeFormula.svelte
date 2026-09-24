<script lang="ts">
    import type { IGasEnv } from "$lib/classes/gameData/gasEnv/IGasEnv";
    import Icon from "$lib/components/Icon.svelte";
    import { t } from "$lib/i18n";

    export let processTimeMs: number | undefined = undefined;
    export let gasEnv: IGasEnv | null = null;

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

<div class="flex flex-col gap-1">

    {#if gasEnv}

        {@const icon = gasEnv.icon}

        <div
            class="flex flex-row items-center justify-center gap-2 w-full h-8 rounded-md"
            style:background-color={icon.bgColor}
        >

            {#if icon.iconId}

                <Icon
                    name={icon.iconId}
                    class="{`text-[${icon.color}]`}"
                />

            {/if}

            <span
                class="font-sdk text-lg"
                style:color={icon.color}
            >
                {$t(gasEnv.i18nKey)}
            </span>

        </div>

    {/if}

    <div
        class="flex flex-row gap-3 h-[68px] w-full pl-1 pt-1 pb-1 rounded-md"
        class:dark:hover:bg-[#424242]={showHoverEffect}
        class:hover:bg-gray-200={showHoverEffect}
    >

        <slot name="left"/>

        <div class="flex flex-col gap-1 items-center justify-center w-6">

            {#if processTimeMs}

            <span class="font-sdk text-xs text-[#21272C] dark:text-[#FDFDFD]">
                {displayedTime}
            </span>

            {/if}

            <Icon
                class="text-[#21272C] dark:text-[#FDFDFD] w-full"
                name="doubleArrows"
            />

        </div>

        <slot name="right"/>

    </div>

</div>