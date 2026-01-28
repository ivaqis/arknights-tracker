<script>
  import { t } from "$lib/i18n";
  import { characters } from "$lib/data/characters";
  import { weapons } from "$lib/data/weapons";
  import Icon from "$lib/components/Icons.svelte";
  import Tooltip from "$lib/components/Tooltip.svelte";
  import Images from "$lib/components/Images.svelte";

  export let pulls = []; 
  export let banner = null;

  $: isSpecial = banner?.type === "special";
  $: isNewPlayer = banner?.type === "new-player" || banner?.type === "new_player";
  
  // Определяем, оружейный ли это баннер
  $: isWeaponBanner = banner?.type === 'weapon' || banner?.id?.includes('weap') || banner?.id?.includes('wepon');
  
  // Есть ли Rate-Up (для отображения 50/50). 
  // Это Special (персы) ИЛИ Оружие (но не Constant/Standard)
  $: hasRateUp = isSpecial || (isWeaponBanner && !banner?.id?.includes('constant'));

  $: featured6List = banner?.featured6 || [];
  $: featured5List = banner?.featured5 || [];

  $: total = pulls.length;
  $: spent = (total * 500).toLocaleString("ru-RU");

  $: count6 = pulls.filter((p) => p.rarity === 6).length;
  $: count5 = pulls.filter((p) => p.rarity === 5).length;
  const normalize = (str) => str?.toLowerCase().replace(/\s+/g, "") || "";
  const itemMap = { ...characters, ...weapons };
  const lookupMap = Object.values(itemMap).reduce((acc, item) => {
    if (item.name) acc[normalize(item.name)] = item;
    acc[normalize(item.id)] = item;
    return acc;
  }, {});

  // --- AVG CALCULATION ---
  function calculateAvg(targetRarity) {
      const targetPulls = pulls.filter(p => p.rarity === targetRarity);
      if (targetPulls.length === 0) return "0.0";
      
      let sum = 0;
      let count = 0;

      targetPulls.forEach(p => {
          let val = p.realPity; 
          if (typeof val === 'number') {
              sum += val;
              count++;
          }
      });
      
      const result = count > 0 ? (sum / count).toFixed(1) : "0.0";
      return result;
  }

  $: avg6 = calculateAvg(6);
  $: avg5 = calculateAvg(5); 

  // --- WINRATE ---
  function calculateWinRate(rarity, featuredList) {
    if (!featuredList || featuredList.length === 0) return { won: 0, total: 0, percent: 0 };
    const sorted = [...pulls].sort((a, b) => new Date(a.time) - new Date(b.time));
    let won = 0;
    let totalRate = 0;
    let lastWasFeatured = true;

    for (const pull of sorted) {
      if (pull.rarity === rarity) {
        const normName = normalize(pull.name);
        // [FIX] Ищем в lookupMap, чтобы работало и для оружия
        const isFeatured = featuredList.some((fid) => {
           const fItem = itemMap[fid];
           return fItem && normalize(fItem.name) === normName;
        });
        if (lastWasFeatured) {
          totalRate++;
          if (isFeatured) won++;
        }
        lastWasFeatured = isFeatured;
      }
    }
    return {
      won,
      total: totalRate,
      percent: totalRate > 0 ? ((won / totalRate) * 100).toFixed(0) : 0,
    };
  }

  $: winRate6 = calculateWinRate(6, featured6List);
  $: winRate5 = calculateWinRate(5, featured5List);

  $: statsRows = [
    { label: "6", count: count6, percent: total > 0 ? ((count6/total)*100).toFixed(2) : "0.00", avg: avg6, winRate: winRate6 },
    { label: "5", count: count5, percent: total > 0 ? ((count5/total)*100).toFixed(2) : "0.00", avg: avg5, winRate: winRate5 },
  ];

  // --- ICONS ---
  $: icons = pulls
    .filter((p) => p.rarity === 6)
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 6)
    .map((p) => {
      const lookupKey = normalize(p.name);
      const itemData = lookupMap[lookupKey];
      const itemId = itemData?.id || normalize(p.name);
      // Проверяем, оружие ли это (есть ли ID в базе weapons)
      const isWeapon = itemData ? !!weapons[itemData.id] : isWeaponBanner; 

      return {
        id: itemId,
        pity: (typeof p.realPity === 'number') ? p.realPity : (p.pity || "?"),
        name: p.name,
        isWeapon: isWeapon
      };
    });

  function getPityColor(pity) {
    if (typeof pity !== 'number') return "#21272C";
    if (pity >= 1 && pity <= 20) return "#5DBE5A";
    if (pity > 20 && pity <= 30) return "#3CAF38";
    if (pity > 30 && pity <= 50) return "#D4AD3D";
    if (pity > 50 && pity <= 70) return "#C55E2F";
    if (pity > 70 && pity <= 80) return "#9A3404";
    return "#21272C";
  }

  function getWeaponBg(rarity) {
        // Здесь rarity всегда 6, т.к. список icons фильтрует только 6*
        // Но оставим полную функцию на будущее
        if (rarity === 6) return "bg-gradient-to-t from-[#591C00] to-[#BD896E]"; 
        if (rarity === 5) return "bg-gradient-to-t from-[#261E00] to-[#E3BC55]";
        return "bg-gradient-to-t from-[#1a1a1a] to-[#666666]";
  }
