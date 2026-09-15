<script>
    import { t } from "$lib/i18n.js";
    import { currencies } from "$lib/data/items/currencies.js";
    import { progression } from "$lib/data/items/progression.js";
    import { items } from "$lib/data/items/items";

    import Tooltip from "$lib/components/Tooltip.svelte";
    import Image from "$lib/components/Image.svelte";

    export let rewards = [];
    export let className = "";

    const allItemsList = [...currencies, ...progression];

    function getItemRarity(id) {
        const fromList = allItemsList.find((i) => i.id === id);
        if (fromList?.rarity) return fromList.rarity;
        if (items && items[id]?.rarity) return items[id].rarity;
        return 3;
    }

    function getRarityStyle(id) {
        const rarity = getItemRarity(id);
        switch (rarity) {
            case 5:
            case 6:
                return "bg-amber-50 border-amber-300 text-amber-800 hover:border-amber-500 dark:bg-amber-900/40 dark:border-amber-700 dark:text-amber-200 dark:hover:border-amber-400";
            case 4:
                return "bg-purple-50 border-purple-300 text-purple-800 hover:border-purple-500 dark:bg-purple-900/40 dark:border-purple-700 dark:text-purple-200 dark:hover:border-purple-400";
            case 3:
                return "bg-blue-50 border-blue-300 text-blue-800 hover:border-blue-500 dark:bg-blue-900/40 dark:border-blue-700 dark:text-blue-200 dark:hover:border-blue-400";
            default:
                return "bg-gray-100 border-gray-300 text-gray-700 hover:border-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-400";
        }
    }

    $: sortedRewards = Array.isArray(rewards)
        ? [...rewards].sort((a, b) => {
              const rarityA = getItemRarity(a.id);
              const rarityB = getItemRarity(b.id);
              if (rarityB !== rarityA) return rarityB - rarityA;
              return (b.count || 0) - (a.count || 0);
          })
        : [];
</script>

{#if sortedRewards.length > 0}
    <div class="flex flex-wrap gap-1.5 items-center {className}">
        {#each sortedRewards as reward}
            <Tooltip text={$t(`items.${reward.id}`)}>
                <div
                    class="flex items-center rounded-full px-2 py-0.5 border text-[11px] transition-colors {getRarityStyle(
                        reward.id,
                    )}"
                >
                    <span class="font-bold mr-1">{reward.count}</span>
                    <Image
                        id={reward.id}
                        variant="item"
                        size={16}
                        className="object-contain"
                    />
                </div>
            </Tooltip>
        {/each}
    </div>
{/if}
