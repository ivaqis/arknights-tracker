<script>
  import { goto } from "$app/navigation";
  import { t } from "$lib/i18n";
  import { pullData } from "$lib/stores/pulls";
  import { bannerTypes } from "$lib/data/bannerTypes";
  import { banners } from "$lib/data/banners";
  import { currencies } from "$lib/data/items/currencies.js";
  import BannerCard from "$lib/components/BannerCard.svelte";
  import SettingsModal from "$lib/components/SettingsModal.svelte";
  import SquareButton from "$lib/components/Button.svelte";
  import RatingCard from "$lib/components/RatingCard.svelte";
  import Icon from "$lib/components/Icons.svelte";
  import Images from "$lib/components/Images.svelte";

  $: pullsStats = Object.entries($pullData).reduce(
    (acc, [key, banner]) => {
      if (!banner || typeof banner !== "object") return acc;

      const count = banner.stats?.total || banner.pulls?.length || 0;
      
      // 1. Определяем тип
      const bannerConfig = banners.find(b => b.id === key);
      const type = bannerConfig ? bannerConfig.type : "";
      
      const isNewPlayer = type === 'new-player' || key.includes("new-player") || key.includes("new_player");
      const isWeapon = type === 'weapon' || key.includes('weap') || key.includes('wepon');

      // 1. Абсолютный тотал (просто количество круток для статистики)
      acc.total += count;

      // 2. Billable (Стоимость)
      // Исключаем новичка И Исключаем оружие (везде)
      if (!isNewPlayer && !isWeapon) {
          acc.billable += count;     // Для Ороберила
          acc.billableChar += count; // Для Оригеометрии (суть та же)
      }

      return acc;
    },
    { total: 0, billable: 0, billableChar: 0 }
  );

  $: totalPulls = pullsStats.total;
  $: billablePulls = pullsStats.billable;      
  $: charPullsOnly = pullsStats.billableChar;

  $: homeBanners = [...bannerTypes]
    .filter((b) => b.showOnHome)
    .sort((a, b) => a.order - b.order);

  let userLuck6 = 15; // Placeholder
  let userLuck5 = 50;

  let isSettingsOpen = false;

  const oroberyl = currencies.find((c) => c.id === "oroberyl");

  function openImport() {
    goto("/records/import");
  }

  function openGlobal() {
    goto("/records/global");
  }
</script>

<SettingsModal
  isOpen={isSettingsOpen}
  onClose={() => (isSettingsOpen = false)}
/>

<div class="max-w-[1400px]">
  <div class="flex flex-col md:flex-row mb-8 gap-4 md:items-center">
    
    <h2 class="font-sdk text-5xl tracking-wide text-[#21272C] mb-2 md:mb-0">
      {$t("page.title")}
    </h2>

    <div class="w-full md:w-48">
      <SquareButton variant="yellow" onClick={openImport}>
        <div slot="icon">
          <Icon name="import" style="width: 30px; height: 30px;" />
        </div>
        {$t("page.importBtn")}
      </SquareButton>
    </div>
    <!--
    <div class="w-full md:w-80">
      <SquareButton variant="black2" onClick={openGlobal}>
        <div slot="icon">
          <Icon name="globe" style="width: 30px; height: 30px;" />
        </div>
        {$t("page.globalBtn")}
      </SquareButton>
    </div>
    -->

    <div class="w-full md:w-64">
      <SquareButton variant="black2" onClick={() => (isSettingsOpen = true)}>
        <div slot="icon">
          <Icon name="settings" style="width: 30px; height: 30px;" />
        </div>
        {$t("page.settingsBtn")}
      </SquareButton>
    </div>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8 items-start">
    {#each homeBanners as b}
      <BannerCard bannerId={b.id} titleKey={b.i18nKey} />
    {/each}
<!--
    <div class="xl:col-span-1">
      <RatingCard {userLuck6} {userLuck5} {totalPulls} />
    </div>-->

    <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 min-w-[320px]">
      <h3 class="text-xl font-bold mb-4 font-sdk text-[#21272C]">
        {$t("page.totalCost")}
      </h3>

      <div class="text-3xl font-black text-[#21272C] flex items-center gap-2 font-nums">
        <Images id="oroberyl" variant="currency" size={32} />
        {(billablePulls * 500).toLocaleString("ru-RU")}
      </div>

      <div class="text-xs text-gray-400 mt-2 font-medium flex items-center">
        ≈ <Images id="origeometry" variant="currency" size={20} /> {((charPullsOnly * 500) / 75).toFixed(0)}  {$t("page.banner.origeometry")}
      </div>
    </div>
  </div>
</div>