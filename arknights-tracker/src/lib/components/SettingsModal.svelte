<!-- src/lib/components/SettingsModal.svelte -->
<script>
  import { t } from "$lib/i18n";
  import { pullData } from '$lib/stores/pulls';
  import * as XLSX from 'xlsx';
  
  export let isOpen = false;
  export let onClose;

  let fileInputJson;
  let fileInputExcel;

  // ==================== JSON ====================
  
  function exportJson() {
    let dataToExport;
    const unsubscribe = pullData.subscribe(value => { dataToExport = value; });
    unsubscribe();

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "arknights_tracker_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  function triggerImportJson() {
    fileInputJson.click();
  }

  function handleFileChangeJson(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        if (json && typeof json === 'object') {
          pullData.set(json);
          alert('✓ Данные JSON успешно загружены!');
          onClose();
        } else {
          alert('✗ Ошибка: Неверный формат файла');
        }
      } catch (error) {
        console.error(error);
        alert('✗ Ошибка при чтении файла JSON');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  // ==================== EXCEL ====================

  function exportExcel() {
    let dataToExport;
    const unsubscribe = pullData.subscribe(value => { dataToExport = value; });
    unsubscribe();

    // Преобразуем все крутки из всех баннеров в единую плоскую таблицу
    const allPulls = [];
    
    for (const [bannerKey, bannerData] of Object.entries(dataToExport)) {
      const bannerId = bannerKey; // "wish-counter-character-event" и т.д.
      const pulls = bannerData.pulls || [];
      
      pulls.forEach((pull, index) => {
        allPulls.push({
          'Banner': bannerKey, // Название баннера (wish-counter-character-event)
          'Name': pull.name || pull.id || 'Unknown', // Имя персонажа/оружия
          'Time': pull.time || new Date(pull.timestamp).toLocaleString('ru-RU') || '',
          'Rarity': pull.rarity || 3,
          'Pity': pull.pity || (index + 1), // Гарант на котором выпал
          'Roll': index + 1 // Номер крутки внутри баннера
        });
      });
    }

    // Сводная таблица по баннерам
    const summaryData = [];
    for (const [bannerKey, bannerData] of Object.entries(dataToExport)) {
      summaryData.push({
        'Banner': bannerKey,
        'Total': bannerData.total || 0,
        'Legendary (6★)': bannerData.legendary || 0,
        'Rare (5★)': bannerData.rare || 0
      });
    }

    // Создаем книгу с двумя листами
    const workbook = XLSX.utils.book_new();
    
    if (allPulls.length > 0) {
      const worksheet1 = XLSX.utils.json_to_sheet(allPulls);
      // Устанавливаем ширину колонок для читаемости
      worksheet1['!cols'] = [
        { wch: 30 }, // Banner
        { wch: 20 }, // Name
        { wch: 20 }, // Time
        { wch: 10 }, // Rarity
        { wch: 10 }, // Pity
        { wch: 10 }  // Roll
      ];
      XLSX.utils.book_append_sheet(workbook, worksheet1, 'All Pulls');
    }

    if (summaryData.length > 0) {
      const worksheet2 = XLSX.utils.json_to_sheet(summaryData);
      worksheet2['!cols'] = [
        { wch: 30 },
        { wch: 12 },
        { wch: 15 },
        { wch: 15 }
      ];
      XLSX.utils.book_append_sheet(workbook, worksheet2, 'Summary');
    }

    XLSX.writeFile(workbook, 'arknights_tracker_export.xlsx');
  }

  function triggerImportExcel() {
    fileInputExcel.click();
  }

  function handleFileChangeExcel(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: 'array' });
        let importedData = {};

        // Читаем лист "All Pulls"
        if (workbook.SheetNames.includes('All Pulls')) {
          const pullsSheet = workbook.Sheets['All Pulls'];
          const pullRows = XLSX.utils.sheet_to_json(pullsSheet);
          
          // Группируем по баннерам
          pullRows.forEach(row => {
            const bannerKey = row['Banner'];
            
            if (!importedData[bannerKey]) {
              importedData[bannerKey] = {
                total: 0,
                legendary: 0,
                rare: 0,
                pulls: []
              };
            }
            
            const rarity = parseInt(row['Rarity']) || 3;
            importedData[bannerKey].pulls.push({
              name: row['Name'] || '',
              id: row['Name']?.toLowerCase().replace(/\s+/g, '_') || '',
              time: row['Time'] || new Date().toLocaleString('ru-RU'),
              rarity: rarity,
              pity: parseInt(row['Pity']) || 0
            });
            
            importedData[bannerKey].total += 1;
            if (rarity === 6) importedData[bannerKey].legendary += 1;
            if (rarity === 5) importedData[bannerKey].rare += 1;
          });
        }

        if (Object.keys(importedData).length > 0) {
          pullData.set(importedData);
          alert(`✓ Данные Excel успешно загружены!\nВсего крутки: ${Object.values(importedData).reduce((sum, b) => sum + b.total, 0)}`);
          onClose();
        } else {
          alert('✗ Файл пуст или некорректный формат');
        }
      } catch (error) {
        console.error(error);
        alert('✗ Ошибка при чтении файла Excel');
      }
    };

    reader.readAsArrayBuffer(file);
    event.target.value = '';
  }

  function handleKeydown(event) {
    if (event.key === 'Escape') onClose();
  }
