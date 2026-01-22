<!-- src/lib/components/BannerCard.svelte -->
<script>
  import { t } from "$lib/i18n";
  import { pullData } from "$lib/stores/pulls";
  import { goto } from "$app/navigation";
  import { characters } from "$lib/data/characters";
  import { currencies } from "$lib/data/items/currencies";
  import { banners } from "$lib/data/banners";
  import Button from "$lib/components/Button.svelte";
  import Images from "$lib/components/Images.svelte";
  import Icon from "$lib/components/Icons.svelte";
  import Tooltip from "$lib/components/Tooltip.svelte";

  // Props
  export let bannerId;
  export let titleKey;

  const oroberyl = currencies.find((c) => c.id === "oroberyl");

  // Get banner type - find by type instead of id
  $: banner = (() => {
    // Try exact match first
    let found = banners.find((b) => b.id === bannerId);
    if (found) return found;

    // Try matching by type
    if (bannerId === "standard")
      return banners.find((b) => b.type === "standard");
    if (bannerId === "special")
      return banners.find((b) => b.type === "special");
    if (bannerId === "new-player")
      return banners.find((b) => b.type === "new-player");

    return null;
  })();
  $: isSpecialBanner = banner?.type === "special";
  $: featured6List = banner?.featured6 || [];

  $: bannerData = $pullData[bannerId] || {
    total: 0,
    legendary: 0,
    rare: 0,
    pulls: [],
  };

  $: pulls = bannerData.pulls || [];

  $: total = bannerData.total || 0;
  $: spent = (total * 500).toLocaleString("ru-RU");

  $: legendary = bannerData.legendary || 0;
  $: rare = bannerData.rare || 0;

  // Count by rarity
  $: count6 = pulls.filter((p) => p.rarity === 6).length;
  $: count5 = pulls.filter((p) => p.rarity === 5).length;

  // Pity calculations
  function calculateCurrentPity(items, rarityTarget) {
    let count = 0;
    for (let i = items.length - 1; i >= 0; i--) {
      if (items[i].rarity === rarityTarget) break;
      count++;
    }
    return count;
  }

  $: pity6 = calculateCurrentPity(pulls, 6);

  $: pity5 = (() => {
    let count = 0;
    for (let i = pulls.length - 1; i >= 0; i--) {
      if (pulls[i].rarity >= 5) break;
      count++;
    }
    return count;
  })();

  // 6* guarantee for special banner (resets each new banner, only counts current banner pulls)
  $: guarantee6 = (() => {
    if (!isSpecialBanner) return 0;

    let count = 0;
    // Count only pulls from current banner until featured 6* appears
    for (let i = pulls.length - 1; i >= 0; i--) {
      const pull = pulls[i];

      if (pull.rarity === 6) {
        const normalizedPullName = normalize(pull.name);
        const isFeatured = featured6List.some((featuredId) => {
          const featuredChar = characters[featuredId];
          return (
            featuredChar && normalize(featuredChar.name) === normalizedPullName
          );
        });

        if (isFeatured) break;
      }
      count++;
    }
    return count;
  })();

  // Average Pity for 5*
  $: avgPity5 = (() => {
    if (count5 === 0) return 0;
    let pitySum = 0;
    let currentCounter = 0;
    for (const pull of pulls) {
      currentCounter++;
      if (pull.rarity === 5) {
        pitySum += currentCounter;
        currentCounter = 0;
      }
    }
    return (pitySum / count5).toFixed(1);
  })();

  // Average Pity for 6*
  $: avgPity6 = (() => {
    if (count6 === 0) return 0;
    let pitySum = 0;
    let currentCounter = 0;
    for (const pull of pulls) {
      currentCounter++;
      if (pull.rarity === 6) {
        pitySum += currentCounter;
        currentCounter = 0;
      }
    }
    return (pitySum / count6).toFixed(1);
  })();

  // 50/50 win rate for 6*
  $: winRate6 = (() => {
    if (count6 === 0) return { won: 0, total: 0, percent: 0 };

    let won = 0;
    let total = 0;
    let lastWasFeatured = true; // First 6* is always 50/50

    for (const pull of pulls) {
      if (pull.rarity === 6) {
        const normalizedPullName = normalize(pull.name);
        const isFeatured = featured6List.some((featuredId) => {
          const featuredChar = characters[featuredId];
          return (
            featuredChar && normalize(featuredChar.name) === normalizedPullName
          );
        });

        // Count 50/50 only if previous was featured (or first pull)
        if (lastWasFeatured) {
          total++;
          if (isFeatured) won++;
        }

        lastWasFeatured = isFeatured;
      }
    }

    return {
      won,
      total,
      percent: total > 0 ? ((won / total) * 100).toFixed(0) : 0,
    };
  })();

  // 50/50 win rate for 5*
  $: winRate5 = (() => {
    if (count5 === 0) return { won: 0, total: 0, percent: 0 };

    const featured5List = banner?.featured5 || [];
    let won = 0;
    let total = 0;
    let lastWasFeatured = true;

    for (const pull of pulls) {
      if (pull.rarity === 5) {
        const normalizedPullName = normalize(pull.name);
        const isFeatured = featured5List.some((featuredId) => {
          const featuredChar = characters[featuredId];
          return (
            featuredChar && normalize(featuredChar.name) === normalizedPullName
          );
        });

        if (lastWasFeatured) {
          total++;
          if (isFeatured) won++;
        }

        lastWasFeatured = isFeatured;
      }
    }

    return {
      won,
      total,
      percent: total > 0 ? ((won / total) * 100).toFixed(0) : 0,
    };
  })();

  // Statistics table
  $: stats = [
    {
      label: "6",
      count: count6,
      percent: total > 0 ? ((count6 / total) * 100).toFixed(2) : "0.00",
      avg: avgPity6,
      winRate: winRate6,
    },
    {
      label: "5",
      count: count5,
      percent: total > 0 ? ((count5 / total) * 100).toFixed(2) : "0.00",
      avg: avgPity5, // Changed from "-" to avgPity5
      winRate: winRate5,
    },
  ];

  // Character icons
  const normalize = (str) => str.toLowerCase().replace(/\s+/g, "");

  const charMap = Object.values(characters).reduce((acc, char) => {
    if (char.name) {
      acc[normalize(char.name)] = char;
    }
    acc[normalize(char.id)] = char;
    return acc;
  }, {});

  $: icons = pulls
    .filter((p) => p.rarity === 6)
    .map((p) => {
      const lookupKey = normalize(p.name);
      const charData = charMap[lookupKey];

      const iconSrc = charData?.icon || "/images/avatars/default_6star.png";

      return {
        src: iconSrc,
        pity: p.pity || "?",
        name: p.name,
      };
    });

  function goToDetails() {
    goto(`/records/${bannerId}`);
  }

  function getPityColor(pity) {
    if (pity >= 1 && pity <= 20) return "#5DBE5A";
    if (pity > 20 && pity <= 30) return "#3CAF38";
    if (pity > 30 && pity <= 50) return "#D4AD3D";
    if (pity > 50 && pity <= 70) return "#C55E2F";
    if (pity > 70 && pity <= 80) return "#9A3404";
    return "#21272C";
  }
