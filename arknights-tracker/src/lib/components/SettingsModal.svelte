<script>
  import { t } from "$lib/i18n";
  import { pullData } from "$lib/stores/pulls";
  import * as XLSX from "xlsx";

  export let isOpen = false;
  export let onClose;

  let fileInputExcel;

  // ==================== EXCEL ====================

  function exportExcel() {
    let dataToExport;
    const unsubscribe = pullData.subscribe((value) => {
      dataToExport = value;
    });
    unsubscribe();

    const allPulls = [];

    for (const [bannerKey, bannerData] of Object.entries(dataToExport)) {
      const pulls = bannerData.pulls || [];

      pulls.forEach((pull, index) => {
        allPulls.push({
          Banner: bannerKey,
          Name: pull.name || pull.id || "Unknown",
          Time: pull.time || new Date(pull.timestamp).toLocaleString("ru-RU") || "",
          Rarity: pull.rarity || 3,
          Pity: pull.pity || index + 1,
          Roll: index + 1,
        });
      });
    }

    const summaryData = [];
    for (const [bannerKey, bannerData] of Object.entries(dataToExport)) {
      summaryData.push({
        Banner: bannerKey,
        Total: bannerData.total || 0,
        "Legendary (6★)": bannerData.legendary || 0,
        "Rare (5★)": bannerData.rare || 0,
      });
    }

    const workbook = XLSX.utils.book_new();

    if (allPulls.length > 0) {
      const worksheet1 = XLSX.utils.json_to_sheet(allPulls);
      worksheet1["!cols"] = [
        { wch: 30 }, { wch: 20 }, { wch: 20 },
        { wch: 10 }, { wch: 10 }, { wch: 10 },
      ];
      XLSX.utils.book_append_sheet(workbook, worksheet1, "All Pulls");
    }

    if (summaryData.length > 0) {
      const worksheet2 = XLSX.utils.json_to_sheet(summaryData);
      worksheet2["!cols"] = [
        { wch: 30 }, { wch: 12 }, { wch: 15 }, { wch: 15 },
      ];
      XLSX.utils.book_append_sheet(workbook, worksheet2, "Summary");
    }

    XLSX.writeFile(workbook, "arknights_tracker_export.xlsx");
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
        const workbook = XLSX.read(e.target.result, { type: "array" });
        let importedData = {};

        if (workbook.SheetNames.includes("All Pulls")) {
          const pullsSheet = workbook.Sheets["All Pulls"];
          const pullRows = XLSX.utils.sheet_to_json(pullsSheet);

          pullRows.forEach((row) => {
            const bannerKey = row["Banner"];

            if (!importedData[bannerKey]) {
              importedData[bannerKey] = {
                total: 0, legendary: 0, rare: 0, pulls: [],
              };
            }

            const rarity = parseInt(row["Rarity"]) || 3;
            importedData[bannerKey].pulls.push({
              name: row["Name"] || "",
              id: row["Name"]?.toLowerCase().replace(/\s+/g, "_") || "",
              time: row["Time"] || new Date().toLocaleString("ru-RU"),
              rarity: rarity,
              pity: parseInt(row["Pity"]) || 0,
            });

            importedData[bannerKey].total += 1;
            if (rarity === 6) importedData[bannerKey].legendary += 1;
            if (rarity === 5) importedData[bannerKey].rare += 1;
          });
        }

        if (Object.keys(importedData).length > 0) {
          // ВАЖНО: Если мы используем новый стор, возможно понадобится .set() или smartImport
          // Но пока оставим как было в оригинале, предполагая, что у pullData есть метод set
          pullData.set(importedData);
          alert(`✓ Данные Excel успешно загружены!`);
          onClose();
        } else {
          alert("✗ Файл пуст или некорректный формат");
        }
      } catch (error) {
        console.error(error);
        alert("✗ Ошибка при чтении файла Excel");
      }
    };

    reader.readAsArrayBuffer(file);
    event.target.value = "";
  }

  function handleKeydown(event) {
    if (event.key === "Escape") onClose();
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <div
    class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm transition-opacity"
    on:click={onClose}
  >
    <div
      class="bg-white rounded-2xl p-8 w-[500px] shadow-2xl transform transition-all scale-100 cursor-default"
      on:click|stopPropagation
    >
      <h2 class="text-2xl font-bold mb-6 text-[#21272C] font-sdk">
        {$t("page.recordsSettings.settings")}
      </h2>

      <div class="space-y-6">
        <div>
          <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 font-sdk">
            Excel
          </h3>
          <div class="grid grid-cols-2 gap-3">
            <button
              on:click={exportExcel}
              class="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:border-[#1D6F42] hover:bg-green-50 transition group bg-white h-24"
            >
              <div class="mb-2 text-gray-400 group-hover:text-[#1D6F42] transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15L21 21L12 21L3 21L3 15" />
                  <path d="M12 15L12 3M12 3L7 8M12 3L17 8" />
                </svg>
              </div>
              <div class="font-bold text-[#21272C] text-sm">
                {$t("page.recordsSettings.exportXLSX")}
              </div>
            </button>

            <button
              on:click={triggerImportExcel}
              class="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:border-[#1D6F42] hover:bg-green-50 transition group bg-white h-24"
            >
              <div class="mb-2 text-gray-400 group-hover:text-[#1D6F42] transition-colors">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15L21 21L12 21L3 21L3 15" />
                  <path d="M12 3L12 15M12 15L17 10M12 15L7 10" />
                </svg>
              </div>
              <div class="font-bold text-[#21272C] text-sm">
                {$t("page.recordsSettings.importXLSX")}
              </div>
            </button>
          </div>
        </div>
      </div>

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