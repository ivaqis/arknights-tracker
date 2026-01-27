<script>
    import { onMount } from "svelte";
    import { t } from "$lib/i18n";
    import { goto } from "$app/navigation";
    import { pullData } from "$lib/stores/pulls";
    import { parseGachaLog } from "$lib/utils/importUtils";
    import { proxyImport } from "$lib/api";

    // COMPONENTS
    import Button from "$lib/components/Button.svelte";
    import PowershellBlock from "$lib/components/PowershellBlock.svelte";
    import Tooltip from "$lib/components/Tooltip.svelte";
    import Icon from "$lib/components/Icons.svelte";

    let urlInput = "";
    let isLoading = false;
    let previewReport = null;
    let pendingData = null;
    let errorMsg = "";
    let isGlobalStatsEnabled = true;

    // --- НОВЫЕ ПЕРЕМЕННЫЕ ---
    let activeTab = "new"; // 'new' | 'saved'
    let isSaveTokenEnabled = false; // Чекбокс сохранения
    let tokenName = ""; // Имя для сохранения
    let savedTokens = []; // Список из localStorage

    const ALLOWED_DOMAINS = [
        "ef-webview.gryphline.com"
    ];

    let isInputError = false;

    const powerShellScript = `Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex "&{$((New-Object System.Net.WebClient).DownloadString('https://raw.githubusercontent.com/ivaqis/arknights-pull-url/refs/heads/main/endfield-url.ps1'))}"`;

    // ЗАГРУЗКА СОХРАНЕННЫХ ТОКЕНОВ
    onMount(() => {
        loadSavedTokens();
    });

    function loadSavedTokens() {
        try {
            const raw = localStorage.getItem("ark_saved_tokens");
            if (raw) {
                savedTokens = JSON.parse(raw);
            }
        } catch (e) {
            console.error("Failed to load saved tokens", e);
        }
    }

    function saveTokenToStorage(name, url) {
        try {
            // [ИЗМЕНЕНО] Проверка на дубликаты
            // Если такой URL уже есть в списке, просто ничего не делаем (не перезаписываем)
            if (savedTokens.some(t => t.url === url)) {
                return;
            }

            const newToken = {
                name: name,
                url: url,
                date: Date.now()
            };
            const newList = [newToken, ...savedTokens];
            localStorage.setItem("ark_saved_tokens", JSON.stringify(newList));
            savedTokens = newList;
        } catch (e) {
            console.error("Failed to save token", e);
        }
    }

    function deleteToken(index) {
        if (!confirm($t("import.delete_confirm") || "Delete this saved token?")) return;
        
        const newList = [...savedTokens];
        newList.splice(index, 1);
        savedTokens = newList;
        localStorage.setItem("ark_saved_tokens", JSON.stringify(newList));
    }

    function selectToken(token) {
        urlInput = token.url;
        // Переключаемся на вкладку ввода, чтобы пользователь нажал кнопку
        activeTab = "new"; 
        // Сбрасываем галочку сохранения, так как он уже сохранен
        isSaveTokenEnabled = false; 
        errorMsg = "";
    }

    // Хелпер для форматирования даты (можно вынести, но для удобства оставим тут)
    function formatDate(ts) {
        return new Date(ts * 1000).toLocaleDateString();
    }