</script>

<svelte:window on:keydown={handleKeydown}/>

{#if isOpen}
  <div 
    class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm transition-opacity cursor-pointer outline-none"
    on:click={onClose}
    on:keydown={(e) => e.key === 'Enter' && onClose()}
    role="button"
    tabindex="0"
  >
    <div 
      class="bg-white rounded-2xl p-8 w-[500px] shadow-2xl transform transition-all scale-100 cursor-default"
      on:click|stopPropagation
      on:keydown|stopPropagation
      role="dialog"
      aria-modal="true"
      tabindex="-1"
    >
      <h2 class="text-2xl font-bold mb-6 text-[#21272C] font-sdk">{$t("page.recordsSettings.settings")}</h2>
      
      <div class="space-y-6">
        
        <!-- Секция EXCEL -->
        <div>
            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 font-sdk">Excel</h3>
            <div class="grid grid-cols-2 gap-3">
                <button 
                    on:click={exportExcel}
                    class="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:border-[#1D6F42] hover:bg-green-50 transition group bg-white h-24"
                >
                    <div class="mb-2 text-gray-400 group-hover:text-[#1D6F42] transition-colors">
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M21 15L21 21L12 21L3 21L3 15" stroke="#21272C" stroke-width="2"/>
<path d="M12 15L12 3M12 3L7 8M12 3L17 8" stroke="#21272C" stroke-width="2"/>
</svg>
                    </div>
                    <div class="font-bold text-[#21272C] text-sm">{$t("page.recordsSettings.exportXLSX")}</div>
                </button>

                <button 
                    on:click={triggerImportExcel}
                    class="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:border-[#1D6F42] hover:bg-green-50 transition group bg-white h-24"
                >
                    <div class="mb-2 text-gray-400 group-hover:text-[#1D6F42] transition-colors">
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M21 15L21 21L12 21L3 21L3 15" stroke="#21272C" stroke-width="2"/>
<path d="M12 3L12 15M12 15L17 10M12 15L7 10" stroke="#21272C" stroke-width="2"/>
</svg>
                    </div>
                    <div class="font-bold text-[#21272C] text-sm">{$t("page.recordsSettings.importXLSX")}</div>
                </button>
            </div>
        </div>

        <!-- Секция JSON -->
        <div>
            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 font-sdk">Backup (JSON)</h3>
            <div class="grid grid-cols-2 gap-3">
                <button 
                    on:click={exportJson}
                    class="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:border-[#FFE145] hover:bg-yellow-50 transition group bg-white h-24"
                >
                    <div class="mb-2 text-gray-400 group-hover:text-yellow-600 transition-colors">
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M21 15L21 21L12 21L3 21L3 15" stroke="#21272C" stroke-width="2"/>
<path d="M12 15L12 3M12 3L7 8M12 3L17 8" stroke="#21272C" stroke-width="2"/>
</svg>
                    </div>
                    <div class="font-bold text-[#21272C] text-sm">{$t("page.recordsSettings.exportJSON")}</div>
                </button>

                <button 
                    on:click={triggerImportJson}
                    class="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:border-[#FFE145] hover:bg-yellow-50 transition group bg-white h-24"
                >
                    <div class="mb-2 text-gray-400 group-hover:text-yellow-600 transition-colors">
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M21 15L21 21L12 21L3 21L3 15" stroke="#21272C" stroke-width="2"/>
<path d="M12 3L12 15M12 15L17 10M12 15L7 10" stroke="#21272C" stroke-width="2"/>
</svg>
                    </div>
                    <div class="font-bold text-[#21272C] text-sm">{$t("page.recordsSettings.importJSON")}</div>
                </button>
            </div>
        </div>
      </div>
      
      <input 
        type="file" 
        accept=".json" 
        class="hidden" 
        bind:this={fileInputJson} 
        on:change={handleFileChangeJson}
      />
      <input 
        type="file" 
        accept=".xlsx,.xls" 
        class="hidden" 
        bind:this={fileInputExcel} 
        on:change={handleFileChangeExcel}
      />

      <div class="mt-8 flex justify-end">
        <button 
          on:click={onClose}
          class="px-5 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition font-medium"
        >
          {$t("page.recordsSettings.close")}
        </button>
      </div>
    </div>
  </div>
{/if}
