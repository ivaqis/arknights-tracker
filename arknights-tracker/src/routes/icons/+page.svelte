<script>
    import { t } from "$lib/i18n";
    import Icon from "$lib/components/Icon.svelte";

    export let data;

    let searchQuery = "";
    let copiedIcon = null;

    $: icons = data.icons || [];
    $: svgMap = data.svgMap || {};
    $: filteredIcons = icons.filter((name) =>
        name.toLowerCase().includes(searchQuery.trim().toLowerCase()),
    );

    async function copySvg(iconName) {
        const svgString = svgMap[iconName];
        if (!svgString) return;

        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(svgString);
            } else {
                const textArea = document.createElement("textarea");
                textArea.value = svgString;
                textArea.style.position = "absolute";
                textArea.style.left = "-9999px";
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand("copy");
                document.body.removeChild(textArea);
            }
            copiedIcon = iconName;
            setTimeout(() => {
                if (copiedIcon === iconName) copiedIcon = null;
            }, 1500);
        } catch (e) {
            console.error(e);
        }
    }
</script>

<svelte:head>
    <title>{$t("pages.icons")} | Goyfield</title>
</svelte:head>

<div class="min-h-screen w-full py-8 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col gap-6 font-sans text-[#21272C] dark:text-[#FDFDFD]">
    <div class="flex items-center justify-between gap-4 border-b border-gray-200 dark:border-[#444] pb-5">
        <div>
            <h1 class="text-3xl sm:text-4xl font-bold font-sdk">
                {$t("pages.icons")}
            </h1>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {filteredIcons.length} / {icons.length}
            </p>
        </div>
    </div>

    <div class="flex items-center gap-2.5 w-full max-w-md bg-white dark:bg-[#202020] border border-gray-200 dark:border-[#383838] rounded-xl h-10 px-3.5 shadow-sm focus-within:border-[#F9B90C] transition-colors">
        <div class="flex items-center justify-center text-gray-400 shrink-0">
            <Icon name="search" class="w-4 h-4 block" />
        </div>
        <input
            type="text"
            bind:value={searchQuery}
            placeholder={$t("sort.search")}
            class="w-full bg-transparent border-none p-0 text-sm text-[#21272C] dark:text-white placeholder-gray-400 outline-none focus:outline-none focus:ring-0"
        />
        {#if searchQuery}
            <button
                type="button"
                aria-label="Clear search"
                class="flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 shrink-0 cursor-pointer p-0.5"
                on:click={() => (searchQuery = "")}
            >
                <Icon name="close" class="w-4 h-4 block" />
            </button>
        {/if}
    </div>

    {#if filteredIcons.length === 0}
        <div class="text-center py-20 bg-white dark:bg-[#202020] rounded-2xl border border-gray-200 dark:border-[#383838] shadow-sm flex flex-col items-center justify-center">
            <Icon name="noData" class="w-12 h-12 mb-3 opacity-30" />
            <p class="text-gray-500 dark:text-gray-400 text-sm">
                {$t("emptyState.noData")}
            </p>
        </div>
    {:else}
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2.5">
            {#each filteredIcons as iconName (iconName)}
                <button
                    type="button"
                    class="bg-white dark:bg-[#202020] border rounded-xl p-3 flex flex-col items-center justify-center gap-2 text-center min-h-[96px] cursor-pointer relative transition-colors {copiedIcon === iconName
                        ? 'border-[#F9B90C] ring-2 ring-[#F9B90C]/30 bg-amber-50/20 dark:bg-amber-950/20'
                        : 'border-gray-200 dark:border-[#383838]'}"
                    on:click={() => copySvg(iconName)}
                    title={iconName}
                >
                    {#if copiedIcon === iconName}
                        <div class="absolute top-1.5 right-1.5 flex items-center justify-center w-4 h-4 rounded-full bg-[#F9B90C] text-black">
                            <Icon name="check" class="w-3 h-3 stroke-[3]" />
                        </div>
                    {/if}

                    <div class="w-8 h-8 flex items-center justify-center text-[#21272C] dark:text-[#FDFDFD]">
                        <Icon name={iconName} class="w-full h-full object-contain" />
                    </div>

                    <span class="text-xs font-mono font-medium text-gray-700 dark:text-gray-300 truncate w-full text-center">
                        {iconName}
                    </span>
                </button>
            {/each}
        </div>
    {/if}
</div>