</script>

<div class="space-y-4">
    <div class="flex items-center gap-2">
        <span class="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
            {$t("page.banner.stats") || "Statistics"}
        </span>
        <div class="h-px flex-1 bg-gray-100"></div>
    </div>

    <div class="bg-gray-50 rounded-lg p-3 flex items-center justify-between w-full">
    
    <div class="flex-1 flex flex-col items-center justify-center">
        <span class="text-gray-500 text-xs block mb-0.5">{$t("page.banner.total")}</span>
        <span class="font-bold text-gray-800 font-nums text-lg leading-none">{total}</span>
    </div>

    {#if !isNewPlayer && !isWeaponBanner}
        <div class="w-px h-8 bg-gray-300 mx-2"></div>

        <div class="flex-1 flex flex-col items-center justify-center">
            <span class="text-gray-500 text-xs block mb-0.5">{$t("page.banner.spent")}</span>
            <div class="flex items-center gap-1.5">
                <Images id="oroberyl" variant="currency" size={18} />
                <span class="font-bold text-gray-800 font-nums text-lg leading-none">{spent}</span>
            </div>
        </div>
    {/if}
</div>

    <div>
        <div class="grid grid-cols-4 text-xs text-gray-500 mb-1 font-medium">
            <div>{$t("page.banner.rarity")}</div>
            <div class="text-right">{$t("page.banner.count")}</div>
            <div class="text-right">{$t("page.banner.percent")}</div>
            <div class="text-right">{$t("page.banner.avg")}</div>
        </div>

        {#each statsRows as row}
            <div class="border-b border-gray-50 last:border-0">
                <div class="grid grid-cols-4 text-sm items-center py-1">
                    <div class="font-bold text-gray-700 flex items-center gap-1 font-nums">
                        {row.label}
                        <Icon name="star" class="w-4 h-4" />
                    </div>
                    <div class="text-right font-bold font-nums text-[#21272C]">
                        {row.count}
                    </div>
                    <div class="text-right text-gray-600 font-nums">
                        {row.percent}%
                    </div>
                    <div class="text-right font-bold font-nums text-[#1D6F42]">
                        {row.avg}
                    </div>
                </div>

                {#if hasRateUp && row.winRate.total > 0 && (row.label === "6" || !isWeaponBanner)}
                    <div class="grid grid-cols-4 text-sm items-center py-1">
                        <div class="text-gray-600 text-xs pl-6">
                            {$t("page.banner.won5050")}
                        </div>
                        <div class="text-right font-nums text-[#21272C]">
                            {row.winRate.won}/{row.winRate.total}
                        </div>
                        <div class="text-right text-gray-600 font-nums">
                            {row.winRate.percent}%
                        </div>
                        <div class="text-right"></div>
                    </div>
                {/if}
            </div>
        {/each}
    </div>

    {#if icons.length > 0}
        <div class="space-y-2">
            <h4 class="text-xs font-bold text-[#21272C] flex items-center gap-1">
                <span>{$t("page.banner.pulled")}</span>
                <span>6</span>
                <Icon name="star" class="w-3 h-3" />
                <span>{$t(isWeaponBanner ? "page.banner.recent_weapons" : "page.banner.operators")}</span>
            </h4>

            <div class="flex flex-wrap gap-2">
                {#each icons as icon}
                    <Tooltip text={$t(icon.isWeapon ? `weaponsList.${icon.id}` : `characters.${icon.id}`) || icon.name}>
                        <div class="relative w-12 h-12 rounded-full cursor-pointer shadow-sm hover:scale-110 transition-transform">
                            <div class="w-full h-full overflow-hidden rounded-full border-2 
                                {icon.isWeapon 
                                    ? `border-[#ff6600] ${getWeaponBg(6)}` 
                                    : 'border-[#D0926E] bg-gray-100'}"
                            >
                                <Images
                                    id={icon.id}
                                    variant={icon.isWeapon ? "weapon-icon" : "operator-icon"}
                                    size="100%"
                                    alt={icon.name}
                                    className={icon.isWeapon ? "scale-125" : ""}
                                />
                            </div>
                            
                            {#if icon.isWeapon}
                                <div class="absolute -bottom-1 -right-1 min-w-7 px-2 py-1 rounded font-nums leading-none font-bold shadow-lg pointer-events-none flex items-center justify-center bg-[#eec71b] text-[#21272C]" style="font-size: 0.85rem; min-width: 1.7rem;">
                                    {icon.pity}
                                </div>
                            {:else}
                                <div class="absolute -bottom-1 -right-1 min-w-7 px-2 py-1 rounded font-nums leading-none font-bold shadow-lg pointer-events-none flex items-center justify-center" style="font-size: 0.85rem; min-width: 1.7rem;">
                                    <div class="absolute inset-0 rounded opacity-75" style="background-color: {getPityColor(icon.pity)};"></div>
                                    <span class="relative text-white z-10">{icon.pity}</span>
                                </div>
                            {/if}
                        </div>
                    </Tooltip>
                {/each}
            </div>
        </div>
    {/if}
</div>