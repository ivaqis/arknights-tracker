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
  import Button from "$lib/components/Button.svelte";
  import Images from "$lib/components/Images.svelte";
  import Icon from "$lib/components/Icons.svelte";
  import Tooltip from "$lib/components/Tooltip.svelte";

  // PROPS
  export let bannerId; 
  export let titleKey;

  const oroberyl = currencies.find((c) => c.id === "oroberyl");

  // --- 1. ЛОГИКА ВЫБОРА ПОД-БАННЕРА ---
  let selectedSubBannerId = "";
  $: isWeaponCard = bannerId.includes('weap');

  $: availableSubBanners = Object.keys($pullData).filter(key => {
      if (!isWeaponCard) return key === bannerId;
      return getWeaponCategory(key) === bannerId;
  }).sort(); 

  $: if (availableSubBanners.length > 0) {
      // 1. Пробуем загрузить сохраненный выбор
      const storageKey = `ark_selected_sub_${bannerId}`;
      const savedId = browser ? localStorage.getItem(storageKey) : null;

      if (savedId && availableSubBanners.includes(savedId) && !selectedSubBannerId) {
          selectedSubBannerId = savedId;
      } 
      // 2. Если ничего не выбрано или сохраненный недоступен — берем первый
      else if (!selectedSubBannerId || !availableSubBanners.includes(selectedSubBannerId)) {
          selectedSubBannerId = availableSubBanners[0];
      }
  } else {
      selectedSubBannerId = bannerId;
  }

  $: if (browser && selectedSubBannerId && availableSubBanners.includes(selectedSubBannerId)) {
      localStorage.setItem(`ark_selected_sub_${bannerId}`, selectedSubBannerId);
  }

  $: displayId = isWeaponCard ? selectedSubBannerId : bannerId;

  // Динамический заголовок
  $: displayTitle = (isWeaponCard && selectedSubBannerId) 
      ? ($t(`banners.${selectedSubBannerId}`) !== `banners.${selectedSubBannerId}` 
          ? $t(`banners.${selectedSubBannerId}`) 
          : $t(titleKey))
      : $t(titleKey);

  // --- 2. ПОЛУЧЕНИЕ ДАННЫХ ---
  $: bannerStore = $pullData[displayId] || { pulls: [], stats: {} };
  $: stats = bannerStore.stats || {};
  $: pulls = bannerStore.pulls || [];

  // --- 3. СТАТИСТИКА ---
  $: total = stats.total || 0;
  $: pity6 = stats.pity6 || 0;
  $: pity5 = stats.pity5 || 0;
  $: guaranteeProgress = stats.guarantee120 || 0; 
  $: hasReceivedRateUp = stats.hasReceivedRateUp || false;
  $: spent = (total * 500).toLocaleString("ru-RU");

  $: count6 = stats.count6 || 0;
  $: count5 = stats.count5 || 0;
  $: percent6 = stats.percent6 || "0.00";
  $: percent5 = stats.percent5 || "0.00";
  $: avg6 = stats.avg6 || "0.0";
  $: avg5 = stats.avg5 || "0.0";
  $: winRate = stats.winRate || { won: 0, total: 0, percent: 0 };

  // --- 4. НАСТРОЙКИ ---
  $: isNewPlayer = bannerId.includes("new-player");
  $: maxPity6 = isWeaponCard ? 40 : (isNewPlayer ? 40 : 80);
  $: maxGuaranteed = isWeaponCard ? 80 : 120; 
  $: showWinRate = winRate.total > 0 && !isNewPlayer && bannerId !== 'standard';
  // --- 5. ОТОБРАЖЕНИЕ ИКОНОК ---
  const normalize = (str) => str?.toLowerCase().replace(/[^a-z0-9]/g, "") || "";

  // Объединяем базы для поиска ID по имени (fallback)
  const itemMap = { ...characters, ...weapons };
  const charIds = new Set(Object.values(characters).map(c => c.id));
  const weaponIds = new Set(Object.values(weapons).map(w => w.id));
  const lookupMap = Object.values(itemMap).reduce((acc, item) => {
    if (item.name) acc[normalize(item.name)] = item;
    if (item.id) acc[normalize(item.id)] = item;
    return acc;
  }, {});

  $: icons = pulls
    .filter((p) => p.rarity === 6)
    .slice(0, 12) 
    .map((p) => {
      const normName = normalize(p.name);
      
      // 1. Поиск ID
      let itemId = normName;
      const itemData = lookupMap[normName];
      if (itemData?.id) itemId = itemData.id;

      // 2. Определение типа (Character vs Weapon)
      let isWeapon = false;

      // А. Если в логах есть явный тип - верим ему
      if (p.type === 'weapon') {
          isWeapon = true;
      } else if (p.type === 'character') {
          isWeapon = false;
      } else {
          // Б. Если типа нет (старые логи), проверяем по базам
          // Если ID есть в базе персонажей - это точно перс
          if (charIds.has(itemId) || (itemData && !itemData.weapon)) {
              isWeapon = false;
          } 
          // Иначе, если есть в базе оружия
          else if (weaponIds.has(itemId) || (itemData && itemData.weapon)) {
              isWeapon = true;
          }
      }

      const translationKey = isWeapon ? `weaponsList.${itemId}` : `characters.${itemId}`;

      return {
        id: itemId,
        pity: p.pity || "?",
        name: p.name,
        translationKey,
        isWeapon
      };
    });

  function getPityColor(pity) {
    const threshold = maxPity6; 
    const p = (pity / threshold) * 100;
    if (p <= 25) return "#5DBE5A"; 
    if (p <= 40) return "#3CAF38";
    if (p <= 60) return "#D4AD3D"; 
    if (p <= 85) return "#C55E2F"; 
    return "#9A3404"; 
  }

  function goToDetails() {
    goto(`/records/${displayId}`);
  }

  function getBannerImage(id) {
    const b = banners.find(x => x.id === id);
    // [FIX] Добавил /miniIcon/ в путь, так как файлы лежат в подпапке
    return b ? `/images/banners/miniIcon/${b.miniIcon}` : null; 
  }