async function handleUrlImport() {
        errorMsg = "";
        isInputError = false;

        // 1. ВАЛИДАЦИЯ ПУСТОТЫ
        if (!urlInput || !urlInput.trim()) {
            isInputError = true;
            errorMsg = $t("import.emptyError") || "Link is required";
            return;
        }

        // Проверка имени (если включено сохранение)
        if (isSaveTokenEnabled && !tokenName.trim()) {
            const alreadyExists = savedTokens.some(t => t.url === urlInput);
            if (!alreadyExists) {
                isInputError = true;
                errorMsg = "Token name is required for saving.";
                return;
            }
        }

        // 2. ВАЛИДАЦИЯ ДОМЕНА
        try {
            const parsedUrl = new URL(urlInput);
            if (parsedUrl.protocol !== "https:") {
                errorMsg = "Only HTTPS links are allowed.";
                return;
            }
            const isAllowed = ALLOWED_DOMAINS.some(domain => 
                parsedUrl.hostname === domain || parsedUrl.hostname.endsWith("." + domain)
            );
            if (!isAllowed) {
                errorMsg = "Invalid game link. Domain not supported.";
                return;
            }
        } catch (e) {
            isInputError = true;
            errorMsg = "Invalid URL format.";
            return;
        }

        isLoading = true;
        previewReport = null;
        pendingData = null;

        try {
            const response = await proxyImport(urlInput, isGlobalStatsEnabled);
            
            if (response.code === 0 && response.data?.list) {
                
                const importedUid = response.data.uid;
                const currentUid = localStorage.getItem("user_uid");
                /*
                if (currentUid && importedUid && currentUid !== importedUid) {
                    let allTimestamps = [];
                    Object.values($pullData).forEach(pool => {
                        if (pool.pulls && Array.isArray(pool.pulls)) {
                            pool.pulls.forEach(p => allTimestamps.push(p.ts));
                        }
                    });

                    if (allTimestamps.length > 0) {
                        const minTs = Math.min(...allTimestamps);
                        const maxTs = Math.max(...allTimestamps);
                        const msg = $t("error_account_mismatch", {
                            startDate: formatDate(minTs),
                            endDate: formatDate(maxTs)
                        });
                        throw new Error(msg);
                    }
                }*/

                if (isSaveTokenEnabled && tokenName.trim()) {
                    saveTokenToStorage(tokenName.trim(), urlInput);
                }

                if (importedUid) {
                    localStorage.setItem("user_uid", importedUid);
                }

                const rawData = response.data.list;
                const cleanPulls = parseGachaLog(rawData);
                pendingData = cleanPulls;
                
                const report = await pullData.smartImport(cleanPulls, true);
                previewReport = report;

            } else {
                
                if (response.error || response.message || response.msg) {
                    errorMsg = response.error || response.message || response.msg;
                } else {
                    errorMsg = $t("import.noData") || "No pulls found or Link Expired.";
                }
            }

        } catch (err) {
            console.error("Import Error:", err);
            if (err.message && (err.message.includes("No pulls found") || err.message.includes("generate UID"))) {
                 errorMsg = $t("import.errHistoryEmpty") || "No pulls found or Link Expired.";
            } else {
                 errorMsg = err.message || "Unknown Error";
            }
        } finally {
            isLoading = false;
        }
    }

    async function confirmSave() {
        if (!pendingData) return;
        isLoading = true;
        try {
            await pullData.smartImport(pendingData, false);
            goto("/records");
        } catch (err) {
            errorMsg = err.message;
            isLoading = false;
        }
    }

    function handleInput() {
        if (isInputError) {
            isInputError = false;
            errorMsg = "";
        }
    }


</script>

