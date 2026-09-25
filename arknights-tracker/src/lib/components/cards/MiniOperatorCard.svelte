<script>
    import { t } from "$lib/i18n.js";
    import { characters } from "$lib/data/characters.js";
    import Image from "$lib/components/Image.svelte";
    import PotentialIcon from "$lib/components/operators/PotentialIcon.svelte";
    import Tooltip from "$lib/components/Tooltip.svelte";
    import Icon from "$lib/components/Icon.svelte";

    export let char = null;
    export let getOperatorData = null;
    export let href = null;

    function getSvelteCharId(item) {
        if (!item) return "";
        const raw = typeof item === "string" ? item : (item.id || item.charId || item.charData?.id || "");
        const found = characters[raw] || Object.values(characters).find(c => c.gameId === raw || c.apiId === raw || c.id === raw);
        return found ? found.id : raw;
    }

    function resolveOperator(item) {
        if (!item) return null;
        if (getOperatorData) return getOperatorData(item);
        const svelteId = getSvelteCharId(item);
        const staticData = characters[svelteId] || Object.values(characters).find(c => c.gameId === svelteId || c.apiId === svelteId || c.id === svelteId);
        if (staticData) {
            return staticData;
        }
        return {
            id: item.charData?.avatarSqUrl || svelteId || item.id || "endministrator1",
            name: item.charData?.name || item.name || "Operator",
            rarity: Number(item.charData?.rarity?.value || item.rarity || 4)
        };
    }

    $: isEmpty = !char || Object.keys(char).length === 0;
    $: opData = !isEmpty ? resolveOperator(char) : null;
    $: rawPot = char?.potential ?? (char?.potentialLevel !== undefined ? char.potentialLevel + 1 : 1);
    $: potIndex = Math.max(0, Math.min(5, (rawPot || 1) - 1));
    $: cardHref = href || (opData ? `/operators/${opData.id}` : '#');
</script>

{#if isEmpty}
    <div class="flex flex-col gap-2 border border-dashed border-gray-200/35 bg-gray-200/35 dark:bg-black/20 rounded-[4px] min-w-0 w-[84px] max-w-[84px] h-[190px] shrink-0 justify-center items-center text-white/20 select-none hover:border-white/30 hover:text-white/40 transition-all duration-300">
        <Icon name="noData" class="shrink-0 w-4 h-4" />
        <span class="text-[10px] font-sans text-gray-400">{$t("profile.empty_slot")}</span>
    </div>
{:else}
    <div class="flex flex-col border border-gray-200/50 dark:border-white/10 rounded-[4px] min-w-0 w-[84px] max-w-[84px] shrink-0 shadow-md relative overflow-hidden bg-gray-100 dark:bg-black/40">
        <a href={cardHref} class="relative w-full h-[190px] bg-white/5 overflow-hidden shrink-0 block group cursor-pointer">
            <div class="w-full h-full transition-transform duration-300 group-hover:scale-105">
                <Image id={opData.id} variant="operator-preview" className="w-full h-full object-cover" />
            </div>
            <div class="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#111111] to-transparent z-20 pointer-events-none"></div>
            
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div class="absolute top-1 right-1 z-30" on:click|stopPropagation|preventDefault>
                <Tooltip text="P{potIndex}">
                    <PotentialIcon pot={potIndex} size={32} />
                </Tooltip>
            </div>

            <div class="absolute bottom-2 left-2 z-30 flex flex-col items-start leading-none select-none">
                <span class="text-[8px] font-black text-white/70 uppercase tracking-wider" style="text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">LV</span>
                <span class="text-[24px] font-black text-white leading-none tracking-tighter font-nums" style="text-shadow: 1px 1px 3px rgba(0,0,0,0.9);">{char.level || 1}</span>
            </div>
        </a>
    </div>
{/if}
