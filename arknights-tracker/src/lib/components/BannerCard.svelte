<script>
  import { t } from "$lib/i18n";
  import { browser } from "$app/environment";
  import { pullData } from "$lib/stores/pulls";
  import { goto } from "$app/navigation";
  import { characters } from "$lib/data/characters";
  import { weapons } from "$lib/data/weapons";
  import { banners } from "$lib/data/banners";
  import { currencies } from "$lib/data/items/currencies";
  import { getWeaponCategory } from "$lib/utils/importUtils";
  import { slide } from "svelte/transition";
  import { currentLocale } from "$lib/stores/locale";
  import { recordsExcludedBanners } from "$lib/stores/filterStore";

  import Button from "$lib/components/Button.svelte";
  import Images from "$lib/components/Images.svelte";
  import Icon from "$lib/components/Icons.svelte";
  import Tooltip from "$lib/components/Tooltip.svelte";

  export let bannerId;
  export let titleKey;

  const oroberyl = currencies.find((c) => c.id === "oroberyl");

  let selectedSubBannerId = "";

  $: isWeaponCard = bannerId.includes("weap");
  $: availableSubBanners = (() => {
    const list = Object.keys($pullData)
      .filter((key) => {
        if (!isWeaponCard) return key === bannerId;
        return getWeaponCategory(key) === bannerId && !$recordsExcludedBanners.includes(key);
      })
      .sort((a, b) => {
        const banA = banners.find((x) => x.id === a);
        const banB = banners.find((x) => x.id === b);
        if (!banA) return 1;
        if (!banB) return -1;
        return (
          new Date(banB.startTime).getTime() - new Date(banA.startTime).getTime()
        );
      });
    if (isWeaponCard && list.length > 1) {
      return ["all", ...list];
    }
    return list;
  })();

  $: if (availableSubBanners.length > 0) {
    const storageKey = `ark_selected_sub_${bannerId}`;
    const savedId = browser ? localStorage.getItem(storageKey) : null;

    if (
      savedId &&
      availableSubBanners.includes(savedId) &&
      !selectedSubBannerId
    ) {
      selectedSubBannerId = savedId;
    } else if (
      !selectedSubBannerId ||
      !availableSubBanners.includes(selectedSubBannerId)
    ) {
      selectedSubBannerId = availableSubBanners[0];
    }
  } else {
    selectedSubBannerId = bannerId;
  }

  $: if (
    browser &&
    selectedSubBannerId &&
    availableSubBanners.includes(selectedSubBannerId)
  ) {
    localStorage.setItem(`ark_selected_sub_${bannerId}`, selectedSubBannerId);
  }

  $: displayId = isWeaponCard ? selectedSubBannerId : bannerId;
  $: isAllBannersSelected = selectedSubBannerId === "all";

  $: displayTitle =
    isWeaponCard && selectedSubBannerId
      ? selectedSubBannerId === "all"
        ? $t("systemNames.allBanners")
        : $t(`banners.${selectedSubBannerId}`) !==
          `banners.${selectedSubBannerId}`
          ? $t(`banners.${selectedSubBannerId}`)
          : $t(titleKey)
      : $t(titleKey);

  $: titleParts = (() => {
    if (!displayTitle) return { start: "", last: "" };
    const words = displayTitle.trim().split(" ");
    if (words.length <= 1) return { start: "", last: displayTitle };
    const last = words.pop();
    const start = words.join(" ") + " ";
    return { start, last };
  })();

  $: avg6Max = isWeaponCard || bannerId.includes("new") ? 40 : 80;

  $: subBannerIds = Object.keys($pullData).filter((key) => {
    if (!isWeaponCard) return key === bannerId;
    return getWeaponCategory(key) === bannerId && !$recordsExcludedBanners.includes(key);
  });

  $: aggregatedData = (() => {
    if (selectedSubBannerId === "all") {
      let combinedPulls = [];
      subBannerIds.forEach(id => {
        const store = $pullData[id];
        if (store && Array.isArray(store.pulls)) {
          combinedPulls = [...combinedPulls, ...store.pulls.map(pull => ({ ...pull, cardBannerId: id }))];
        }
      });
      combinedPulls.sort((a, b) => {
        const tDiff = new Date(a.time).getTime() - new Date(b.time).getTime();
        if (tDiff !== 0) return tDiff;
        return (Number(a.seqId) || 0) - (Number(b.seqId) || 0);
      });

      const total = combinedPulls.length;
      const pulls6 = combinedPulls.filter(p => p.rarity === 6);
      const pulls5 = combinedPulls.filter(p => p.rarity === 5);
      
      const count6 = pulls6.length;
      const count5 = pulls5.length;
      const percent6 = total > 0 ? ((count6 / total) * 100).toFixed(2) : "0.00";
      const percent5 = total > 0 ? ((count5 / total) * 100).toFixed(2) : "0.00";
      
      let sumPity6 = 0;
      let sumPity5 = 0;
      let p6Counters = {};
      let p5Counters = {};

      combinedPulls.forEach(p => {
        const bid = p.cardBannerId || "other";

        if (!p6Counters[bid]) p6Counters[bid] = 0;
        if (!p5Counters[bid]) p5Counters[bid] = 0;

        if (p.isFree) return;
        
        if (p.rarity === 6) {
          sumPity6 += p6Counters[bid] + 1;
          p6Counters[bid] = 0;
          p5Counters[bid] = 0;
        } else if (p.rarity === 5) {
          sumPity5 += p5Counters[bid] + 1;
          p5Counters[bid] = 0;
          p6Counters[bid]++;
        } else {
          p6Counters[bid]++;
          p5Counters[bid]++;
        }
      });

      const avg6 = count6 > 0 ? (sumPity6 / count6).toFixed(1) : "0.0";
      const avg5 = count5 > 0 ? (sumPity5 / count5).toFixed(1) : "0.0";

      let won = 0;
      let total5050 = 0;
      pulls6.forEach(p => {
        const status = p.status || p.gachaStatus;
        if (status === "won") {
          won++;
          total5050++;
        } else if (status === "lost") {
          total5050++;
        }
      });
      const winRatePercent = total5050 > 0 ? Math.round((won / total5050) * 100) : 0;
      const winRate = { won, total: total5050, percent: winRatePercent };

      return {
        pulls: combinedPulls,
        stats: {
          total,
          count6,
          count5,
          percent6,
          percent5,
          avg6,
          avg5,
          winRate,
        }
      };
    } else {
      return $pullData[displayId] || { pulls: [], stats: {} };
    }
  })();

  $: stats = aggregatedData.stats || {};
  $: pulls = aggregatedData.pulls || [];
  $: total = stats.total || 0;
  $: pity6 = stats.pity6 || 0;
  $: pity5 = stats.pity5 || 0;
  $: guaranteeProgress = stats.guarantee120 || 0;
  $: hasReceivedRateUp = stats.hasReceivedRateUp || false;
  $: billableCount = (() => {
    if (isWeaponCard || isNewPlayer) return 0;
    return pulls.filter(p => !p.isFree).length;
  })();
  $: spent = (billableCount * 500).toLocaleString("ru-RU");
  $: count6 = stats.count6 || 0;
  $: count5 = stats.count5 || 0;
  $: percent6 = stats.percent6 || "0.00";
  $: percent5 = stats.percent5 || "0.00";
  $: avg6 = stats.avg6 || "0.0";
  $: avg5 = stats.avg5 || "0.0";
  $: winRate = stats.winRate || { won: 0, total: 0, percent: 0 };
  $: isNewPlayer = bannerId.includes("new-player");
  $: maxPity6 = isWeaponCard ? 40 : isNewPlayer ? 40 : 80;
  $: maxGuaranteed = isWeaponCard ? 80 : 120;
  $: showRateUpGuarantee =
    isWeaponCard && !bannerId.includes("constant") && !hasReceivedRateUp;
  $: showWinRate = winRate.total > 0 && !isNewPlayer && bannerId !== "standard";
  const normalize = (str) => str?.toLowerCase().replace(/[^a-z0-9]/g, "") || "";

  const itemMap = { ...characters, ...weapons };
  const charIds = new Set(Object.values(characters).map((c) => c.id));
  const weaponIds = new Set(Object.values(weapons).map((w) => w.id));
  const lookupMap = Object.values(itemMap).reduce((acc, item) => {
    if (item.name) acc[normalize(item.name)] = item;
    if (item.id) acc[normalize(item.id)] = item;
    return acc;
  }, {});

  $: icons = pulls
    .filter((p) => p.rarity === 6)
    .sort((a, b) => new Date(a.time) - new Date(b.time))
    .map((p) => {
      const normName = normalize(p.name);
      let itemId = normName;
      const itemData = lookupMap[normName];
      if (itemData?.id) itemId = itemData.id;

      let isWeapon = false;
      if (p.type === "weapon") {
        isWeapon = true;
      } else if (p.type === "character") {
        isWeapon = false;
      } else {
        if (charIds.has(itemId) || (itemData && !itemData.weapon)) {
          isWeapon = false;
        } else if (weaponIds.has(itemId) || (itemData && itemData.weapon)) {
          isWeapon = true;
        }
      }

      const translationKey = isWeapon
        ? `weaponsList.${itemId}`
        : `characters.${itemId}`;

      return {
        id: itemId,
        pity: p.pity || "?",
        name: p.name,
        translationKey,
        isWeapon,
        isFree: p.isFree,
        isGuaranteed: p.isGuaranteed || p.status === "guaranteed", 
      };
    });

  $: currentMaxPity = isWeaponCard ? 40 : bannerId.includes("new") ? 40 : 80;
  function getPityColor(pity) {
    const p = (pity / currentMaxPity) * 100;
    if (p <= 25) return "#5DBE5A";
    if (p <= 40) return "#3CAF38";
    if (p <= 60) return "#D4AD3D";
    if (p <= 85) return "#C55E2F";
    return "#9A3404";
  }

  function getAvgColor(val, max) {
    const num = parseFloat(val) || 0;
    const p = (num / max) * 100;

    if (p <= 35) return "#5DBE5A";
    if (p <= 50) return "#3CAF38";
    if (p <= 65) return "#D4AD3D";
    if (p <= 80) return "#C55E2F";
    return "#B03E09";
  }

  function goToDetails() {
    const targetId = displayId === "all" ? bannerId : displayId;
    goto(`/records/${targetId}`);
  }

  function getBannerImage(id) {
    const b = banners.find((x) => x.id === id);
    return b ? `/images/banners/miniIcon/${b.miniIcon}` : null;
  }

  $: mileage = stats.mileage || { show: false, current: 0, max: 0, label: "" };

  function getMileageLabel(label) {
    if (label === "selector_6") return $t("stats.selector") || "Selector";
    if (label === "guaranteed_6") return $t("stats.guaranteed") || "Guaranteed";
    if (label === "bonus_copy_6") return $t("stats.bonus_copy") || "Bonus Copy";
    if (label === "arms_offering")
      return $t("stats.arms_offering") || "Arms Offering";
    if (label === "featured_guarantee")
      return $t("stats.featured_guarantee") || "Featured Wep.";
    return label;
  }

  let isDropdownOpen = false;

  function toggleDropdown() {
    if (isWeaponCard && availableSubBanners.length > 1) {
      isDropdownOpen = !isDropdownOpen;
    }
  }

  function clickOutside(node) {
    const handleClick = event => {
      if (node && !node.contains(event.target) && !event.defaultPrevented) {
        isDropdownOpen = false;
      }
    };
    document.addEventListener('click', handleClick, true);
    return {
      destroy() {
        document.removeEventListener('click', handleClick, true);
      }
    };
  }

  function formatBannerDate(dateStr, locale) {
    if (!dateStr) return "";
    const parsed = new Date(dateStr.replace(" ", "T"));
    if (isNaN(parsed.getTime())) return "";
    try {
      return new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit"
      }).format(parsed);
    } catch (e) {
      const y = String(parsed.getFullYear()).slice(-2);
      const m = String(parsed.getMonth() + 1).padStart(2, '0');
      const d = String(parsed.getDate()).padStart(2, '0');
      return `${d}.${m}.${y}`;
    }
  }

  $: dropdownOptions = availableSubBanners.map((bId) => {
    if (bId === "all") {
      return {
        value: "all",
        label: $t("systemNames.allBanners"),
        subLabel: "",
        iconId: "",
      };
    }
    const b = banners.find((x) => x.id === bId);
    const label = b ? ($t(`banners.${b.id}`) !== `banners.${b.id}` ? $t(`banners.${b.id}`) : b.name) : bId;
    const startFormatted = b ? formatBannerDate(b.startTime, $currentLocale) : "";
    const endFormatted = b ? (b.endTime ? formatBannerDate(b.endTime, $currentLocale) : ($t("permanent") || "Permanent")) : "";
    const subLabel = startFormatted && endFormatted ? `${startFormatted} - ${endFormatted}` : "";
    return {
      value: bId,
      label,
      subLabel,
      iconId: b?.miniIcon ? b.miniIcon.replace(/\.[^/.]+$/, "") : bId,
    };
  });
