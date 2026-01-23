<script>
  import { goto } from "$app/navigation";
  import { t } from "$lib/i18n";
  import { pullData } from "$lib/stores/pulls";
  import { bannerTypes } from "$lib/data/bannerTypes";
  import { currencies } from "$lib/data/items/currencies.js";
  import BannerCard from "$lib/components/BannerCard.svelte";
  import SettingsModal from "$lib/components/SettingsModal.svelte";
  import SquareButton from "$lib/components/Button.svelte";
  import RatingCard from "$lib/components/RatingCard.svelte";
  import Icon from "$lib/components/Icons.svelte";
  import Images from "$lib/components/Images.svelte";

  // [FIX] Обновленная логика подсчета.
  // Теперь берем total из banner.stats.total или длины массива pulls
  $: totalPulls = Object.values($pullData).reduce((sum, banner) => {
    if (!banner || typeof banner !== "object") return sum;
    
    // Пробуем взять из посчитанной статистики, если нет - считаем длину массива
    const count = banner.stats?.total || banner.pulls?.length || 0;
    return sum + count;
  }, 0);

  $: homeBanners = [...bannerTypes]
    .filter((b) => b.showOnHome)
    .sort((a, b) => a.order - b.order);

  let userLuck6 = 15; // Заглушка
  let userLuck5 = 50; // Заглушка

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

<div class="max-w-[1600px] justify-start">
  <div class="inline-flex mb-8 gap-4 content-center items-center">
    <h2 class="font-sdk text-5xl tracking-wide text-[#21272C]">
      {$t("page.title")}
    </h2>

    <div class="w-48">
      <SquareButton variant="yellow" onClick={openImport}>
        <div slot="icon">
          <Icon name="import" style="width: 30px; height: 30px;" />
        </div>
        {$t("page.importBtn")}
      </SquareButton>
    </div>

    <div class="w-80">
      <SquareButton variant="black2" onClick={openGlobal}>
        <div slot="icon">
          <Icon name="globe" style="width: 30px; height: 30px;" />
        </div>
        {$t("page.globalBtn")}
      </SquareButton>
    </div>

    <div class="w-64">
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

    <div class="xl:col-span-1">
      <RatingCard {userLuck6} {userLuck5} {totalPulls} />
    </div>

    <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 min-w-[320px]">
      <h3 class="text-xl font-bold mb-4 font-sdk text-[#21272C]">
        {$t("page.totalCost")}
      </h3>

      <div class="text-3xl font-black text-gray-900 flex items-center gap-2 font-nums">
        <Images id="oroberyl" variant="currency" size={32} />
        {(totalPulls * 500).toLocaleString("ru-RU")}
      </div>

      <div class="text-xs text-gray-400 mt-2 font-medium">
        ≈ {((totalPulls * 500) / 75).toFixed(0)} {$t("page.banner.origeometry")}
      </div>
    </div>
  </div>
</div>