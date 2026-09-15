<script lang="ts">
    import type { IImageIcon } from "$lib/classes/icons/IImageIcon";
    import type { ISvgIcon } from "$lib/classes/icons/ISvgIcon";
    import Icon from "$lib/components/Icon.svelte";
    import Image from "$lib/components/Image.svelte";

    export let title: string;
    export let svgIcon: ISvgIcon | null = null;
    export let imageIcon: IImageIcon | null = null;
</script>

<div>

    <div class="flex flex-row min-h-10 pl-2 gap-2 mb-3 w-full items-center rounded-[6px] bg-[#1f1f1f] dark:bg-[#1f1f1f]">

        {#if svgIcon || imageIcon}

            <div class="flex justify-center items-center h-8 w-8">

                {#if svgIcon}

                    <Icon
                        name={svgIcon.iconId}
                        class="text-[#FDFDFD] dark:text-[#FDFDFD] h-full w-full"
                    />

                {:else if imageIcon}

                    <Image
                        id={imageIcon.iconId}
                        variant={imageIcon.imageVariant}
                        interactive={true}
                        className="w-full h-full object-contain blur-[0.3px] rotate-[0.01deg] backface-hidden transform-gpu transition-all duration-300"
                    />

                {/if}

            </div>

        {/if}

        <div class="flex items-center w-full">

            <span class="font-sdk text-lg text-[#FDFDFD] dark:text-[#FDFDFD]">
                {title}
            </span>

        </div>

    </div>

    <div class="flex flex-col gap-3">

        <slot/>

    </div>

</div>