</script>

<div
  class="bg-white dark:bg-[#383838] dark:border-[#444444] rounded-xl p-5 shadow-sm border border-gray-100 min-w-[320px] flex flex-col"
>
  {#if availableSubBanners.length > 1}
    <div
      class="flex gap-1 overflow-x-auto pb-0.5 pt-0.5 banners-scroll -mx-1 px-0.5 snap-x"
    >
      {#each availableSubBanners as bId}
        <div class="shrink-0">
          <Tooltip text={bId === "all" ? $t("systemNames.allBanners") : ($t(`banners.${bId}`) || bId)}>
            <button
              class="group relative {bId === "all" ? "px-2" : ""} h-12 w-18 flex-shrink-0 rounded shadow-sm border overflow-hidden transition-all focus:outline-none flex items-center justify-center
                    {selectedSubBannerId === bId
                ? 'ring-2 ring-[#e44e25] border-[#e44e25] bg-transparent text-[#e44e25] dark:text-[#e44e25]'
                : 'border-gray-200 hover:ring-2 hover:ring-[#e44e25] dark:border-[#7A7A7A] opacity-60 hover:opacity-100 bg-gray-50 dark:bg-[#2e2e2e] text-[#21272C] dark:text-[#FDFDFD]'}"
              on:click={() => (selectedSubBannerId = bId)}
            >
              {#if bId === "all"}
                <div class="flex flex-col items-center justify-center gap-1 font-bold text-[10px] uppercase">
                  <Icon name="list" class="w-4 h-4" />
                  <span>ALL</span>
                </div>
              {:else}
                <Images
                  id={bId}
                  variant="banner-mini"
                  alt={bId}
                  className="h-full w-full object-cover transition-transform group-hover:scale-110"
                />
                <div
                  class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"
                ></div>
              {/if}
            </button>
          </Tooltip>
        </div>
      {/each}
    </div>
  {/if}

  <div class="flex justify-between items-start mb-2.5 pt-1 relative" use:clickOutside>
    <div class="w-2/3 min-w-0">
      <button
        class="w-full text-left font-bold font-sdk text-[#21272C] dark:text-[#FDFDFD] text-xl leading-tight transition-opacity
               {isWeaponCard && availableSubBanners.length > 1 ? 'hover:opacity-85 cursor-pointer' : 'cursor-default'}"
        on:click={toggleDropdown}
      >
        {#if isWeaponCard && availableSubBanners.length > 1}
          {titleParts.start}<span class="whitespace-nowrap">{titleParts.last}<span class="inline-flex items-center align-middle ml-1.5 transition-transform duration-200 {isDropdownOpen ? 'rotate-180' : ''}"><Icon name="arrowDown" class="w-3.5 h-3.5 text-gray-700 dark:text-[#FDFDFD]" /></span></span>
        {:else}
          {displayTitle}
        {/if}
      </button>
    </div>
    <Button
      variant="roundSmall"
      color="gray"
      onClick={goToDetails}
    >
      {$t("page.banner.details")}
    </Button>

    {#if isDropdownOpen && dropdownOptions.length > 1}
      <div 
        transition:slide={{ duration: 200 }}
        class="
          absolute left-0 top-full mt-1.5 z-50 
          w-72 shadow-xl border overflow-hidden rounded-md
          bg-white dark:bg-[#363636] border-gray-100 dark:border-[#454545] text-[#21272C] dark:text-white
        "
      >
        <ul class="max-h-60 overflow-y-auto custom-scrollbar">
          {#each dropdownOptions as option}
            <li>
              <button
                on:click={() => {
                  selectedSubBannerId = option.value;
                  isDropdownOpen = false;
                }}
                class="
                  w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-3
                  {selectedSubBannerId === option.value 
                     ? 'bg-gray-100 dark:bg-[#505050] text-[#e44e25] dark:text-yellow-400' 
                     : 'hover:bg-gray-50 dark:hover:bg-[#404040]'}
                "
              >
                {#if option.value === "all"}
                   <div class="w-10 h-6 rounded-sm overflow-hidden flex-shrink-0 shadow-sm border border-gray-200 dark:border-[#555] flex items-center justify-center bg-gray-50 dark:bg-[#2e2e2e] text-gray-500 dark:text-[#B7B6B3]">
                       <Icon name="list" class="w-3.5 h-3.5" />
                   </div>
                {:else}
                   {#if option.iconId}
                      <div class="w-10 h-6 rounded-sm overflow-hidden flex-shrink-0 shadow-sm border border-white/10">
                          <Images 
                             id={option.iconId} 
                             variant="banner-mini" 
                             size="100%" 
                             className="w-full h-full object-cover"
                             alt={option.label}
                          />
                      </div>
                   {/if}
                {/if}
                <div class="flex flex-col min-w-0 items-start leading-none py-0.5">
                  <span class="truncate leading-tight">{option.label}</span>
                  {#if option.subLabel}
                    <span class="text-[11px] font-mono tracking-tight mt-0.5 opacity-60 text-gray-500 dark:text-gray-300">
                      {option.subLabel}
                    </span>
                  {/if}
                </div>
              </button>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  </div>

  <div class="space-y-2.5 mb-2 px-1">
    <div class="flex justify-between items-center">
      <span class="text-gray-600 dark:text-[#E4E4E4]"
        >{$t("page.banner.total")}</span
      >
      <span
        class="font-bold text-xl font-nums text-[#21272C] dark:text-[#FDFDFD]"
        >{total}</span
      >
    </div>

    {#if !isNewPlayer && !isWeaponCard}
      <div class="flex justify-between items-center">
        <span class="text-gray-600 dark:text-[#E4E4E4]"
          >{$t("page.banner.spent")}</span
        >
        <span
          class="font-bold text-gray-900 dark:text-[#FDFDFD] flex items-center gap-1 font-nums text-xl"
        >
          <Images id="oroberyl" variant="currency" size={25} />
          {spent}
        </span>
      </div>
    {/if}

    {#if !isAllBannersSelected}
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-1 text-gray-600 dark:text-[#E4E4E4]">
          <span class="font-bold">6</span>
          <Icon name="star" class="w-4 h-4" />
          <span>{$t("page.banner.pity6")}</span>
        </div>
        <span
          class="font-bold text-xl font-nums text-[#21272C] dark:text-[#FDFDFD]"
        >
          {pity6}<span class="text-sm text-gray-400 dark:text-[#B7B6B3]"
            >/{maxPity6}</span
          >
        </span>
      </div>

      {#if mileage.show && !showRateUpGuarantee}
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-1 text-gray-600 dark:text-[#E4E4E4]">
            <span class="font-bold">6</span>
            <Icon name="star" class="w-4 h-4" />
            <span>{getMileageLabel(mileage.label)}</span>
          </div>
          <span
            class="font-bold text-xl font-nums text-[#21272C] dark:text-[#FDFDFD]"
          >
            {mileage.current}<span
              class="text-sm text-gray-400 dark:text-[#B7B6B3]"
              >/{mileage.max}</span
            >
          </span>
        </div>
      {/if}

      {#if showRateUpGuarantee}
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-1 text-gray-600 dark:text-[#E4E4E4]">
            <span class="font-bold">6</span>
            <Icon name="star" class="w-4 h-4" />
            <span>{$t("page.banner.guarantee_rateup")}</span>
          </div>
          <span
            class="font-bold text-xl font-nums text-[#21272C] dark:text-[#FDFDFD]"
          >
            {guaranteeProgress}<span
              class="text-sm text-gray-400 dark:text-[#B7B6B3]"
              >/{maxGuaranteed}</span
            >
          </span>
        </div>
      {/if}

      <div class="flex justify-between items-center">
        <div class="flex items-center gap-1 text-gray-600 dark:text-[#E4E4E4]">
          <span class="font-bold">5</span>
          <Icon name="star" class="w-4 h-4" />
          <span>{$t("page.banner.pity5")}</span>
        </div>
        <span
          class="font-bold text-xl font-nums text-[#21272C] dark:text-[#FDFDFD]"
        >
          {pity5}<span class="text-sm text-gray-400 dark:text-[#B7B6B3]">/10</span
          >
        </span>
      </div>
    {/if}
  </div>

  <div class="mb-2 mt-1 px-1">
    <h4 class="font-bold text-sm mb-3 text-[#21272C] dark:text-[#FDFDFD]">
      {$t("page.banner.stats")}
    </h4>

    <div
      class="grid grid-cols-4 text-xs text-gray-500 dark:text-[#B7B6B3] mb-1 font-medium"
    >
      <div>{$t("page.banner.rarity")}</div>
      <div class="text-right">{$t("page.banner.count")}</div>
      <div class="text-right">{$t("page.banner.percent")}</div>
      <div class="text-right">{$t("page.banner.avg")}</div>
    </div>

    <div class="border-t border-gray-50 dark:border-[#444444]">
      <div class="grid grid-cols-4 text-sm items-center py-1.5 border-b border-gray-50 dark:border-[#444444]">
        <div
          class="font-bold text-gray-700 dark:text-[#FDFDFD] flex items-center gap-1 font-nums"
        >
          6 <Icon name="star" class="w-4 h-4" />
        </div>
        <div
          class="text-right font-bold font-nums text-[#21272C] dark:text-[#E4E4E4]"
        >
          {count6}
        </div>
        <div class="text-right text-gray-600 dark:text-[#B7B6B3] font-nums">
          {percent6}%
        </div>
        <div
          class="text-right font-bold font-nums"
          style="color: {getAvgColor(avg6, avg6Max)}"
        >
          {avg6}
        </div>
      </div>

      {#if showWinRate}
        <div class="grid grid-cols-4 text-sm items-center py-1.5 pb-1.5 border-b border-gray-50 dark:border-[#444444]">
          <div
            class="text-gray-600 dark:text-[#E4E4E4] text-xs pl-6 col-span-1"
          >
            {#if bannerId.includes("weap")}
              25:75
            {:else}
              50:50
            {/if}
          </div>
          <div
            class="text-right font-nums text-[#21272C] dark:text-[#E4E4E4] col-span-1"
          >
            {winRate.won}/{winRate.total}
          </div>
          <div
            class="text-right text-gray-600 dark:text-[#B7B6B3] font-nums col-span-1"
          >
            {winRate.percent}%
          </div>
          <div class="col-span-1"></div>
        </div>
      {/if}
    </div>

    <div class="grid grid-cols-4 text-sm items-center py-1.5">
      <div
        class="font-bold text-gray-700 dark:text-[#FDFDFD] flex items-center gap-1 font-nums"
      >
        5 <Icon name="star" class="w-4 h-4" />
      </div>
      <div
        class="text-right font-bold font-nums text-[#21272C] dark:text-[#E4E4E4]"
      >
        {count5}
      </div>
      <div class="text-right text-gray-600 dark:text-[#B7B6B3] font-nums">
        {percent5}%
      </div>
      <div
        class="text-right font-bold font-nums"
        style="color: {getAvgColor(avg5, 10)}"
      >
        {avg5}
      </div>
    </div>
  </div>

  <div class="px-1">
    <h4
      class="font-bold text-sm mb-3 text-[#21272C] dark:text-[#FDFDFD] flex items-center gap-1"
    >
      <span>
        {$t(isWeaponCard ? "page.banner.recentWeap" : "page.banner.recent")}
      </span>
      <span>6</span>
      <Icon name="star" class="w-4 h-4" />
      <span
        >{$t(
          isWeaponCard ? "page.banner.recent_weapons" : "page.banner.recent2",
        )}</span
      >
    </h4>

    {#if icons.length > 0}
      <div class="flex flex-wrap gap-3 overflow-visible justify-start">
        {#each icons as icon}
          <div class="relative inline-flex">
            
            <Tooltip text={$t(icon.translationKey) || icon.name}>
              <div
                class="relative w-12 h-12 transition-transform cursor-pointer hover:scale-110
        {icon.isWeapon
                  ? ''
                  : 'rounded-full border-2 border-[#ff6600] bg-gradient-to-t from-[#591C00] to-[#CA774C] shadow-sm'}"
              >
                <div
                  class="w-full h-full rounded-full overflow-hidden flex items-center justify-center
          {icon.isWeapon
                    ? 'border-[2px] border-[#ff6600] bg-gradient-to-t from-[#591C00] to-[#CA774C] shadow-sm'
                    : ''}"
                >
                  <div
                    class="w-full h-full {icon.isWeapon ? 'scale-[1.45]' : ''} transition-transform"
                  >
                    <Images
                      id={icon.id}
                      variant={icon.isWeapon ? "weapon-icon" : "operator-icon"}
                      size="100%"
                      alt={icon.name}
                    />
                  </div>
                </div>

                {#if icon.isFree}
                  <div
                    class="absolute -bottom-1 -right-1 bg-green-500 text-white font-bold rounded px-1 shadow-md z-20 pointer-events-none"
                    style="font-size: 0.65rem; line-height: 1.2rem; min-width: 1.7rem; text-align: center;"
                  >
                    FREE
                  </div>
                {:else}
                  <div
                    class="absolute -bottom-1 -right-1 min-w-7 px-2 py-1 rounded font-nums leading-none font-bold shadow-lg pointer-events-none flex items-center justify-center"
                    style="font-size: 0.85rem; min-width: 1.7rem;"
                  >
                    <div
                      class="absolute inset-0 rounded opacity-[0.88]"
                      style="background-color: {getPityColor(icon.pity)};"
                    ></div>
                    <span
                      class="relative text-white z-10"
                      title="{icon.pity} / {currentMaxPity}"
                    >
                      {icon.pity}
                    </span>
                  </div>
                {/if}
              </div>
            </Tooltip>

            {#if icon.isGuaranteed}
              <div class="absolute -top-0.5 -right-0.5 z-[40] pointer-events-auto">
                <Tooltip text={`${$t("status.guaranteed")} ${icon.isWeapon ? "80" : "120"}`}>
                  <Icon
                    name="guaranteed"
                    class="w-5 h-5 stroke-[1.1px] text-[#D0926E] filter drop-shadow-[0_2px_2px_rgba(0,0,0,0.6)] hover:scale-110 transition-transform"
                  />
                </Tooltip>
              </div>
            {/if}

          </div>
        {/each}
      </div>
    {:else}
      <div class="text-sm text-gray-400 dark:text-[#787878] italic">
        {$t(
          isWeaponCard
            ? "page.banner.fallBackWeapons"
            : "page.banner.fallBackCharacters",
        )}
      </div>
    {/if}
  </div>
</div>