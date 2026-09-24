<script lang="ts">
    import type { IGasEnv } from "$lib/classes/gameData/gasEnv/IGasEnv";
    import { CardSize } from "$lib/components/cards/CardSize";
    import CardTemplate from "$lib/components/cards/CardTemplate.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import { t } from "$lib/i18n";

    export let gasEnv: IGasEnv;
    export let url: string | null = null;
    export let tooltipText: string | null = null;

    export let showTooltip: boolean = false;
    export let size: CardSize = CardSize.DEFAULT;

    let color: string;

    $: color = `text-[${gasEnv.icon.color}]`;
</script>

<CardTemplate
    size={size}
    tooltipText={showTooltip ? tooltipText ?? $t(gasEnv.i18nKey) : undefined}
    url={url}
>

    <div
        class="absolute inset-0 w-full h-full"
        style:background-color={gasEnv.icon.bgColor}
    ></div>

    {#key gasEnv}

        {@const icon = gasEnv.icon}

        <div
            class="absolute inset-0 flex items-center justify-center z-0"
            style:color={gasEnv.icon.color}
        >

            {#if icon.iconId}

                <Icon
                    name={icon.iconId}
                    class="w-[80%] h-[80%]"
                />

            {/if}

        </div>

    {/key}

</CardTemplate>