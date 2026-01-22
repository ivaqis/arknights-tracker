<script>
    import { t } from "$lib/i18n";
    import { goto } from "$app/navigation";
    import { pullData } from "$lib/stores/pulls";
    import { parseGachaLog } from "$lib/utils/importUtils"; // Removed fetchAllEndfieldData
    import { proxyImport } from "$lib/api"; // Import our new API
    import Button from "$lib/components/Button.svelte";

    // States
    let urlInput = ""; 
    let isLoading = false;
    let previewReport = null; 
    let pendingData = null; 
    let errorMsg = "";
    
    // Toggle for global stats
    let isGlobalStatsEnabled = true; 

    // 1. FETCH DATA VIA PROXY
    async function handleUrlImport() {
        if (!urlInput) return;

        isLoading = true;
        previewReport = null;
        pendingData = null;
        errorMsg = "";

        try {
            // Call backend proxy instead of direct fetch
            // Note: Currently fetches one page/response. 
            // Loop logic should ideally be on backend or wrapped here.
            const response = await proxyImport(urlInput, isGlobalStatsEnabled);
            
            if (response.code === 0 && response.data?.list) {
                const rawData = response.data.list;
                
                // Parse raw JSON to your app's internal format
                const cleanPulls = parseGachaLog(rawData);
                pendingData = cleanPulls;

                // DRY RUN to show what will be added (calculate diff)
                const report = await pullData.smartImport(cleanPulls, true);
                previewReport = report;
            } else {
                errorMsg = $t("import.noData") || "No pulls found or invalid token.";
            }
        } catch (err) {
            console.error(err);
            errorMsg = "Import error: " + err.message;
        } finally {
            isLoading = false;
        }
    }

    // 2. CONFIRM SAVE
    async function confirmSave() {
        if (!pendingData) return;
        isLoading = true;
        try {
            await pullData.smartImport(pendingData, false);
            goto("/records");
        } catch (err) {
            errorMsg = "Save error: " + err.message;
            isLoading = false;
        }
    }

    function clearData() {
        if (confirm($t("page.clearConfirm") || "Are you sure?")) {
            pullData.clear();
            window.location.reload();
        }
    }
</script>

<div class="max-w-[1600px] justify-start">
    <div class="flex items-center gap-4 mb-8">
        <Button variant="roundSmall" color="white" onClick={() => goto("/records")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 18l-6-6 6-6" />
            </svg>
        </Button>
        <h2 class="font-sdk text-5xl tracking-wide text-[#21272C] flex items-center gap-3">
            {$t("import.title")}
        </h2>
    </div>

    <div class="bg-white p-8 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden min-h-[400px]">
        
        {#if isLoading}
            <div class="absolute inset-0 bg-white/90 z-50 flex flex-col items-center justify-center transition-opacity duration-300">
                <div class="w-12 h-12 border-4 border-gray-200 border-t-[#FFE145] rounded-full animate-spin mb-4"></div>
                <div class="text-gray-600 font-bold animate-pulse">
                    {pendingData && !previewReport ? $t("import.dataAnalysys") : $t("import.fetching")}
                </div>
            </div>
        {/if}

        <div class="mb-6">
            <label for="url-input" class="block text-sm font-bold text-gray-700 mb-2">
                {$t("import.urlLabel") || "Paste your log URL here:"}
            </label>
            <input
                id="url-input"
                type="text"
                bind:value={urlInput}
                placeholder="https://ef-webview.gryphline.com/..."
                class="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-lg focus:border-[#FFE145] outline-none transition-all font-mono text-xs"
            />
        </div>

        <div class="mb-6 flex items-center gap-2">
            <input type="checkbox" id="global-stats" bind:checked={isGlobalStatsEnabled} class="w-4 h-4 text-[#FFE145] rounded border-gray-300 focus:ring-[#FFE145]">
            <label for="global-stats" class="text-sm text-gray-600 cursor-pointer select-none">
                {$t("import.enableGlobalStats") || "Upload anonymously to global statistics"}
            </label>
        </div>

        <div class="flex items-center gap-4 mb-6">
            <div class="w-64">
                <Button variant="yellow" onClick={handleUrlImport} disabled={!urlInput || isLoading}>
                    <div slot="icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                    </div>
                    {$t("import.fetchBtn") || "Fetch Data"}
                </Button>
            </div>

            <div class="w-16">
                <Button variant="black" onClick={clearData}>
                    <div slot="icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </div>
                </Button>
            </div>
        </div>

        <div class="mt-8 transition-all duration-500">
            {#if previewReport}
                <div class="animate-in fade-in slide-in-from-top-4 duration-500">
                    {#if previewReport.status === "up_to_date"}
                        <div class="p-4 rounded-lg bg-green-50 border border-green-200">
                            <div class="flex items-center gap-3 text-green-700 font-bold text-lg">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                                {$t("import.statusUpToDate") || "Records are up to date"}
                            </div>
                        </div>
                    {:else if previewReport.status === "updated"}
                        <div class="p-5 rounded-lg bg-gray-50 border border-gray-200">
                            <h3 class="font-bold text-lg text-[#21272C] mb-4 flex items-center gap-2">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                    <line x1="12" y1="18" x2="12" y2="12"></line>
                                    <line x1="9" y1="15" x2="15" y2="15"></line>
                                </svg>
                                {$t("import.newFound") || "New records found"}
                                <span class="text-[#D0926E] ml-1">+{previewReport.totalAdded}</span>
                            </h3>

                            <div class="space-y-2 mb-6 ml-1">
                                {#each Object.entries(previewReport.addedCount) as [bannerId, count]}
                                    <div class="flex justify-between items-center bg-white p-3 rounded border border-gray-100 shadow-sm max-w-md">
                                        <span class="text-gray-700 font-medium">{$t(`banners.${bannerId}`) || bannerId}</span>
                                        <span class="bg-[#FFE145] text-[#21272C] text-xs font-bold px-2 py-1 rounded-md">+{count}</span>
                                    </div>
                                {/each}
                            </div>

                            <div class="w-48 animate-bounce-subtle">
                                <Button variant="black2" onClick={confirmSave}>
                                    <div slot="icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                            <polyline points="17 21 17 13 7 13 7 21"></polyline>
                                            <polyline points="7 3 7 8 15 8"></polyline>
                                        </svg>
                                    </div>
                                    {$t("buttons.saveBtn") || "Save"}
                                </Button>
                            </div>
                        </div>
                    {/if}
                </div>
            {/if}

            {#if errorMsg}
                <div class="mt-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 animate-in shake">
                    <div class="font-bold flex items-center gap-2">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        Error
                    </div>
                    <div class="text-sm mt-1">{errorMsg}</div>
                </div>
            {/if}
        </div>
    </div>
</div>