</script>

<div
  class="bg-white rounded-xl p-5 shadow-sm border border-gray-100 min-w-[320px]"
>
  <!-- HEADER -->
  <div class="flex justify-between items-start mb-4">
    <h3 class="text-xl font-bold font-sdk text-[#21272C] w-2/3 leading-tight">
      {$t(titleKey)}
    </h3>
    <Button variant="roundSmall" color="gray" onClick={goToDetails}
      >{$t("page.banner.details")}</Button
    >
  </div>

  <!-- MAIN STATS -->
  <div class="space-y-3 mb-6">
    <div class="flex justify-between items-center">
      <span class="text-gray-600">{$t("page.banner.total")}</span>
      <span class="font-bold text-xl font-nums text-[#21272C]">{total}</span>
    </div>

    <div class="flex justify-between items-center">
      <span class="text-gray-600">{$t("page.banner.spent")}</span>
      <span
        class="font-bold text-gray-900 flex items-center gap-2 font-nums text-xl"
      >
        <Images item={oroberyl} category="currencies" size={25} />
        {spent}
      </span>
    </div>

    <!-- 6★ Pity -->
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-1 text-gray-600">
        <span class="font-bold">6</span>
        <Icon name="star" class="w-4 h-4" />
        <span>{$t("page.banner.pity6")}</span>
      </div>
      <span class="font-bold text-xl font-nums text-[#21272C]">
        {pity6}<span class="text-sm text-gray-400">/80</span>
      </span>
    </div>

    <!-- 6★ Guarantee (special banner only) -->
    {#if isSpecialBanner}
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-1 text-gray-600">
          <span class="font-bold">6</span>
          <Icon name="star" class="w-4 h-4" />
          <span>{$t("page.banner.guarantee")}</span>
        </div>
        <span class="font-bold text-xl font-nums text-[#21272C]">
          {guarantee6}<span class="text-sm text-gray-400">/120</span>
        </span>
      </div>
    {/if}

    <!-- 5★ Pity -->
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-1 text-gray-600">
        <span class="font-bold">5</span>
        <Icon name="star" class="w-4 h-4" />
        <span>{$t("page.banner.pity5")}</span>
      </div>
      <span class="font-bold text-xl font-nums text-[#21272C]">
        {pity5}<span class="text-sm text-gray-400">/10</span>
      </span>
    </div>
  </div>

  <!-- STATISTICS -->
  <div class="mb-4">
    <h4 class="font-bold text-sm mb-2 text-[#21272C]">
      {$t("page.banner.stats")}
    </h4>

    <!-- Table header -->
    <div class="grid grid-cols-4 text-xs text-gray-500 mb-1 font-medium">
      <div>{$t("page.banner.rarity")}</div>
      <div class="text-right">{$t("page.banner.count")}</div>
      <div class="text-right">{$t("page.banner.percent")}</div>
      <div class="text-right">{$t("page.banner.avg")}</div>
    </div>

    <!-- Table rows -->
    {#each stats as row}
      <div class="border-b border-gray-50 last:border-0">
        <!-- Main row -->
        <div class="grid grid-cols-4 text-sm items-center py-1">
          <div
            class="font-bold text-gray-700 flex items-center gap-1 font-nums"
          >
            {row.label}
            <Icon name="star" class="w-4 h-4" />
          </div>
          <div class="text-right font-bold font-nums text-[#21272C]">
            {row.count}
          </div>
          <div class="text-right text-gray-600 font-nums">{row.percent}%</div>
          <div class="text-right font-bold font-nums text-[#1D6F42]">
            {row.avg}
          </div>
        </div>

        <!-- Win rate sub-row (only for special banners) -->
        {#if isSpecialBanner && row.winRate.total > 0}
          <div class="grid grid-cols-4 text-sm items-center py-1">
            <div class="text-gray-600 text-xs pl-6">
              {$t("page.banner.won5050")}
            </div>
            <div class="text-right font-nums text-[#21272C]">
              {row.winRate.won}
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

  <!-- RECENT 6* CHARACTERS -->
  <div>
    <h4 class="font-bold text-sm mb-3 text-[#21272C] flex items-center gap-1">
      <span>{$t("page.banner.recent")}</span>
      <span>6</span>
      <Icon name="star" class="w-4 h-4" />
      <span>{$t("page.banner.recent2")}</span>
    </h4>

    {#if icons.length > 0}
      <div class="grid grid-cols-6 gap-3 overflow-visible">
        {#each icons as icon}
          <div class="inline-flex">
            <Tooltip
              text={$t(
                `characters.${charMap[normalize(icon.name)]?.id || normalize(icon.name)}`,
              ) || icon.name}
            >
              <div
                class="relative w-12 h-12 rounded-full bg-gray-100 border-2 border-[#D0926E]
                   hover:scale-110 transition-transform cursor-pointer shadow-sm"
              >
                <!-- Character image -->
                <div class="w-full h-full overflow-hidden rounded-full">
                  <img
                    src={icon.src}
                    alt={icon.name}
                    class="w-full h-full object-cover transform scale-110"
                  />
                </div>

                <!-- Pity badge -->
                <div
                  class="absolute -bottom-1 -right-1 min-w-7 px-2 py-1 rounded font-nums leading-none font-bold shadow-lg pointer-events-none"
                  style="font-size: 0.85rem; min-width: 1.7rem;"
                >
                  <div
                    class="absolute inset-0 rounded opacity-75"
                    style="background-color: {getPityColor(icon.pity)};"
                  ></div>
                  <span class="relative text-white z-10">{icon.pity}</span>
                </div>
              </div>
            </Tooltip>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
