<script>
    import { createEventDispatcher } from "svelte";
    import { scale } from "svelte/transition";
    import { t } from "$lib/i18n";
    import { characters } from "$lib/data/characters.js";
    import { getPickRateColor } from "$lib/utils/colorUtils";
    import { isDarkMode } from "$lib/stores/theme";

    import Image from "$lib/components/Image.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import Button from "$lib/components/Button.svelte";
    import Modal from "$lib/components/modals/Modal.svelte";

    export let isOpen = false;
    export let title = "";
    export let included = [];
    export let excluded = [];
    export let usageRates = {};

    const dispatch = createEventDispatcher();

    let tempIncluded = [];
    let tempExcluded = [];
    let searchQuery = "";

    $: if (isOpen) {
        tempIncluded = [...included];
        tempExcluded = [...excluded];
        searchQuery = "";
    }

    const baseOperators = Object.values(characters)
        .filter(c => c && c.id && c.id !== "endministrator2");

    function getOperatorName(op) {
        if (!op) return "";
        const key = `characters.${op.id}`;
        const trans = $t(key);
        return trans !== key ? trans : op.name;
    }

    $: sortedOperators = [...baseOperators].sort((a, b) => {
        const rateA = usageRates[a.id]?.percent ?? -1;
        const rateB = usageRates[b.id]?.percent ?? -1;
        if (rateA !== rateB) return rateB - rateA;
        return (b.rarity || 4) - (a.rarity || 4);
    });

    $: filteredList = sortedOperators.filter(op => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.trim().toLowerCase();
        const name = (getOperatorName(op) || op.name || "").toLowerCase();
        return name.includes(q);
    });

    function toggle(id) {
        if (tempIncluded.includes(id)) {
            tempIncluded = tempIncluded.filter(x => x !== id);
            tempExcluded = [...tempExcluded, id];
        } else if (tempExcluded.includes(id)) {
            tempExcluded = tempExcluded.filter(x => x !== id);
        } else {
            tempIncluded = [...tempIncluded, id];
        }
    }

    function handleClear() {
        tempIncluded = [];
        tempExcluded = [];
    }

    function handleSave() {
        dispatch("save", { included: tempIncluded, excluded: tempExcluded });
        dispatch("close");
    }

    function handleClose() {
        dispatch("close");
    }
</script>

<Modal {isOpen} on:close={handleClose}>
    <div
        class="relative bg-white dark:bg-[#383838] border border-gray-200 dark:border-[#444444] rounded-2xl p-6 sm:p-7 w-full max-w-2xl shadow-2xl cursor-auto max-h-[85vh] flex flex-col"
        transition:scale={{ duration: 200, start: 0.95 }}
    >
        <button
            type="button"
            on:click={handleClose}
            class="absolute top-4 right-4 text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors cursor-pointer"
        >
            <Icon name="close" class="w-6 h-6" />
        </button>

        <h3 class="text-lg sm:text-xl font-bold font-sdk dark:text-[#FDFDFD] text-[#21272C] mb-4 select-text">
            {title}
        </h3>

        <div class="mb-3">
            <input
                type="text"
                bind:value={searchQuery}
                placeholder={$t("sort.search")}
                class="w-full px-4 py-2 text-sm rounded-xl bg-gray-50 dark:bg-[#2C2C2C] border border-gray-300 dark:border-[#555] text-gray-900 dark:text-[#FDFDFD] focus:outline-none focus:ring-2 focus:ring-[#FFE145] transition-all font-sans"
            />
        </div>

        <div class="flex items-center justify-between gap-2 mb-3 text-xs text-gray-500 dark:text-gray-400">
            <div class="flex items-center gap-3">
                <span class="inline-flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                    <span>{$t("leaderboard.filter_include")}</span>
                </span>
                <span class="inline-flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
                    <span>{$t("leaderboard.filter_exclude")}</span>
                </span>
            </div>
            {#if tempIncluded.length > 0 || tempExcluded.length > 0}
                <button
                    type="button"
                    on:click={handleClear}
                    class="font-bold text-[#e8cc3c] dark:text-[#FFE145] hover:underline cursor-pointer"
                >
                    {$t("essencesPage.reset")}
                </button>
            {/if}
        </div>

        <div class="flex-1 overflow-y-auto min-h-0 p-1 pr-1 flex flex-wrap gap-1.5 content-start">
            {#each filteredList as op (op.id)}
                {@const isIncluded = tempIncluded.includes(op.id)}
                {@const isExcluded = tempExcluded.includes(op.id)}
                {@const usageRate = usageRates[op.id]}
                <button
                    type="button"
                    on:click={() => toggle(op.id)}
                    class="flex items-center rounded-full h-8 pl-0.5 pr-3 gap-2 border transition-all cursor-pointer select-none {isIncluded
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500'
                        : isExcluded
                            ? 'bg-red-500/15 border-red-500 text-red-700 dark:text-red-300 ring-1 ring-red-500'
                            : 'bg-gray-100 dark:bg-[#2C2C2C] border-gray-300 dark:border-[#555] text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-white/30'}"
                >
                    <div class="w-7 h-7 rounded-full overflow-hidden bg-gradient-to-t from-[#591C00] to-[#CA774C] shrink-0">
                        <Image id={op.id} variant="operator-preview" className="scale-[1.35] w-full h-full object-cover" />
                    </div>
                    <span class="text-xs font-bold leading-none whitespace-nowrap">{getOperatorName(op)}</span>
                    {#if usageRate}
                        <span
                            class="text-[11px] font-bold font-nums leading-none whitespace-nowrap"
                            style="color: {getPickRateColor(usageRate.percent, $isDarkMode)};"
                        >
                            {usageRate.percentLabel}
                        </span>
                    {/if}
                </button>
            {/each}
        </div>

        <div class="flex items-center justify-end gap-3 mt-5 pt-4 border-t border-gray-200 dark:border-white/10 shrink-0">
            <Button
                variant="round"
                color="gray"
                onClick={handleClose}
                className="!h-9 !px-4 text-xs sm:text-sm font-bold"
            >
                {$t("settings.account.cancel")}
            </Button>
            <Button
                variant="round"
                color="yellow"
                onClick={handleSave}
                className="!h-9 !px-5 text-xs sm:text-sm font-bold"
            >
                {$t("settings.account.save")}
            </Button>
        </div>
    </div>
</Modal>