<div class="max-w-[1600px] justify-start">
    <div class="flex items-center gap-4 mb-8">
                <Button
            variant="roundSmall"
            color="white"
            onClick={() => goto("/records")}
        >
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
            >
                <path d="M15 18l-6-6 6-6" />
            </svg>
        </Button>
        <h2 class="font-sdk text-5xl tracking-wide text-[#21272C] flex items-center gap-3">
            {$t("import.title")}
        </h2>
    </div>

    <div class="bg-white p-8 md:p-12 rounded-xl shadow-sm border border-gray-100 relative min-h-[400px]">
        <div class="ml-2">
            <div class="relative border-l-2 border-gray-200 pb-10 pl-10">
                <div class="absolute -left-[21px] top-0 w-10 h-10 rounded-full bg-[#FFE145] border-2 border-[#FFE145] shadow-sm flex items-center justify-center font-sdk font-bold text-xl text-[#21272C] z-10">
                    1
                </div>
                <p class="text-lg text-[#21272C] font-medium pt-1">
                    {$t("import.step1")}
                </p>
            </div>

            <div class="relative border-l-2 border-gray-200 pb-8 pl-10">
                <div class="absolute -left-[21px] top-0 w-10 h-10 rounded-full bg-[#FFE145] border-2 border-[#FFE145] shadow-sm flex items-center justify-center font-sdk font-bold text-xl text-[#21272C] z-10">
                    2
                </div>
                <div class="text-lg text-[#21272C] mb-4 pt-1 font-medium leading-relaxed">
                    {$t("import.step2_pre")}
                    <span class="inline-block">
                        <Tooltip text={$t("import.ps_tooltip")} class="justify-center">
                            <span class="font-bold text-black border-b-2 border-[#FFE145] hover:bg-[#FFE145] transition-colors px-1">
                                {$t("import.step2_ps")}
                            </span>
                        </Tooltip>
                    </span>
                    {$t("import.step2_post")}
                </div>
                <div class="mb-3 max-w-4xl">
                    <PowershellBlock script={powerShellScript} />
                </div>
                <div class="text-right max-w-4xl mt-2">
                    <a href="https://github.com/ivaqis/arknights-pull-url" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-black transition-colors group">
                        <span class="underline decoration-gray-300 group-hover:decoration-black transition-all">
                            {$t("import.script_details")}
                        </span>
                        <div class="text-gray-400 group-hover:text-black transition-colors">
                            <Icon name="sendToLink" style="width: 14px; height: 14px;" />
                        </div>
                    </a>
                </div>
            </div>

            <div class="relative border-l-2 border-transparent pl-10">
                <div class="absolute -left-[21px] top-0 w-10 h-10 rounded-full bg-[#FFE145] border-2 border-[#FFE145] shadow-sm flex items-center justify-center font-sdk font-bold text-xl text-[#21272C] z-10">
                    3
                </div>

                <p class="text-lg text-[#21272C] font-medium mb-4 pt-1">
                    {$t("import.step3")}
                </p>

                <div class="flex items-end gap-0 border-b border-gray-200 w-full max-w-4xl mb-6">
                    <button 
                        class="px-6 py-3 text-sm font-bold transition-all relative border-b-2
                        {activeTab === 'new' 
                            ? 'text-[#21272C] border-[#FFE145]' 
                            : 'text-gray-400 hover:text-gray-600 border-transparent hover:bg-gray-50'}"
                        on:click={() => activeTab = 'new'}
                    >
                        {$t("import.tab_new")}
                    </button>
                    <button 
                        class="px-6 py-3 text-sm font-bold transition-all relative flex items-center gap-2 border-b-2
                        {activeTab === 'saved' 
                            ? 'text-[#21272C] border-[#FFE145]' 
                            : 'text-gray-400 hover:text-gray-600 border-transparent hover:bg-gray-50'}"
                        on:click={() => activeTab = 'saved'}
                    >
                        {$t("import.tab_saved")}
                        {#if savedTokens.length > 0}
                            <span class="bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0.5 rounded-full leading-none">
                                {savedTokens.length}
                            </span>
                        {/if}
                    </button>
                </div>

                {#if activeTab === 'new'}
                    <div class="max-w-4xl mb-2 relative group animate-in fade-in zoom-in-95 duration-200">
                        <div class="relative">
                            <input
                                type="text"
                                bind:value={urlInput}
                                on:input={handleInput}
                                placeholder={$t("import.placeholder")}
                                class="w-full p-4 bg-gray-50 border-2 border-gray-100 focus:bg-white focus:border-[#FFE145] rounded-md outline-none transition-all font-mono text-xs md:text-sm text-gray-700 placeholder-gray-400
                                {isInputError ? '!border-red-500 bg-red-50' : ''}"
                            />
                            <div class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none">
                                <Icon name="link" style="width: 16px; height: 16px;" />
                            </div>
                        </div>

                        {#if isInputError}
                            <div class="absolute -bottom-6 left-0 text-red-600 text-xs font-bold animate-in fade-in slide-in-from-top-1 bg-red-50 px-2 py-1 rounded">
                                {errorMsg}
                            </div>
                        {/if}
                    </div>

                {:else}
                    <div class="max-w-4xl mb-2 animate-in fade-in zoom-in-95 duration-200 min-h-[100px]">
                        {#if savedTokens.length === 0}
                            <div class="flex flex-col items-center justify-center py-6 border-2 border-dashed border-gray-200 rounded-lg text-gray-400">
                                <Icon name="archive" style="width: 32px; height: 32px; opacity: 0.5;" />
                                <span class="mt-2 text-sm font-medium">{$t("import.no_saved_tokens")}</span>
                            </div>
                        {:else}
                            <div class="grid gap-3">
                                {#each savedTokens as token, i}
                                    <div 
                                        class="group relative flex items-center justify-between p-4 bg-white border border-gray-200 hover:border-[#FFE145] hover:shadow-sm transition-all text-left rounded-md overflow-hidden"
                                    >
                                        <button
                                            type="button"
                                            class="absolute inset-0 w-full h-full z-0 cursor-pointer focus:outline-none"
                                            aria-label="Select {token.name}"
                                            on:click={() => selectToken(token)}
                                        ></button>

                                        <div class="pl-2 relative z-10 pointer-events-none">
                                            <div class="flex items-center gap-2">
                                                <div class="font-bold text-[#21272C] text-lg font-sdk">{token.name}</div>
                                            </div>
                                            <div class="text-xs text-gray-400 font-mono mt-1 truncate max-w-[250px] md:max-w-[400px]">
                                                {token.url}
                                            </div>
                                            <div class="text-[10px] text-gray-400 mt-2 font-medium">
                                                {new Date(token.date).toLocaleDateString()}
                                            </div>
                                        </div>

                                        <div class="flex items-center gap-4 z-20 relative pointer-events-none">
                                            <span class="text-xs font-bold text-[#21272C] bg-[#FFE145] px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                                {$t("import.select_token")}
                                            </span>
                                            
                                            <button 
                                                type="button"
                                                class="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-white hover:bg-red-500 rounded transition-colors pointer-events-auto cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500"
                                                title="Delete"
                                                on:click|stopPropagation={() => deleteToken(i)}
                                            >
                                                <Icon name="close" style="width: 18px; height: 18px;" />
                                            </button>
                                        </div>
                                    </div>
                                {/each}
                            </div>
                        {/if}
                    </div>
                {/if}

                <div class="flex flex-col gap-4 mt-2 max-w-4xl items-start">
                    
                    {#if activeTab === 'new'}
                        <div class="flex flex-col gap-2 transition-all w-full">
                            <label class="flex items-start gap-3 select-none group cursor-pointer w-fit">
                                <div class="relative flex items-center mt-0.5">
                                    <input
                                        type="checkbox"
                                        bind:checked={isSaveTokenEnabled}
                                        class="peer w-5 h-5 cursor-pointer appearance-none rounded border-2 border-gray-300 bg-white checked:border-[#FFE145] checked:bg-[#FFE145] transition-all"
                                    />
                                    <svg class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#21272C] opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                </div>
                                <div>
                                    <span class="text-gray-700 group-hover:text-black transition-colors cursor-pointer font-medium text-sm">
                                        {$t("import.save_token_label")}
                                    </span>
                                    
                                    {#if isSaveTokenEnabled}
                                        <div class="text-gray-400 text-xs mt-0.5 animate-in fade-in slide-in-from-top-1">
                                            {$t("import.save_token_desc")}
                                        </div>
                                    {/if}
                                </div>
                            </label>

                            {#if isSaveTokenEnabled}
                                <div class="pl-8 animate-in slide-in-from-top-2 fade-in mb-2">
                                    <input
                                        type="text"
                                        bind:value={tokenName}
                                        placeholder={$t("import.token_name_placeholder")}
                                        class="w-full md:w-2/3 p-2.5 bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#FFE145] rounded-md text-sm outline-none text-[#21272C] transition-all"
                                    />
                                    <div class="text-[10px] text-gray-400 mt-1 ml-1">
                                        {$t("import.token_name_label")} <span class="text-red-400">*</span>
                                    </div>
                                </div>
                            {/if}
                        </div>
                    {/if}

                    <label class="flex items-center gap-3 select-none group cursor-pointer w-fit">
                        <div class="relative flex items-center">
                            <input
                                type="checkbox"
                                bind:checked={isGlobalStatsEnabled}
                                class="peer w-5 h-5 cursor-pointer appearance-none rounded border-2 border-gray-300 bg-white checked:border-[#FFE145] checked:bg-[#FFE145] transition-all"
                            />
                            <svg class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#21272C] opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                        <span class="text-gray-600 group-hover:text-black transition-colors cursor-pointer font-medium text-sm">
                            {$t("import.enableGlobalStats")}
                        </span>
                    </label>

                    <div class="w-fit mt-4">
                        <Button
                            variant="yellow"
                            onClick={handleUrlImport}
                            disabled={isLoading}
                        >
                            <div slot="icon">
                                {#if isLoading}
                                    <div class="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                {:else}
                                    <Icon name="import" style="width: 30px; height: 30px;" />
                                {/if}
                            </div>
                            <span>
                                {isLoading ? "..." : $t("page.importBtn")}
                            </span>
                        </Button>
                    </div>
                </div>

                <div class="mt-8 max-w-4xl transition-all duration-300">
                    {#if errorMsg && !isInputError}
                        <div class="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                            <Icon name="close" style="width: 20px; height: 20px;" />
                            {errorMsg}
                        </div>
                    {/if}

                    {#if previewReport}
                        <div class="p-5 rounded-lg bg-gray-50 border border-gray-200 animate-in fade-in slide-in-from-bottom-2">
                            {#if previewReport.status === "up_to_date"}
                                <div class="flex items-center gap-3 text-green-700 font-bold text-lg">
                                    <Icon name="check" style="width: 24px; height: 24px;" />
                                    {$t("import.statusUpToDate")}
                                </div>
                            {:else if previewReport.status === "updated"}
                                <h3 class="font-bold text-lg text-[#21272C] mb-4 flex items-center gap-2">
                                    <Icon name="import" style="width: 20px; height: 20px;" />
                                    {$t("import.newFound")}
                                    <span class="text-[#D0926E] ml-1">+{previewReport.totalAdded}</span>
                                </h3>
                                <div class="space-y-2 mb-6 ml-1">
                                    {#each Object.entries(previewReport.addedCount) as [bannerId, count]}
                                        <div class="flex justify-between items-center bg-white p-3 rounded border border-gray-100 shadow-sm max-w-md">
                                            <span class="text-gray-700 font-medium">
                                                {$t(`bannerTypes.${bannerId}`) || bannerId}
                                            </span>
                                            <span class="bg-[#FFE145] text-[#21272C] text-xs font-bold px-2 py-1 rounded-md">+{count}</span>
                                        </div>
                                    {/each}
                                </div>
                                <div class="w-48">
                                    <Button variant="black2" onClick={confirmSave}>
                                        <div slot="icon">
                                            <Icon name="save" style="width: 20px; height: 20px; stroke: white;" />
                                        </div>
                                        {$t("buttons.saveBtn") || "Save"}
                                    </Button>
                                </div>
                            {/if}
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </div>
</div>