<script>
    import { createEventDispatcher } from "svelte";
    import { t } from "$lib/i18n";
    import Icon from "$lib/components/Icon.svelte";

    export let savedTokens = [];

    const dispatch = createEventDispatcher();
</script>

<div class="max-w-4xl mb-2 min-h-[100px]">
    {#if savedTokens.length === 0}
        <div
            class="flex flex-col items-center justify-center py-6 border-2 dark:border-[#444444] dark:text-[#B7B6B3] border-dashed border-gray-200 rounded-lg text-gray-400"
        >
            <Icon
                name="noData"
                class="w-8 h-8 opacity-50"
            />
            <span class="mt-2 text-sm font-medium"
                >{$t("import.no_saved_tokens")}</span
            >
        </div>
    {:else}
        <div class="grid gap-3 pb-3">
            {#each savedTokens as token, i}
                <div
                    class="group relative flex items-center justify-between p-4 bg-white border border-gray-200 dark:bg-[#343434] dark:border-[#444444] hover:border-[#FFE145] hover:shadow-sm transition-all text-left rounded-md overflow-hidden"
                >
                    <button
                        type="button"
                        class="absolute inset-0 w-full h-full z-0 cursor-pointer focus:outline-none"
                        on:click={() => dispatch("select", token)}
                        aria-label="Select {token.name}"
                    ></button>
                    <div class="pl-2 relative z-10 pointer-events-none">
                        <div
                            class="font-bold text-[#21272C] dark:text-[#E0E0E0] text-lg font-sdk flex items-center gap-2"
                        >
                            <span>{token.name}</span>
                            {#if token.server === "2" || (token.url && token.url.includes("server=2"))}
                                <span
                                    class="text-xs px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-sans font-semibold"
                                >
                                    Asia
                                </span>
                            {:else}
                                <span
                                    class="text-xs px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-sans font-semibold"
                                >
                                    Americas / Europe
                                </span>
                            {/if}
                        </div>
                        <div
                            class="text-xs text-gray-400 dark:text-[#B7B6B3] font-mono mt-1 truncate max-w-[250px] md:max-w-[400px]"
                        >
                            {token.url}
                        </div>
                        <div
                            class="text-[10px] text-gray-400 dark:text-[#B7B6B3] mt-2 font-medium"
                        >
                            {new Date(token.date).toLocaleDateString()}
                        </div>
                    </div>
                    <div class="flex items-center gap-4 z-20 relative pointer-events-none">
                        <button
                            type="button"
                            class="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-white hover:bg-red-500 rounded transition-colors pointer-events-auto cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500"
                            on:click|stopPropagation={() => dispatch("delete", i)}
                        >
                            <Icon
                                name="close"
                                class="w-[18px] h-[18px]"
                            />
                        </button>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>
