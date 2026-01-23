<script>
  import { t } from "$lib/i18n";
  import { pullData } from "$lib/stores/pulls";
  import { goto } from "$app/navigation";
  import { characters } from "$lib/data/characters";
  import { currencies } from "$lib/data/items/currencies";
  import Button from "$lib/components/Button.svelte";
  import Images from "$lib/components/Images.svelte";
  import Icon from "$lib/components/Icons.svelte";
  import Tooltip from "$lib/components/Tooltip.svelte";

  // PROPS
  export let bannerId; // 'special', 'standard', 'new_player'
  export let titleKey;

  // Валюта (Ороберил)
  const oroberyl = currencies.find((c) => c.id === "oroberyl");

  // --- ПОЛУЧЕНИЕ ДАННЫХ ИЗ СТОРА ---
  // Данные теперь уже посчитаны в pulls.js при импорте. Мы просто их читаем.

  // 1. Берем данные конкретного баннера
  $: bannerStore = $pullData[bannerId] || { pulls: [], stats: {} };

  // 2. Достаем статистику (с дефолтными значениями, чтобы не было undefined)
  $: stats = bannerStore.stats || {};
  $: pulls = bannerStore.pulls || [];

  // 3. Распаковываем основные цифры
  $: total = stats.total || 0;
  $: pity6 = stats.pity6 || 0;
  $: pity5 = stats.pity5 || 0;
  $: guarantee120 = stats.guarantee120 || 0;
  $: hasReceivedRateUp = stats.hasReceivedRateUp || false;

  // 4. Форматируем "Потрачено"
  $: spent = (total * 500).toLocaleString("ru-RU");

  // 5. Данные для таблицы
  $: count6 = stats.count6 || 0;
  $: count5 = stats.count5 || 0;
  $: percent6 = stats.percent6 || "0.00";
  $: percent5 = stats.percent5 || "0.00";
  $: avg6 = stats.avg6 || "0.0";
  $: avg5 = stats.avg5 || "0.0";
  $: winRate = stats.winRate || { won: 0, total: 0, percent: 0 };

  // 6. Проверка типа баннера (для отображения гаранта и winrate)
  // Проверяем, содержит ли ID слово 'special' или равен ему
  $: isSpecial = bannerId.includes("special");

  // --- ЛОГИКА ОТОБРАЖЕНИЯ ИКОНОК ПЕРСОНАЖЕЙ ---

  const normalize = (str) => str?.toLowerCase().replace(/\s+/g, "") || "";

  const charMap = Object.values(characters).reduce((acc, char) => {
    if (char.name) acc[normalize(char.name)] = char;
    acc[normalize(char.id)] = char;
    return acc;
  }, {});

  // Берем только леги (6*) для отображения внизу
  $: icons = pulls
    .filter((p) => p.rarity === 6)
    // .slice(0, 12) // Можно раскомментировать, если нужно ограничить кол-во иконок
    .map((p) => {
      const lookupKey = normalize(p.name);
      const charData = charMap[lookupKey];
      const iconSrc = charData?.icon || "/images/avatars/default_6star.png";
      // ID нужен для перевода
      const charId = charData?.id || normalize(p.name);

      return {
        src: iconSrc,
        pity: p.pity || "?",
        name: p.name,
        translationKey: `characters.${charId}`,
      };
    });

  // Цвет бейджика с пити
  function getPityColor(pity) {
    if (pity >= 1 && pity <= 20) return "#5DBE5A"; // Зеленый
    if (pity > 20 && pity <= 30) return "#3CAF38";
    if (pity > 30 && pity <= 50) return "#D4AD3D"; // Желтый
    if (pity > 50 && pity <= 70) return "#C55E2F"; // Оранжевый
    if (pity > 70 && pity <= 80) return "#9A3404"; // Красный
    return "#21272C";
  }

  function goToDetails() {
    goto(`/records/${bannerId}`);
  }
</script>

<div
  class="bg-white rounded-xl p-5 shadow-sm border border-gray-100 min-w-[320px]"
>
  <div class="flex justify-between items-start mb-4">
    <h3 class="text-xl font-bold font-sdk text-[#21272C] w-2/3 leading-tight">
      {$t(titleKey)}
    </h3>
    <Button variant="roundSmall" color="gray" onClick={goToDetails}>
      {$t("page.banner.details")}
    </Button>
  </div>

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

    {#if isSpecial && !hasReceivedRateUp}
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-1 text-gray-600">
          <span class="font-bold">6</span>
          <Icon name="star" class="w-4 h-4" />
          <span>{$t("page.banner.guarantee")}</span>
        </div>
        <span class="font-bold text-xl font-nums text-[#21272C]">
          {guarantee120}<span class="text-sm text-gray-400">/120</span>
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
        <div class="text-right font-bold font-nums text-[#21272C]">
          {count6}
        </div>
        <div class="text-right text-gray-600 font-nums">{percent6}%</div>
        <div class="text-right font-bold font-nums text-[#1D6F42]">{avg6}</div>
      </div>

      {#if isSpecial && winRate.total > 0}
        <div class="grid grid-cols-4 text-sm items-center py-1 pb-2">
          <div class="text-gray-600 text-xs pl-6 col-span-1">
            {$t("page.banner.won5050")}
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
      <span>{$t("page.banner.recent2")}</span>
    </h4>

    {#if icons.length > 0}
      <div class="grid grid-cols-6 gap-3 overflow-visible">
        {#each icons as icon}
          <div class="inline-flex">
            <Tooltip text={$t(icon.translationKey) || icon.name}>
              <div
                class="relative w-12 h-12 rounded-full bg-gray-100 border-2 border-[#D0926E] hover:scale-110 transition-transform cursor-pointer shadow-sm"
              >
                <div class="w-full h-full overflow-hidden rounded-full">
                  <img
                    src={icon.src}
                    alt={icon.name}
                    class="w-full h-full object-cover transform scale-110"
                  />
                </div>

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
