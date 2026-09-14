<script lang="ts">
    import type { IResourcePoint } from "$lib/classes/gameData/resourcePoints/IResourcePoint";
    import { CardSize } from "$lib/components/cards/CardSize";
    import CardTemplate from "$lib/components/cards/CardTemplate.svelte";
    import Image from "$lib/components/Image.svelte";
    import { t } from "$lib/i18n";

    export let resourcePoint: IResourcePoint;
    export let url: string | null = null;
    export let tooltipText: string | null = null;

    export let showTooltip: boolean = false;
    export let size: CardSize = CardSize.DEFAULT;
    export let interactiveImages: boolean = false;

</script>

<CardTemplate
    size={size}
    tooltipText={showTooltip ? tooltipText ?? $t(resourcePoint.i18nKey) : undefined}
    url={url}
>

    <div
        class="w-full h-full bg-[#777676]"
    ></div>

    {#key resourcePoint}

        {@const bgIcon = resourcePoint.bgIcon}
        {@const icon = resourcePoint.item.icon}

        <div class="absolute inset-0 flex items-center justify-center z-0">
            <Image
                id={bgIcon.iconId}
                variant={bgIcon.imageVariant}
                className="w-full h-full object-contain blur-[0.3px] rotate-[0.01deg] backface-hidden transform-gpu transition-all duration-300"
                interactive={interactiveImages}
            />
        </div>

        <div class="absolute inset-0 flex items-center justify-center z-0 left-[25%]">
            <div class="w-2/3 h-2/3">
                <Image
                    id={icon.iconId}
                    variant={icon.imageVariant}
                    className="w-full h-full object-contain blur-[0.3px] rotate-[0.01deg] backface-hidden transform-gpu transition-all duration-300"
                    interactive={interactiveImages}
                />
            </div>
        </div>

    {/key}

</CardTemplate>