</script>

<div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100 min-w-[320px] flex flex-col">  
  {#if availableSubBanners.length > 1}
    <div class="flex gap-2 overflow-x-auto pb-3 pt-1 mb-1 scrollbar-hide -mx-1 px-1">
        {#each availableSubBanners as bId}
            <Tooltip text={$t(`banners.${bId}`) || bId}>
                <button 
                    class="group relative h-12 w-18 flex-shrink-0 rounded shadow-sm border overflow-hidden transition-all focus:outline-none
                    {selectedSubBannerId === bId 
                        ? 'ring-2 ring-[#e44e25] border-[#e44e25]' 
                        : 'border-gray-200 hover:ring-2 hover:ring-[#e44e25] opacity-70 hover:opacity-100'}"
                    on:click={() => selectedSubBannerId = bId}
                >
                    <Images id={bId} variant="banner-mini" alt={bId} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                    <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                </button>
            </Tooltip>
        {/each}
    </div>
  {/if}

  <div class="flex justify-between items-start mb-4">
    <h3 class="text-xl font-bold font-sdk text-[#21272C] w-2/3 leading-tight">
        {displayTitle}
    </h3>
    <Button variant="roundSmall" color="gray" onClick={goToDetails}>
        {$t("page.banner.details")}
    </Button>
  </div>

  <div class="space-y-3 mb-2"> 
    <div class="flex justify-between items-center">
      <span class="text-gray-600">{$t("page.banner.total")}</span>
      <span class="font-bold text-xl font-nums text-[#21272C]">{total}</span>
    </div>

    {#if !isNewPlayer && !isWeaponCard}
      <div class="flex justify-between items-center">
        <span class="text-gray-600">{$t("page.banner.spent")}</span>
        <span class="font-bold text-gray-900 flex items-center gap-2 font-nums text-xl">
          <Images id="oroberyl" variant="currency" size={25} />
          {spent}
        </span>
      </div>
    {/if}

    <div class="flex justify-between items-center">
      <div class="flex items-center gap-1 text-gray-600">
        <span class="font-bold">6</span>
        <Icon name="star" class="w-4 h-4" />
        <span>{$t("page.banner.pity6")}</span>
      </div>
      <span class="font-bold text-xl font-nums text-[#21272C]">
        {pity6}<span class="text-sm text-gray-400">/{maxPity6}</span>
      </span>
    </div>

    {#if 
       // Условие 1: Это не Стандартное оружие (нет 'constant')
       !bannerId.includes('constant') && 
       // Условие 2: Это Специальный баннер (перс) ИЛИ Ивентовое оружие
       (bannerId.includes('special') || (isWeaponCard && !bannerId.includes('constant'))) &&
       // Условие 3: Поведение скрытия
       // Если Оружие -> Скрываем, когда получили (hasReceivedRateUp)
       // Если Персонаж -> Показываем всегда (игнорируем hasReceivedRateUp, так как гарант цикличен)
       (isWeaponCard ? !hasReceivedRateUp : true)
    }
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-1 text-gray-600">
            <span class="font-bold">6</span>
            <Icon name="star" class="w-4 h-4" />
            <span>{$t("page.banner.guarantee_rateup")}</span> 
        </div>
        <span class="font-bold text-xl font-nums text-[#21272C]">
          {guaranteeProgress}<span class="text-sm text-gray-400">/{maxGuaranteed}</span>
        </span>
      </div>
    {/if}

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

  <div class="mb-4">
    <h4 class="font-bold text-sm mb-2 text-[#21272C]">
      {$t("page.banner.stats")}
    </h4>

    <div class="grid grid-cols-4 text-xs text-gray-500 mb-1 font-medium">
      <div>{$t("page.banner.rarity")}</div>
      <div class="text-right">{$t("page.banner.count")}</div>
      <div class="text-right">{$t("page.banner.percent")}</div>
      <div class="text-right">{$t("page.banner.avg")}</div>
    </div>

    <div class="border-b border-gray-50">
      <div class="grid grid-cols-4 text-sm items-center py-2">
        <div class="font-bold text-gray-700 flex items-center gap-1 font-nums">
          6 <Icon name="star" class="w-4 h-4" />
        </div>
        <div class="text-right font-bold font-nums text-[#21272C]">{count6}</div>
        <div class="text-right text-gray-600 font-nums">{percent6}%</div>
        <div class="text-right font-bold font-nums text-[#1D6F42]">{avg6}</div>
      </div>

      {#if showWinRate}
        <div class="grid grid-cols-4 text-sm items-center py-1 pb-2">
          <div class="text-gray-600 text-xs pl-6 col-span-1">
            50/50
          </div>
          <div class="text-right font-nums text-[#21272C] col-span-1">
            {winRate.won}/{winRate.total}
          </div>
          <div class="text-right text-gray-600 font-nums col-span-1">
            {winRate.percent}%
          </div>
          <div class="col-span-1"></div>
        </div>
      {/if}
    </div>

    <div class="grid grid-cols-4 text-sm items-center py-2">
      <div class="font-bold text-gray-700 flex items-center gap-1 font-nums">
        5 <Icon name="star" class="w-4 h-4" />
      </div>
      <div class="text-right font-bold font-nums text-[#21272C]">{count5}</div>
      <div class="text-right text-gray-600 font-nums">{percent5}%</div>
      <div class="text-right font-bold font-nums text-[#1D6F42]">{avg5}</div>
    </div>
  </div>

  <div>
    <h4 class="font-bold text-sm mb-3 text-[#21272C] flex items-center gap-1">
      <span>{$t("page.banner.recent")}</span>
      <span>6</span>
      <Icon name="star" class="w-4 h-4" />
      <span>{$t(isWeaponCard ? "page.banner.recent_weapons" : "page.banner.recent2")}</span>
    </h4>

    {#if icons.length > 0}
      <div class="grid grid-cols-6 gap-3 overflow-visible">
        {#each icons as icon}
          <div class="inline-flex">
            <Tooltip text={$t(icon.translationKey) || icon.name}>
              <div
                class="relative w-12 h-12 transition-transform cursor-pointer hover:scale-110
                {icon.isWeapon ? '' : 'rounded-full border-2 border-[#D0926E] bg-gray-100 shadow-sm'}"
              >
                <div class="w-full h-full rounded-full overflow-hidden flex items-center justify-center 
                    {icon.isWeapon ? 'border-[2px] border-[#ff6600] bg-gradient-to-t from-[#591C00] to-[#BD896E] shadow-sm' : ''}">
                    
                    <div class="w-full h-full {icon.isWeapon ? 'scale-[1.45]' : ''} transition-transform">
                      <Images
                        id={icon.id}
                        variant={icon.isWeapon ? "weapon-icon" : "operator-icon"}
                        size="100%"
                        alt={icon.name}
                      />
                    </div>
                </div>

                {#if icon.isWeapon}
                    <div
                      class="absolute -bottom-1 -right-1 min-w-7 px-2 py-1 rounded font-nums leading-none font-bold shadow-lg pointer-events-none z-20 flex items-center justify-center bg-[#eec71b] text-[#21272C]"
                      style="font-size: 0.85rem; min-width: 1.7rem;"
                    >
                      {icon.pity}
                    </div>
                {:else}
                    <div
                      class="absolute -bottom-1 -right-1 min-w-7 px-2 py-1 rounded font-nums leading-none font-bold shadow-lg pointer-events-none flex items-center justify-center"
                      style="font-size: 0.85rem; min-width: 1.7rem;"
                    >
                      <div
                        class="absolute inset-0 rounded opacity-90"
                        style="background-color: {getPityColor(icon.pity)};"
                      ></div>
                      <span class="relative text-white z-10">{icon.pity}</span>
                    </div>
                {/if}
              </div>
            </Tooltip>
          </div>
        {/each}
      </div>
    {:else}
      <div class="text-sm text-gray-400 italic">
        {$t("page.banner.fallBackCharacters")}
      </div>
    {/if}
  </div>
</div>
