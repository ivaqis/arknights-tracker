<script>
  import { t } from "$lib/i18n";
  import { pullData } from "$lib/stores/pulls";
  import { banners } from "$lib/data/banners";
  import { addNotification } from "$lib/stores";
  import { onDestroy } from "svelte";
  import { currentLocale } from "$lib/stores/locale";
  import Images from "$lib/components/Images.svelte";

  import * as XLSX from "xlsx";
  import Icon from "$lib/components/Icons.svelte";
  import Button from "$lib/components/Button.svelte";
  import Checkbox from "$lib/components/Checkbox.svelte";
  import { getWeaponCategory } from "$lib/utils/importUtils";
  import {
    recordsExcludedBannerTypes,
    recordsExcludedBanners,
    recordsShowMonthlyChart,
    recordsShowRating,
    recordsShowTotalCost,
    recordsMaxCols,
    recordsEnableDragDrop,
    recordsCardsOrder
  } from "$lib/stores/filterStore";

  export let isOpen = false;
  export let onClose;

  $: if (typeof document !== 'undefined') {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
  }

  onDestroy(() => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
  });

  let fileInputExcel;

  function getDate(d) {
      if (!d) return 0;
      return new Date(d).getTime();
  }

  function exportExcel() {
    let dataToExport;
    const unsubscribe = pullData.subscribe((value) => {
      dataToExport = value;
    });
    unsubscribe();

    const workbook = XLSX.utils.book_new();
    const usedBannersMap = new Map();

    const categories = {
        "special": [],
        "standard": [],
        "weapon": [],
        "new_player": [],
        "joint": [],
        "other": []
    };

    for (const [storeKey, bannerData] of Object.entries(dataToExport)) {
        if (!bannerData.pulls || bannerData.pulls.length === 0) continue;

        let cat = 'other';
        const keyLower = storeKey.toLowerCase();
        
        if (keyLower.includes('new') || keyLower.includes('beginner')) cat = 'new_player';
        else if (keyLower.includes('weap') || keyLower.includes('wepon') || keyLower.includes('constant')) cat = 'weapon';
        else if (keyLower.includes('joint')) cat = 'joint';
        else if (keyLower === 'standard' || keyLower.includes('standard')) cat = 'standard';
        else if (keyLower.includes('special') || keyLower.includes('event')) cat = 'special';
        const pulls = [...bannerData.pulls].sort((a, b) => new Date(a.time) - new Date(b.time));
        const bannerCounters = {}; 

        pulls.forEach((pull, index) => {
            const pullTime = new Date(pull.time).getTime();
            let foundBanner = banners.find(b => b.id === pull.rawPoolId);
            if (!foundBanner) {
                let searchType = null;
                if (cat === 'special') searchType = 'special';
                if (cat === 'weapon') searchType = 'weapon';
                if (cat === 'new_player') searchType = 'new-player';
                if (cat === 'standard') searchType = 'standard';
                if (searchType) {
                    foundBanner = banners.find(b => {
                        const bType = (b.type || "").toLowerCase();
                        const isMatch = (searchType === 'weapon') 
                            ? (bType === 'weapon' || (b.id && (b.id.includes('weap') || b.id.includes('constant'))))
                            : (bType === searchType || (searchType === 'standard' && (bType === 'constant' || bType === 'standard')));
                        
                        if (!isMatch) return false;

                        const start = getDate(b.startTime);
                        const end = b.endTime ? getDate(b.endTime) : 4102444800000;
                        return pullTime >= (start - 7200000) && pullTime <= (end + 7200000);
                    });
                }
            }

            let bannerNameDisplay = storeKey; 
            let trackingId = storeKey; 
            if (foundBanner) {
                bannerNameDisplay = foundBanner.name || foundBanner.id;
                trackingId = foundBanner.id;

                if (!usedBannersMap.has(foundBanner.id)) {
                    usedBannersMap.set(foundBanner.id, foundBanner);
                }
            } else {
                const genericId = storeKey;
                if (!usedBannersMap.has(genericId)) {
                    usedBannersMap.set(genericId, { id: genericId, name: genericId, startTime: null, endTime: null });
                }
            }

            if (!bannerCounters[trackingId]) {
                bannerCounters[trackingId] = 0;
            }
            bannerCounters[trackingId]++;

            const row = {
                "Time": pull.time ? new Date(pull.time).toLocaleString("ru-RU") : "",
                "Banner": bannerNameDisplay,
                "Name": pull.name,
                "Rarity": pull.rarity,
                "Pity": pull.pity,
                "Roll": bannerCounters[trackingId]
            };
            categories[cat].push(row);
        });
    }

    const catNames = {
        "special": "Special",
        "standard": "Standard",
        "weapon": "Weapon",
        "new_player": "New Player",
        "joint": "Joint",
        "other": "Other"
    };

    Object.entries(categories).forEach(([key, rows]) => {
        if (rows.length === 0) return;
        const ws = XLSX.utils.json_to_sheet(rows);
        ws["!cols"] = [
            { wch: 18 }, 
            { wch: 22 }, 
            { wch: 13 }, 
            { wch: 6 },  
            { wch: 4 },  
            { wch: 6 }
        ];
        XLSX.utils.book_append_sheet(workbook, ws, catNames[key]);
    });

    const bannersArray = Array.from(usedBannersMap.values())
        .filter(b => {
            if (b.name === b.id && ['special', 'weapon', 'new-player', 'standard'].includes(b.id)) return false; 
            return true;
        })
        .map(b => ({
            "Banner Name": b.name,
            "ID": b.id,
            "Start Time": b.startTime ? new Date(b.startTime).toLocaleString("ru-RU") : "-",
            "End Time": b.endTime ? new Date(b.endTime).toLocaleString("ru-RU") : "-"
    }));
    
    bannersArray.sort((a, b) => {
        if (a["Start Time"] === "-") return 1;
        if (b["Start Time"] === "-") return -1;
        return 0; 
    });

    if (bannersArray.length > 0) {
        const wsBanners = XLSX.utils.json_to_sheet(bannersArray);
        wsBanners["!cols"] = [{ wch: 45 }, { wch: 25 }, { wch: 22 }, { wch: 22 }];
        XLSX.utils.book_append_sheet(workbook, wsBanners, "Banners List");
    }

    const infoData = [
        { "Property": "Site", "Value": "Goyfield.moe" },
        { "Property": "Export Date", "Value": new Date().toLocaleString("ru-RU") },
        { "Property": "Version", "Value": "1.3" },
    ];
    const wsInfo = XLSX.utils.json_to_sheet(infoData);
    wsInfo["!cols"] = [{ wch: 20 }, { wch: 50 }];
    XLSX.utils.book_append_sheet(workbook, wsInfo, "Info");

    XLSX.writeFile(workbook, `Goyfield_Export_${new Date().toISOString().slice(0,10)}.xlsx`);
  }

  function handleKeydown(event) {
    if (event.key === "Escape") onClose();
  }

  function generateId() {
    return 'import_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  function parseLocaleDateStr(dateStr) {
    if (!dateStr) return new Date();
    if (dateStr instanceof Date) return dateStr;
    if (!isNaN(dateStr) && String(dateStr).length > 5) return new Date(Number(dateStr));

    try {
      const cleanStr = String(dateStr).replace(',', '').trim();
      const [datePart, timePart] = cleanStr.split(' ');
      
      const [day, month, year] = datePart.split('.').map(Number);
      const [hours, minutes, seconds] = timePart.split(':').map(Number);
      
      return new Date(year, month - 1, day, hours, minutes, seconds);
    } catch (e) {
      const fallback = new Date(dateStr);
      return isNaN(fallback.getTime()) ? new Date() : fallback;
    }
  }

  function importExcel(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      
      const bannerNameToIdMap = new Map();
      if (workbook.SheetNames.includes("Banners List")) {
        const bannersSheet = workbook.Sheets["Banners List"];
        const bannersRows = XLSX.utils.sheet_to_json(bannersSheet);
        bannersRows.forEach(row => {
          if (row["Banner Name"] && row["ID"]) {
            bannerNameToIdMap.set(row["Banner Name"], row["ID"]);
          }
        });
      }

      const allPullsToImport = [];
      let msOffset = 0;

      const sheetMapping = {
        "Special": "special",
        "Standard": "standard",
        "Weapon": "constant", 
        "New Player": "new-player",
        "Joint": "joint",
        "Other": "standard"
      };

      workbook.SheetNames.forEach(sheetName => {
        const defaultBannerId = sheetMapping[sheetName];
        if (!defaultBannerId) return;

        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet);
        
        rows.forEach(row => {
          if (!row["Name"]) return;

          const bannerName = row["Banner"];
          const realId = bannerNameToIdMap.get(bannerName);
          
          let storeBannerId = defaultBannerId;
          if (defaultBannerId === 'constant' && realId) {
            storeBannerId = realId;
          }

          const baseDate = parseLocaleDateStr(row["Time"]);
          const uniqueTime = new Date(baseDate.getTime() + msOffset);
          msOffset++;

          allPullsToImport.push({
            id: generateId(),
            time: uniqueTime, 
            name: row["Name"],
            rarity: Number(row["Rarity"]),
            pity: Number(row["Pity"]) || 1,
            bannerId: storeBannerId,     
            rawPoolId: realId || defaultBannerId     
          });
        });
      });

      if (allPullsToImport.length > 0) {
        try {
          const accountsData = JSON.parse(localStorage.getItem('ark_tracker_accounts') || '{}');
          const currentAccount = Object.values(accountsData).find(a => a.selected);
          const serverId = currentAccount?.serverId || '3';

          const report = await pullData.smartImport(allPullsToImport, serverId, true);

          if (report.totalAdded > 0) {
            addNotification('success', $t('page.recordsSettings.importSuccess', { n: report.totalAdded }));
            setTimeout(() => {
              onClose();
            }, 2500);
          } else {
            addNotification('warning', $t('page.recordsSettings.importDuplicate'));
          }
        } catch (error) {
          console.error(error);
          addNotification('error', $t('page.recordsSettings.importError'));
        }
      } else {
        addNotification('error', $t('page.recordsSettings.importNoData'));
      }
    };
    reader.readAsArrayBuffer(file);
  }
  function triggerFileInput() {
    fileInputExcel.click();
  }

  let isBannerTypesDropdownOpen = false;
  let isBannersDropdownOpen = false;

  function clickOutside(node, params) {
    let callback = params.callback;
    let ignoreSel = params.ignoreSel;

    const handleClick = event => {
      if (ignoreSel && event.target.closest(ignoreSel)) {
        return;
      }
      if (node && !node.contains(event.target) && !event.defaultPrevented) {
        callback();
      }
    };
    document.addEventListener('click', handleClick, true);
    return {
      update(newParams) {
        callback = newParams.callback;
        ignoreSel = newParams.ignoreSel;
      },
      destroy() {
        document.removeEventListener('click', handleClick, true);
      }
    };
  }

  const bannerTypeOptions = [
    { value: "special", label: $t("bannerTypes.special") || "Специальный наем" },
    { value: "standard", label: $t("bannerTypes.standard") || "Стандартный наем" },
    { value: "new-player", label: $t("bannerTypes.new-player") || "Наем «Новые горизонты»" },
    { value: "weap-special", label: $t("bannerTypes.weapSpecial") || "Оружейные баннеры" },
    { value: "weap-standard", label: $t("bannerTypes.weapStandard") || "Стандартные оружейные баннеры" },
    { value: "joint", label: $t("bannerTypes.joint") || "Сияние славы" }
  ];

  function toggleBannerTypeExclusion(value, isChecked) {
    if (isChecked) {
      if (!$recordsExcludedBannerTypes.includes(value)) {
        $recordsExcludedBannerTypes = [...$recordsExcludedBannerTypes, value];
      }
    } else {
      $recordsExcludedBannerTypes = $recordsExcludedBannerTypes.filter(x => x !== value);
    }
  }

  $: selectedBannerTypesLabel = $recordsExcludedBannerTypes.length === 0
    ? "Не выбрано"
    : bannerTypeOptions
        .filter(opt => $recordsExcludedBannerTypes.includes(opt.value))
        .map(opt => opt.label)
        .join(", ");

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

  $: weaponBannerOptions = (() => {
    const ids = Object.keys($pullData).filter(key => {
      const cat = getWeaponCategory(key);
      return cat === 'weap-special' || cat === 'weap-standard';
    });
    return ids.map(id => {
      const b = banners.find(x => x.id === id);
      const label = b ? ($t(`banners.${b.id}`) !== `banners.${b.id}` ? $t(`banners.${b.id}`) : b.name) : id;
      const startFormatted = b ? formatBannerDate(b.startTime, $currentLocale) : "";
      const endFormatted = b ? (b.endTime ? formatBannerDate(b.endTime, $currentLocale) : ($t("permanent") || "Permanent")) : "";
      const subLabel = startFormatted && endFormatted ? `${startFormatted} - ${endFormatted}` : "";
      return {
        value: id,
        label,
        subLabel,
        iconId: b?.miniIcon ? b.miniIcon.replace(/\.[^/.]+$/, "") : null
      };
    }).sort((a, b) => a.label.localeCompare(b.label));
  })();

  function toggleBannerExclusion(value, isChecked) {
    if (isChecked) {
      if (!$recordsExcludedBanners.includes(value)) {
        $recordsExcludedBanners = [...$recordsExcludedBanners, value];
      }
    } else {
      $recordsExcludedBanners = $recordsExcludedBanners.filter(x => x !== value);
    }
  }

  $: selectedBannersLabel = $recordsExcludedBanners.length === 0
    ? "Не выбрано"
    : $recordsExcludedBanners
        .map(id => {
          const b = banners.find(x => x.id === id);
          return b ? ($t(`banners.${b.id}`) !== `banners.${b.id}` ? $t(`banners.${b.id}`) : b.name) : id;
        })
        .join(", ");
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <div
    class="md:ml-[var(--sb-w)] fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm transition-opacity overflow-y-auto p-4 md:p-10"
    on:click={onClose}
    on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && onClose()}
    role="button"
    tabindex="0"
  >
    <div
      class="bg-white rounded-2xl p-8 w-[500px] max-w-[95vw] dark:bg-[#383838] dark:border-[#444444] shadow-2xl transform transition-all scale-100 cursor-default flex flex-col my-auto relative overflow-visible"
      on:click|stopPropagation
      on:keydown|stopPropagation
      role="dialog"
      aria-modal="true"
      tabindex="-1"
    >

      <h2 class="text-2xl font-bold dark:text-[#FDFDFD] mb-6 text-[#21272C] font-sdk shrink-0">
        {$t("page.recordsSettings.settings")}
      </h2>

      <div class="space-y-6 flex-1">
        <div>
          <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 font-sdk">
            Excel
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              on:click={exportExcel}
              class="flex flex-col dark:border-[#444444] dark:bg-[#383838] hover:dark:bg-[#373737] items-center justify-center p-4 border border-gray-200 rounded-xl hover:border-[#1D6F42] hover:bg-green-50 transition group bg-white h-24 w-full"
            >
              <div class="mb-2 text-gray-400 group-hover:text-[#1D6F42] dark:text-[#E0E0E0] transition-colors">
                <Icon name="export" class="w-5 h-5" />
              </div>
              <div class="font-bold dark:text-[#E0E0E0] text-[#21272C] text-sm">
                {$t("page.recordsSettings.exportXLSX")}
              </div>
            </button>
            
            <input 
              type="file" 
              accept=".xlsx, .xls" 
              bind:this={fileInputExcel} 
              on:change={importExcel} 
              class="hidden" 
            />
            <button
              on:click={triggerFileInput}
              class="flex flex-col dark:border-[#444444] dark:bg-[#383838] hover:dark:bg-[#373737] items-center justify-center p-4 border border-gray-200 rounded-xl hover:border-[#F9B90C] hover:bg-amber-50/50 transition group bg-white h-24 w-full"
            >
              <div class="mb-2 text-gray-400 group-hover:text-[#F9B90C] dark:text-[#E0E0E0] transition-colors">
                <Icon name="import" class="w-6 h-6" />
              </div>
              <div class="font-bold dark:text-[#E0E0E0] text-[#21272C] text-sm">
                {$t("page.recordsSettings.importXLSX")}
              </div>
            </button>
          </div>
        </div>

        <hr class="border-gray-100 dark:border-[#444]" />

        <div>
          <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 font-sdk">
            {$t("page.recordsSettings.historySettings")}
          </h3>
          <div class="space-y-4">
            
            <!-- Grid Max Columns -->
            <div>
              <div class="flex justify-between items-center mb-1.5">
                <span class="text-sm font-medium text-gray-600 dark:text-[#E0E0E0]">
                  {$t("page.recordsSettings.maxCols")}
                </span>
                <span class="text-sm font-bold text-[#F9B90C] dark:text-[#FFE145] font-nums">
                  {$recordsMaxCols}
                </span>
              </div>
              <input
                type="range"
                min="3"
                max="10"
                step="1"
                bind:value={$recordsMaxCols}
                class="w-full h-2 bg-gray-200 dark:bg-[#444] rounded-lg appearance-none cursor-pointer accent-[#F9B90C] dark:accent-[#FFE145]"
              />
            </div>

            <!-- Banner Type Exclusions -->
            <div class="relative">
              <div class="flex justify-between items-center mb-1.5">
                <span class="text-sm font-medium text-gray-600 dark:text-[#E0E0E0]">
                  {$t("page.recordsSettings.bannerTypeExclusions")}
                </span>
                {#if $recordsExcludedBannerTypes.length > 0}
                  <button
                    type="button"
                    class="text-xs text-[#F9B90C] hover:text-[#e0a60a] dark:text-[#FFE145] dark:hover:text-[#fff] transition font-bold"
                    on:click={() => $recordsExcludedBannerTypes = []}
                  >
                    {$t("sort.reset")}
                  </button>
                {/if}
              </div>
              <div
                on:click|stopPropagation={() => isBannerTypesDropdownOpen = !isBannerTypesDropdownOpen}
                on:keydown|stopPropagation={(e) => (e.key === 'Enter' || e.key === ' ') && (isBannerTypesDropdownOpen = !isBannerTypesDropdownOpen)}
                role="button"
                tabindex="0"
                class="btn-trigger-banner-types w-full min-h-11 py-1.5 px-4 flex items-center justify-between border border-gray-200 dark:border-[#444] bg-white dark:bg-[#383838] dark:text-[#E0E0E0] rounded-xl hover:border-gray-300 transition text-left text-sm focus:outline-none gap-2 flex-wrap cursor-pointer"
              >
                {#if $recordsExcludedBannerTypes.length === 0}
                  <span class="text-gray-400 dark:text-[#888]">{$t("page.recordsSettings.noneSelected")}</span>
                {:else}
                  <div class="flex flex-wrap gap-1.5 max-w-[90%]">
                    {#each $recordsExcludedBannerTypes as val}
                      {@const opt = bannerTypeOptions.find(o => o.value === val)}
                      {#if opt}
                        <span class="inline-flex items-center gap-1 bg-amber-550 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 text-[11px] font-bold px-2 py-0.5 rounded-lg border border-amber-200/50 dark:border-amber-900/30">
                          {opt.label}
                          <button
                            type="button"
                            class="hover:text-amber-600 dark:hover:text-amber-400 p-0.5 rounded-full transition-colors flex items-center justify-center"
                            on:click|stopPropagation={() => toggleBannerTypeExclusion(val, false)}
                          >
                            <Icon name="close" class="w-2.5 h-2.5" />
                          </button>
                        </span>
                      {/if}
                    {/each}
                  </div>
                {/if}
                <Icon name="arrowDown" class="w-3.5 h-3.5 transition-transform duration-200 ml-auto {isBannerTypesDropdownOpen ? 'rotate-180' : ''} shrink-0" />
              </div>

              {#if isBannerTypesDropdownOpen}
                <div
                  use:clickOutside={{ callback: () => isBannerTypesDropdownOpen = false, ignoreSel: '.btn-trigger-banner-types' }}
                  class="absolute left-0 right-0 mt-1 z-50 bg-white dark:bg-[#383838] border border-gray-100 dark:border-[#444] rounded-xl shadow-xl max-h-60 overflow-y-auto p-2 space-y-1 custom-scrollbar w-full"
                >
                  {#each bannerTypeOptions as opt}
                    <div class="px-2 py-1 hover:bg-gray-150 dark:hover:bg-[#444] rounded-lg">
                      <Checkbox
                        variant="yellow"
                        align="center"
                        checked={$recordsExcludedBannerTypes.includes(opt.value)}
                        on:change={(e) => toggleBannerTypeExclusion(opt.value, e.detail)}
                      >
                        <span class="text-sm dark:text-[#E0E0E0]">{opt.label}</span>
                      </Checkbox>
                    </div>
                  {/each}
                </div>
              {/if}
            </div>

            <!-- Weapon Banner Exclusions -->
            <div class="relative">
              <div class="flex justify-between items-center mb-1.5">
                <span class="text-sm font-medium text-gray-600 dark:text-[#E0E0E0]">
                  {$t("page.recordsSettings.bannerExclusions")}
                </span>
                {#if $recordsExcludedBanners.length > 0}
                  <button
                    type="button"
                    class="text-xs text-[#F9B90C] hover:text-[#e0a60a] dark:text-[#FFE145] dark:hover:text-[#fff] transition font-bold"
                    on:click={() => $recordsExcludedBanners = []}
                  >
                    {$t("sort.reset")}
                  </button>
                {/if}
              </div>
              <div
                on:click|stopPropagation={() => isBannersDropdownOpen = !isBannersDropdownOpen}
                on:keydown|stopPropagation={(e) => (e.key === 'Enter' || e.key === ' ') && (isBannersDropdownOpen = !isBannersDropdownOpen)}
                role="button"
                tabindex="0"
                class="btn-trigger-banners w-full min-h-11 py-1.5 px-4 flex items-center justify-between border border-gray-200 dark:border-[#444] bg-white dark:bg-[#383838] dark:text-[#E0E0E0] rounded-xl hover:border-gray-300 transition text-left text-sm focus:outline-none gap-2 flex-wrap cursor-pointer"
              >
                {#if $recordsExcludedBanners.length === 0}
                  <span class="text-gray-400 dark:text-[#888]">{$t("page.recordsSettings.noneSelected")}</span>
                {:else}
                  <div class="flex flex-wrap gap-1.5 max-w-[90%]">
                    {#each $recordsExcludedBanners as val}
                      {@const opt = weaponBannerOptions.find(o => o.value === val)}
                      {#if opt}
                        <span class="inline-flex items-center gap-1 bg-amber-550 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 text-[11px] font-bold px-2 py-0.5 rounded-lg border border-amber-200/50 dark:border-amber-900/30">
                          {opt.label}
                          <button
                            type="button"
                            class="hover:text-amber-600 dark:hover:text-amber-400 p-0.5 rounded-full transition-colors flex items-center justify-center"
                            on:click|stopPropagation={() => toggleBannerExclusion(val, false)}
                          >
                            <Icon name="close" class="w-2.5 h-2.5" />
                          </button>
                        </span>
                      {/if}
                    {/each}
                  </div>
                {/if}
                <Icon name="arrowDown" class="w-3.5 h-3.5 transition-transform duration-200 ml-auto {isBannersDropdownOpen ? 'rotate-180' : ''} shrink-0" />
              </div>

              {#if isBannersDropdownOpen}
                <div
                  use:clickOutside={{ callback: () => isBannersDropdownOpen = false, ignoreSel: '.btn-trigger-banners' }}
                  class="absolute left-0 right-0 mt-1 z-50 bg-white dark:bg-[#383838] border border-gray-100 dark:border-[#444] rounded-xl shadow-xl max-h-60 overflow-y-auto p-2 space-y-1 custom-scrollbar w-full"
                >
                  {#if weaponBannerOptions.length === 0}
                    <div class="px-3 py-2 text-xs text-gray-400 italic">{$t("page.recordsSettings.noWeaponBanners")}</div>
                  {:else}
                    {#each weaponBannerOptions as opt}
                      <div class="px-2 py-1 hover:bg-gray-150 dark:hover:bg-[#444] rounded-lg">
                        <Checkbox
                          variant="yellow"
                          align="center"
                          checked={$recordsExcludedBanners.includes(opt.value)}
                          on:change={(e) => toggleBannerExclusion(opt.value, e.detail)}
                        >
                          <div class="flex items-center gap-3 ml-2 text-left">
                            {#if opt.iconId}
                              <div class="w-10 h-6 rounded-sm overflow-hidden flex-shrink-0 shadow-sm border border-white/10">
                                <Images 
                                  id={opt.iconId} 
                                  variant="banner-mini" 
                                  size="100%" 
                                  className="w-full h-full object-cover"
                                  alt={opt.label}
                                />
                              </div>
                            {/if}
                            <div class="flex flex-col leading-none">
                              <span class="text-sm dark:text-[#E0E0E0] truncate max-w-[280px]">{opt.label}</span>
                              {#if opt.subLabel}
                                <span class="text-[10px] font-mono tracking-tight mt-0.5 opacity-60 text-gray-500 dark:text-gray-300">
                                  {opt.subLabel}
                                </span>
                              {/if}
                            </div>
                          </div>
                        </Checkbox>
                      </div>
                    {/each}
                  {/if}
                </div>
              {/if}
            </div>

            <!-- Section Checkboxes -->
            <div class="space-y-3 pt-2">
              <Checkbox
                variant="yellow"
                align="center"
                bind:checked={$recordsShowMonthlyChart}
              >
                <span class="text-sm font-medium dark:text-[#E0E0E0]">
                  {$t("page.recordsSettings.showMonthlyChart")}
                </span>
              </Checkbox>

              <Checkbox
                variant="yellow"
                align="center"
                bind:checked={$recordsShowRating}
              >
                <span class="text-sm font-medium dark:text-[#E0E0E0]">
                  {$t("page.recordsSettings.showRating")}
                </span>
              </Checkbox>

              <Checkbox
                variant="yellow"
                align="center"
                bind:checked={$recordsShowTotalCost}
              >
                <span class="text-sm font-medium dark:text-[#E0E0E0]">
                  {$t("page.recordsSettings.showTotalCost")}
                </span>
              </Checkbox>

              <hr class="border-gray-100 dark:border-[#444] my-2" />

              <Checkbox
                variant="yellow"
                align="center"
                bind:checked={$recordsEnableDragDrop}
              >
                <span class="text-sm font-medium dark:text-[#E0E0E0]">
                  {$t("page.recordsSettings.dragMode")} (Beta)
                </span>
              </Checkbox>

              {#if $recordsCardsOrder && $recordsCardsOrder.length > 0}
                <div class="pl-8 flex justify-start">
                  <button
                    type="button"
                    class="text-xs text-[#F9B90C] hover:text-[#e0a60a] dark:text-[#FFE145] dark:hover:text-[#fff] transition font-bold"
                    on:click={() => $recordsCardsOrder = []}
                  >
                    {$t("page.recordsSettings.resetLayout")}
                  </button>
                </div>
              {/if}
            </div>

          </div>
        </div>
      </div>

      <div class="mt-8 flex justify-end shrink-0">
        <div class="w-auto">
          <Button variant="round" color="white" onClick={onClose}>
            {$t("page.recordsSettings.close")}
          </Button>
        </div>
      </div>
    </div>
  </div>
{/if}