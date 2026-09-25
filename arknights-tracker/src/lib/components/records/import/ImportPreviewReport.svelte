<script>
    import { createEventDispatcher } from "svelte";
    import { t } from "$lib/i18n";
    import Button from "$lib/components/Button.svelte";
    import Icon from "$lib/components/Icon.svelte";

    export let previewReport = null;
    export let isLoading = false;
    export let getBannerName = (bannerId) => bannerId;

    const dispatch = createEventDispatcher();
</script>

{#if previewReport}
    <div
        class="mt-5 p-5 rounded-lg bg-gray-50 dark:bg-[#343434] dark:border-[#444444] border border-gray-200 animate-in fade-in slide-in-from-bottom-2"
    >
        {#if previewReport.status === "up_to_date"}
            <div
                class="flex items-center gap-3 dark:text-green-500 text-green-600 font-bold text-lg"
            >
                <Icon
                    name="check"
                    class="w-6 h-6"
                />
                {$t("import.statusUpToDate")}
            </div>
        {:else}
            <h3
                class="font-bold text-lg dark:text-[#E0E0E0] text-[#21272C] mb-4 flex items-center gap-2"
            >
                {#if isLoading}
                    <span class="relative flex h-3 w-3 mr-1">
                        <span
                            class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D0926E] opacity-75"
                        ></span>
                        <span
                            class="relative inline-flex rounded-full h-3 w-3 bg-[#D0926E]"
                        ></span>
                    </span>
                    {$t("import.processing")}
                {:else}
                    <Icon
                        name="import"
                        class="w-5 h-5"
                    />
                    {$t("import.newFound")}
                {/if}

                <span class="text-[#D0926E] ml-1">+{previewReport.totalAdded}</span>
            </h3>

            <div class="space-y-2 mb-3 ml-1">
                {#each Object.entries(previewReport.addedCount || {}).filter(([_, count]) => count > 0) as [bannerId, count]}
                    <div
                        class="flex justify-between dark:bg-[#373737] dark:border-[#444444] items-center bg-white p-3 rounded border border-gray-100 shadow-sm max-w-md transition-all duration-300"
                    >
                        <span
                            class="text-gray-700 dark:text-[#E0E0E0] font-medium flex items-center gap-2"
                        >
                            {getBannerName(bannerId)}
                        </span>
                        <span
                            class="bg-[#FFE145] text-[#21272C] text-xs font-bold px-2 py-1 rounded-md transition-all"
                        >
                            +{count}
                        </span>
                    </div>
                {/each}

                {#if isLoading && Object.keys(previewReport.addedCount || {}).length === 0}
                    <div class="text-sm text-gray-500 italic ml-2">
                        {$t("import.waiting_response")}
                    </div>
                {/if}
            </div>

            {#if !isLoading}
                <div class="w-48 animate-in fade-in zoom-in duration-300">
                    <Button
                        variant="black2"
                        onClick={() => dispatch("save")}
                    >
                        <div slot="icon">
                            <Icon
                                name="save"
                                class="w-4 h-4 text-white"
                            />
                        </div>
                        {$t("buttons.saveBtn")}
                    </Button>
                </div>
            {/if}
        {/if}
    </div>
{/if}
