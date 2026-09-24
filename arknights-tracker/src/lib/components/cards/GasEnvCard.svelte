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

    let bgColor: string;
    let color: string;

    $: bgColor = `bg-[${gasEnv.icon.bgColor}]`;
    $: color = `text-[${gasEnv.icon.color}]`;
</script>

<CardTemplate
    size={size}
    tooltipText={showTooltip ? tooltipText ?? $t(gasEnv.i18nKey) : undefined}
    url={url}
>

    <div
        class="absolute inset-0 w-full h-full {bgColor}"
    ></div>

    {#key gasEnv}

        {@const icon = gasEnv.icon}

        <div class="absolute inset-0 flex items-center justify-center z-0 bottom-[6px]">

            {#if icon.iconId}

                <Icon
                    name={icon.iconId}
                    class="{color}"
                />

            {/if}

        </div>

    {/key}

</CardTemplate>