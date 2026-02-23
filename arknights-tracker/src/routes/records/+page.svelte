<script>
  import { goto } from "$app/navigation";
  import { t } from "$lib/i18n";
  import { pullData } from "$lib/stores/pulls";
  import { bannerTypes } from "$lib/data/bannerTypes";
  import { banners } from "$lib/data/banners";
  import { currencies } from "$lib/data/items/currencies.js";
  import BannerCard from "$lib/components/BannerCard.svelte";
  import SettingsModal from "$lib/components/SettingsModal.svelte";
  import Button from "$lib/components/Button.svelte";
  import RatingCard from "$lib/components/RatingCard.svelte";
  import Icon from "$lib/components/Icons.svelte";
  import Images from "$lib/components/Images.svelte";

  $: pullsStats = (() => {
    let allPulls = [];
    Object.entries($pullData).forEach(([boxId, data]) => {
      if (!data || !data.pulls) return;
      data.pulls.forEach(p => {
        allPulls.push({
          ...p,
          boxId: boxId, 
          timeMs: new Date(p.time).getTime() 
        });
      });
    });

    allPulls.sort((a, b) => a.timeMs - b.timeMs);

    let total = 0;
    let billable = 0;
    let billableChar = 0;
    let bannerCounts = {}; 

    allPulls.forEach(p => {
      const specificBanner = banners.find(b => {
         const start = new Date(b.startTime).getTime();
         const end = b.endTime ? new Date(b.endTime).getTime() : 4102444800000;
         if (p.timeMs < start || p.timeMs > end) return false;
         const bType = (b.type || "").toLowerCase();
         const pBox = p.boxId.toLowerCase();
         if (pBox.includes('special') && bType === 'special') return true;
         if (pBox.includes('weap') && bType === 'weapon') return true;
         if (pBox.includes('new') && bType === 'new-player') return true;
         if (pBox.includes('standard') && (bType === 'standard' || bType === 'constant')) return true;
         
         return false;
      });

      const bid = specificBanner ? specificBanner.id : p.boxId;
      const bType = specificBanner ? specificBanner.type : (p.boxId.includes('weap') ? 'weapon' : 'special');
      const isWeapon = bType === 'weapon' || p.boxId.includes('weap') || p.boxId.includes('wepon');
      const isNewPlayer = bType === 'new-player' || p.boxId.includes('new');
      const isSpecial = bType === 'special' && !isWeapon && !isNewPlayer;
      if (!bannerCounts[bid]) bannerCounts[bid] = 0;
      let isFree = false;
      if (isSpecial && bannerCounts[bid] >= 30 && bannerCounts[bid] < 40) {
          isFree = true;
      }

      bannerCounts[bid]++;
      total++;

      if (!isNewPlayer && !isWeapon) {
          if (!isFree) {
              billable++;
              billableChar++;
          }
      }
    });

    return { total, billable, billableChar };
  })();

  $: totalPulls = pullsStats.total;
  $: billablePulls = pullsStats.billable;      
  $: charPullsOnly = pullsStats.billableChar;
  $: homeBanners = [...bannerTypes]
    .filter((b) => b.showOnHome)
    .sort((a, b) => a.order - b.order);

  let isSettingsOpen = false;

  const oroberyl = currencies.find((c) => c.id === "oroberyl");

  function openImport() {
    goto("/records/import");
  }

  function openGlobal() {
    goto("/records/global");
  }

  function getBanner(partialId) {
    return homeBanners.find(b => b.id.includes(partialId));
  }
  
  $: bSpecialChar = getBanner('special');
  $: bStandardChar = getBanner('standard');
  $: bNewPlayer = getBanner('new-player');
  $: bSpecialWeap = getBanner('weap-special');
  $: bStandardWeap = getBanner('weap-standard');
</script>

<SettingsModal
  isOpen={isSettingsOpen}
  onClose={() => (isSettingsOpen = false)}
/>

<div class="max-w-[1400px]"> 
  
  <div class="flex flex-col md:flex-row mb-8 gap-4 md:items-center">    
    <h2 class="font-sdk text-5xl tracking-wide text-[#21272C] dark:text-[#FDFDFD] mb-2 md:mb-0">
      {$t("page.title")}
    </h2>

    <div class="w-full md:w-auto ">
      <Button variant="yellow" onClick={openImport}>
        <div slot="icon">
          <Icon name="import" style="width: 30px; height: 30px;" />
        </div>
        <span class="whitespace-nowrap px-2">
            {$t("page.importBtn")}
        </span>
      </Button>
    </div>

    <div class="w-full md:w-auto">
      <Button variant="black2" onClick={openGlobal}>
        <div slot="icon">
          <Icon name="globe" style="width: 30px; height: 30px;" />
        </div>
        <span class="whitespace-nowrap px-2">
            {$t("page.globalBtn")}
        </span>
      </Button>
    </div>

    <div class="w-full md:w-auto">
      <Button variant="black2" onClick={() => (isSettingsOpen = true)}>
        <div slot="icon">
          <Icon name="settings" style="width: 30px; height: 30px;" />
        </div>
        <span class="whitespace-nowrap px-2">
            {$t("page.settingsBtn")}
        </span>
      </Button>
    </div>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-[400px_400px] xl:grid-cols-[400px_400px_400px] gap-6 items-start">
    
    <div class="flex flex-col gap-6 w-full">
      {#if bSpecialChar}
        <BannerCard bannerId={bSpecialChar.id} titleKey={bSpecialChar.i18nKey} />
      {/if}
      
      {#if bSpecialWeap}
        <BannerCard bannerId={bSpecialWeap.id} titleKey={bSpecialWeap.i18nKey} />
      {/if}
    </div>

    <div class="flex flex-col gap-6 w-full">
      {#if bStandardChar}
        <BannerCard bannerId={bStandardChar.id} titleKey={bStandardChar.i18nKey} />
      {/if}
      
      {#if bStandardWeap}
        <BannerCard bannerId={bStandardWeap.id} titleKey={bStandardWeap.i18nKey} />
      {/if}
    </div>

    <div class="flex flex-col gap-6 w-full">
      {#if bNewPlayer}
        <BannerCard bannerId={bNewPlayer.id} titleKey={bNewPlayer.i18nKey} />
      {/if}

      <RatingCard/>

      <div class="bg-white dark:bg-[#383838] dark:border-[#444444] rounded-xl p-6 shadow-sm border border-gray-100 min-w-[320px]">
        <h3 class="text-xl font-bold mb-4 font-sdk text-[#21272C] dark:text-[#FDFDFD]">
          {$t("page.totalCost")}
        </h3>
        <div class="text-3xl font-black text-[#21272C] dark:text-[#FDFDFD] flex items-center gap-2 font-nums">
          <Images id="oroberyl" variant="currency" size={32} />
          {(billablePulls * 500).toLocaleString("ru-RU")}
        </div>
        <div class="text-xs text-gray-400 dark:text-[#B7B6B3] mt-2 font-medium flex items-center">
          ≈ <Images id="origeometry" variant="currency" size={20} /> {((charPullsOnly * 500) / 75).toFixed(0)}  {$t("page.banner.origeometry")}
        </div>
      </div>
    </div>
  </div>
</div>