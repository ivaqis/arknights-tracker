<script lang="ts">
    import Icon from "$lib/components/Icon.svelte";
    import { t } from "$lib/i18n";

    export let title: string | null;
    export let buttonTitle: string | null;
    export let buttonUrl: string | null;
</script>

<div class="flex h-full w-full bg-white dark:bg-[#383838] rounded-3xl border border-gray-200 dark:border-[#444] transition-colors">

    {#if title}

        <div class="flex flex-col justify-start w-full">

            <div class="flex-shrink-0 flex items-center pl-6 pr-6 pt-3 pb-3 min-h-16 overflow-hidden border-b border-gray-200 dark:border-[#444]">

                <h2 class="font-sdk text-xl md:text-2xl font-bold text-[#21272C] dark:text-[#FDFDFD] leading-tight drop-shadow-sm">
                    {title}
                </h2>

            </div>

            <div class="flex-1 overflow-y-auto w-full pl-6 pr-6 pt-3 pb-6">

                <slot/>

            </div>

            {#if buttonTitle && buttonUrl}

                <div class="flex-shrink-0 flex items-center justify-center h-20 pl-6 pr-6 pt-4 pb-4 border-t border-gray-200 dark:border-[#444]">

                    <a
                        href={buttonUrl}
                        class="relative h-full w-full rounded-2xl bg-[#F9B90C] hover:bg-[#FFC01E]"
                    >

                        <span class="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 font-sdk text-xl text-[#21272C] dark:text-[#21272C] whitespace-nowrap">
                            {buttonTitle}
                        </span>

                    </a>

                </div>

            {/if}

        </div>

    {:else}

        <div class="flex-1 flex flex-col justify-center items-center p-6 text-center">

            <Icon
                name="noData"
                class="w-16 h-16 mb-4 text-[#A0A0A0]"
            />

            <h3 class="font-bold text-[#A0A0A0] mb-1.5">
                {$t("formulaSidebar.emptyState.title")}
            </h3>

            <p class="text-xs text-gray-500 dark:text-gray-400 max-w-[240px] leading-relaxed">
                {$t("formulaSidebar.emptyState.subtitle")}
            </p>

        </div>

    {/if}

</div>