<script>
    import { t } from "$lib/i18n";
    import Icon from "$lib/components/Icon.svelte";
    import Image from "$lib/components/Image.svelte";
    import Tooltip from "$lib/components/Tooltip.svelte";
    import { characters } from "$lib/data/characters.js";

    export let index = 1;
    export let title = "";
    export let run = null;
    export let stars = null;
    export let hasBackground = false;

    function getSvelteCharId(char) {
        if (!char) return "";
        const raw = typeof char === "string" ? char : (char.id || char.charId || char.charData?.id || "");
        const found = characters[raw] || Object.values(characters).find(c => c.gameId === raw || c.apiId === raw || c.id === raw);
        return found ? found.id : raw;
    }

    function getOperatorData(char) {
        const svelteId = getSvelteCharId(char);
        const staticData = characters[svelteId] || Object.values(characters).find(c => c.gameId === svelteId || c.apiId === svelteId || c.id === svelteId);
        if (staticData) return staticData;
        return {
            id: svelteId || char.id,
            name: char.name || "Operator",
            rarity: Number(char.rarity || 4)
        };
    }

    function getOperatorName(opData) {
        if (!opData) return "";
        const key = `characters.${opData.id}`;
        const trans = $t(key);
        return trans !== key ? trans : opData.name;
    }

    function formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return $t("leaderboard.sec", { time: 0 });
        const m = Math.floor(seconds / 60);
        const s = Math.round(seconds % 60);
        if (m > 0 && s > 0) return $t("leaderboard.min_sec", { m, s });
        if (m > 0) return $t("leaderboard.min", { m });
        return $t("leaderboard.sec", { time: s });
    }

    function getRankTagStyle(rank) {
        if (rank === 1) return "bg-[#FFE145] text-gray-900";
        if (rank === 2) return "bg-[#C0C0C0] text-gray-900";
        if (rank === 3) return "bg-[#CD7F32] text-white";
        return "bg-white/10 text-gray-300 border border-white/15";
    }
</script>

<div class="flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-xl backdrop-blur-xl border transition-all {!hasBackground ? 'bg-gray-50/70 dark:bg-white/5 border-gray-200 dark:border-white/5' : 'bg-black/20 border-white/10'}">
    <div class="flex items-center gap-2 sm:gap-3 min-w-0">
        {#if index !== undefined && index !== null}
            <span class="w-6 sm:w-8 text-center text-xl sm:text-2xl font-bold font-nums text-gray-900 dark:text-white shrink-0">
                {index}
            </span>
            <div class="h-8 w-[1px] bg-gray-200/20 dark:bg-white/10 shrink-0"></div>
        {/if}

        <div class="flex flex-col min-w-0 justify-center gap-1">
            <span class="font-bold text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                {title}
            </span>
            <div class="flex items-center gap-2">
                {#if run}
                    <span class="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold font-nums inline-flex items-center justify-center shrink-0 {getRankTagStyle(run.rank)}">
                        #{run.rank}/{run.totalCount}
                    </span>
                    <span class="font-bold font-nums text-xs sm:text-sm text-[#FFE145] shrink-0">
                        {formatTime(run.clearTimeSec)}
                    </span>
                {:else}
                    <span class="text-xs text-gray-400 font-mono shrink-0">—</span>
                {/if}
            </div>
        </div>
    </div>

    <div class="flex items-center gap-3 sm:gap-4 shrink-0">
        {#if stars && Array.isArray(stars)}
            <div class="flex items-center gap-1 shrink-0">
                {#each stars as star}
                    {#if star === 'yellow'}
                        <Icon name="echoStarCompl" class="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                    {:else if star === 'white'}
                        <Icon name="echoStarWhite" class="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-gray-900 dark:text-white" />
                    {:else}
                        <Icon name="echoStar" class="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-gray-300 dark:text-white/40" />
                    {/if}
                {/each}
            </div>
        {/if}

        <div class="flex items-center gap-1 shrink-0">
            {#if run && run.chars && run.chars.length > 0}
                {#each (run.chars || []).slice(0, 4) as char}
                    {@const opData = getOperatorData(char)}
                    {@const charPot = char.potential ?? char.potentialLevel ?? 0}
                    <Tooltip text={`${getOperatorName(opData)} (LV. ${char.level || 1} • P${charPot})`}>
                        <div class="relative shrink-0">
                            <div class="w-8 h-10 sm:w-9 sm:h-11 -skew-x-12 overflow-hidden rounded-[3px] border border-gray-200 dark:border-white/15 bg-gray-100 dark:bg-white/5 relative shrink-0">
                                <div class="w-full h-full skew-x-12 scale-125">
                                    <Image
                                        id={opData.id}
                                        variant="operator-preview"
                                        className="w-full h-full object-cover object-top"
                                        alt={opData.name}
                                    />
                                </div>
                                <div class="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none"></div>
                                <div class="absolute bottom-0 left-1 skew-x-12 pointer-events-none select-none">
                                    <span class="text-[10px] font-black font-nums text-white leading-none tracking-tight" style="text-shadow: 0 1px 2px rgba(0,0,0,0.9);">{char.level || 1}</span>
                                </div>
                            </div>
                        </div>
                    </Tooltip>
                {/each}
                {#if run.chars.length < 4}
                    {#each Array(4 - run.chars.length) as _}
                        <div class="w-8 h-10 sm:w-9 sm:h-11 -skew-x-12 rounded-[3px] border border-gray-200 dark:border-white/10 bg-gray-100/50 dark:bg-white/5 shrink-0"></div>
                    {/each}
                {/if}
            {:else}
                {#each [0, 1, 2, 3] as _}
                    <div class="w-8 h-10 sm:w-9 sm:h-11 -skew-x-12 rounded-[3px] border border-gray-200 dark:border-white/10 bg-gray-100/50 dark:bg-white/5 shrink-0"></div>
                {/each}
            {/if}
        </div>
    </div>
</div>
