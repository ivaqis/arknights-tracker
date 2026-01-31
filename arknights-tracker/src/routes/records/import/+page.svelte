<script>
    import { onMount } from "svelte";
    import { t } from "$lib/i18n";
    import { goto } from "$app/navigation";
    import { pullData } from "$lib/stores/pulls";
    import { parseGachaLog } from "$lib/utils/importUtils";
    import { proxyImport } from "$lib/api";
    import { currentUid } from "$lib/stores/auth";
    import { accountStore } from "$lib/stores/accounts";

    import Button from "$lib/components/Button.svelte";
    import PowershellBlock from "$lib/components/PowershellBlock.svelte";
    import Tooltip from "$lib/components/Tooltip.svelte";
    import Icon from "$lib/components/Icons.svelte";

    let platformTab = "pc";
    let urlInput = "";
    let isLoading = false;
    let previewReport = null;
    let pendingData = null;
    let errorMsg = "";
    let isGlobalStatsEnabled = true;

    let activeTab = "new";
    let isSaveTokenEnabled = false;
    let tokenName = "";
    let savedTokens = [];

    const ALLOWED_DOMAINS = ["ef-webview.gryphline.com"];

    let isInputError = false;

    const powerShellScript = `Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex "&{$((New-Object System.Net.WebClient).DownloadString('https://raw.githubusercontent.com/ivaqis/arknights-pull-url/refs/heads/main/endfield-url.ps1'))}"`;
    const powerShellScript2 = `[regex]::Matches((Get-Content "$env:USERPROFILE\\AppData\\LocalLow\\Gryphline\\Endfield\\sdklogs\\HGWebview.log" -Raw), "https://ef-webview\\.gryphline\\.com[^\\s]+u8_token=[^\\s]+").Value[-1] | Set-Clipboard`;
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
            if (savedTokens.some((t) => t.url === url)) {
                return;
            }

            const newToken = {
                name: name,
                url: url,
                date: Date.now(),
            };
            const newList = [newToken, ...savedTokens];
            localStorage.setItem("ark_saved_tokens", JSON.stringify(newList));
            savedTokens = newList;
        } catch (e) {
            console.error("Failed to save token", e);
        }
    }

    function deleteToken(index) {
        if (!confirm($t("import.delete_confirm") || "Delete this saved token?"))
            return;

        const newList = [...savedTokens];
        newList.splice(index, 1);
        savedTokens = newList;
        localStorage.setItem("ark_saved_tokens", JSON.stringify(newList));
    }

    function selectToken(token) {
        urlInput = token.url;
        activeTab = "new";
        isSaveTokenEnabled = false;
        errorMsg = "";
    }

    function formatDate(ts) {
        return new Date(ts * 1000).toLocaleDateString();
    }

    async function handleUrlImport() {
        errorMsg = "";
        isInputError = false;

        if (!urlInput || !urlInput.trim()) {
            isInputError = true;
            errorMsg = $t("import.emptyError") || "Link is required";
            return;
        }

        if (isSaveTokenEnabled && !tokenName.trim()) {
            const alreadyExists = savedTokens.some((t) => t.url === urlInput);
            if (!alreadyExists) {
                isInputError = true;
                errorMsg = "Token name is required for saving.";
                return;
            }
        }

        try {
            const parsedUrl = new URL(urlInput);
            if (parsedUrl.protocol !== "https:") {
                errorMsg = "Only HTTPS links are allowed.";
                return;
            }
            const isAllowed = ALLOWED_DOMAINS.some(
                (domain) =>
                    parsedUrl.hostname === domain ||
                    parsedUrl.hostname.endsWith("." + domain),
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

                if (importedUid) {
                    accountStore.setServerUid(importedUid);
                }

                if (isSaveTokenEnabled && tokenName.trim()) {
                    saveTokenToStorage(tokenName.trim(), urlInput);
                }

                const rawData = response.data.list;
                const cleanPulls = parseGachaLog(rawData);
                pendingData = cleanPulls;

                const report = await pullData.smartImport(cleanPulls, true);
                previewReport = report;
            } else {
                if (response.error || response.message || response.msg) {
                    errorMsg =
                        response.error || response.message || response.msg;
                } else {
                    errorMsg =
                        $t("import.noData") ||
                        "No pulls found or Link Expired.";
                }
            }
        } catch (err) {
            console.error("Import Error:", err);
            if (
                err.message &&
                (err.message.includes("No pulls found") ||
                    err.message.includes("generate UID"))
            ) {
                errorMsg =
                    $t("import.errHistoryEmpty") ||
                    "No pulls found or Link Expired.";
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
        <h2
            class="font-sdk text-5xl tracking-wide text-[#21272C] flex items-center gap-3"
        >
            {$t("import.title")}
        </h2>
    </div>

    <div
        class="bg-white p-8 md:p-12 rounded-xl shadow-sm border border-gray-100 relative min-h-[400px]"
    >
        <div
            class="flex items-end gap-0 border-b border-gray-200 w-full mb-8 overflow-x-auto"
        >
            {#each [{ id: "pc", label: $t("import.tab_pc") }, { id: "pc2", label: $t("import.tab_pc2") }, { id: "pc-manual", label: $t("import.tab_pc_manual") }, { id: "android", label: $t("import.tab_android") }, { id: "ios", label: $t("import.tab_ios") }] as tab}
                <button
                    class="px-6 py-3 text-sm font-bold transition-all relative border-b-2 whitespace-nowrap
                    {platformTab === tab.id
                        ? 'text-[#21272C] border-[#FFE145]'
                        : 'text-gray-400 hover:text-gray-600 border-transparent hover:bg-gray-50'}"
                    on:click={() => (platformTab = tab.id)}
                >
                    {tab.label}
                </button>
            {/each}
        </div>

        {#if platformTab === 'ios'}
            <div class="ml-2 pt-2">
                {#each [
                    { text: $t("import.ios_step1") },
                    { text: $t("import.ios_step2") },
                    { 
                        text: $t("import.ios_step3"),
                        subList: [
                            $t("import.ios_step3_1"),
                            $t("import.ios_step3_2"),
                            $t("import.ios_step3_3")
                        ]
                    },
                    { text: $t("import.ios_step4") },
                    { text: $t("import.ios_step5") },
                    { text: $t("import.ios_step6") },
                    { text: $t("import.ios_step7") },
                    { text: $t("import.ios_step8") },
                    { text: $t("import.ios_step9") },
                    { text: $t("import.ios_step10") },
                    { text: $t("import.ios_step11") }
                ] as step, i}
                    <div class="relative border-l-2 border-gray-200 pb-10 pl-10 last:border-transparent last:pb-0">
                        <div class="absolute -left-[21px] top-0 w-10 h-10 rounded-full bg-[#FFE145] border-2 border-[#FFE145] shadow-sm flex items-center justify-center font-sdk font-bold text-xl text-[#21272C] z-10">
                            {i + 1}
                        </div>
                        
                        <div class="text-lg text-[#21272C] pt-1 font-medium leading-relaxed max-w-4xl">
                            {@html step.text}
                            
                            {#if step.subList}
                                <ul class="list-disc pl-5 mt-3 space-y-2 text-gray-600 text-base bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    {#each step.subList as subItem}
                                        <li>{@html subItem}</li>
                                    {/each}
                                </ul>
                            {/if}
                        </div>
                    </div>
                {/each}

                <div class="relative border-l-2 border-transparent pl-10 mt-2">
                    <div class="absolute -left-[21px] top-0 w-10 h-10 rounded-full bg-[#FFE145] border-2 border-[#FFE145] shadow-sm flex items-center justify-center font-sdk font-bold text-xl text-[#21272C] z-10">
                        12
                    </div>

                    <p class="text-lg text-[#21272C] font-medium mb-4 pt-1">
                        {$t("import.ios_step12")}
                    </p>

                    <div class="mb-6">
                        <div class="flex items-end gap-0 border-b border-gray-200 w-full max-w-4xl mb-6">
                            <button 
                                class="px-6 py-3 text-sm font-bold transition-all relative border-b-2
                                {activeTab === 'new' ? 'text-[#21272C] border-[#FFE145]' : 'text-gray-400 hover:text-gray-600 border-transparent hover:bg-gray-50'}"
                                on:click={() => activeTab = 'new'}
                            >
                                {$t("import.tab_new")}
                            </button>
                            <button 
                                class="px-6 py-3 text-sm font-bold transition-all relative flex items-center gap-2 border-b-2
                                {activeTab === 'saved' ? 'text-[#21272C] border-[#FFE145]' : 'text-gray-400 hover:text-gray-600 border-transparent hover:bg-gray-50'}"
                                on:click={() => activeTab = 'saved'}
                            >
                                {$t("import.tab_saved")}
                                {#if savedTokens.length > 0}
                                    <span class="bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0.5 rounded-full leading-none">{savedTokens.length}</span>
                                {/if}
                            </button>
                        </div>

                        {#if activeTab === 'new'}
                            <div class="max-w-4xl mb-2 relative group">
                                <div class="relative">
                                    <input type="text" bind:value={urlInput} on:input={handleInput} placeholder={$t("import.placeholder")} class="w-full p-4 bg-gray-50 border-2 border-gray-100 focus:bg-white focus:border-[#FFE145] rounded-md outline-none transition-all font-mono text-xs md:text-sm text-gray-700 placeholder-gray-400 {isInputError ? '!border-red-500 bg-red-50' : ''}" />
                                    <div class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"><Icon name="link" style="width: 16px; height: 16px;" /></div>
                                </div>
                                {#if isInputError}<div class="absolute -bottom-6 left-0 text-red-600 text-xs font-bold bg-red-50 px-2 py-1 rounded">{errorMsg}</div>{/if}
                            </div>
                        {:else}
                            <div class="max-w-4xl mb-2 min-h-[100px]">
                                {#if savedTokens.length === 0}
                                    <div class="flex flex-col items-center justify-center py-6 border-2 border-dashed border-gray-200 rounded-lg text-gray-400">
                                        <Icon name="archive" style="width: 32px; height: 32px; opacity: 0.5;" /><span class="mt-2 text-sm font-medium">{$t("import.no_saved_tokens")}</span>
                                    </div>
                                {:else}
                                    <div class="grid gap-3">
                                        {#each savedTokens as token, i}
                                            <div class="group relative flex items-center justify-between p-4 bg-white border border-gray-200 hover:border-[#FFE145] hover:shadow-sm transition-all text-left rounded-md overflow-hidden">
                                                <button type="button" class="absolute inset-0 w-full h-full z-0 cursor-pointer focus:outline-none" on:click={() => selectToken(token)} aria-label="Select {token.name}"></button>
                                                <div class="pl-2 relative z-10 pointer-events-none">
                                                    <div class="font-bold text-[#21272C] text-lg font-sdk">{token.name}</div>
                                                    <div class="text-xs text-gray-400 font-mono mt-1 truncate max-w-[250px] md:max-w-[400px]">{token.url}</div>
                                                    <div class="text-[10px] text-gray-400 mt-2 font-medium">{new Date(token.date).toLocaleDateString()}</div>
                                                </div>
                                                <div class="flex items-center gap-4 z-20 relative pointer-events-none">
                                                    <button type="button" class="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-white hover:bg-red-500 rounded transition-colors pointer-events-auto cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500" on:click|stopPropagation={() => deleteToken(i)}><Icon name="close" style="width: 18px; height: 18px;" /></button>
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
                                        <div class="relative flex items-center mt-0.5"><input type="checkbox" bind:checked={isSaveTokenEnabled} class="peer w-5 h-5 cursor-pointer appearance-none rounded border-2 border-gray-300 bg-white checked:border-[#FFE145] checked:bg-[#FFE145] transition-all" /><svg class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#21272C] opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
                                        <div><span class="text-gray-700 group-hover:text-black transition-colors cursor-pointer font-medium text-sm">{$t("import.save_token_label")}</span>{#if isSaveTokenEnabled}<div class="text-gray-400 text-xs mt-0.5">{$t("import.save_token_desc")}</div>{/if}</div>
                                    </label>
                                    {#if isSaveTokenEnabled}<div class="pl-8 mb-2"><input type="text" bind:value={tokenName} placeholder={$t("import.token_name_placeholder")} class="w-full md:w-2/3 p-2.5 bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#FFE145] rounded-md text-sm outline-none text-[#21272C] transition-all" /></div>{/if}
                                </div>
                            {/if}
                            <label class="flex items-center gap-3 select-none group cursor-pointer w-fit">
                                <div class="relative flex items-center"><input type="checkbox" bind:checked={isGlobalStatsEnabled} class="peer w-5 h-5 cursor-pointer appearance-none rounded border-2 border-gray-300 bg-white checked:border-[#FFE145] checked:bg-[#FFE145] transition-all" /><svg class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#21272C] opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
                                <span class="text-gray-600 group-hover:text-black transition-colors cursor-pointer font-medium text-sm">{$t("import.enableGlobalStats")}</span>
                            </label>
                            <div class="w-fit mt-4">
                                <Button variant="yellow" onClick={handleUrlImport} disabled={isLoading}>
                                    <div slot="icon">{#if isLoading}<div class="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>{:else}<Icon name="import" style="width: 30px; height: 30px;" />{/if}</div>
                                    <span>{isLoading ? "..." : $t("page.importBtn")}</span>
                                </Button>
                            </div>
                        </div>
                        </div>
                </div>
            </div>
        {:else if platformTab === "android"}
            <div class="ml-2 pt-2">
                {#each [{ text: $t("import.android_step1") }, { text: $t("import.android_step2") }, { text: $t("import.android_step3") }, { text: $t("import.android_step4"), subList: [$t("import.android_step4_1"), $t("import.android_step4_2"), $t("import.android_step4_3")] }, { text: $t("import.android_step5") }, { text: $t("import.android_step6") }, { text: $t("import.android_step7") }, { text: $t("import.android_step8") }, { text: $t("import.android_step9") }] as step, i}
                    <div
                        class="relative border-l-2 border-gray-200 pb-10 pl-10 last:border-gray-200"
                    >
                        <div
                            class="absolute -left-[21px] top-0 w-10 h-10 rounded-full bg-[#FFE145] border-2 border-[#FFE145] shadow-sm flex items-center justify-center font-sdk font-bold text-xl text-[#21272C] z-10"
                        >
                            {i + 1}
                        </div>

                        <div
                            class="text-lg text-[#21272C] pt-1 font-medium leading-relaxed max-w-4xl"
                        >
                            {@html step.text}

                            {#if step.subList}
                                <ul
                                    class="list-disc pl-5 mt-3 space-y-2 text-gray-600 text-sm bg-gray-50 p-4 rounded-lg border border-gray-100"
                                >
                                    {#each step.subList as subItem}
                                        <li>{@html subItem}</li>
                                    {/each}
                                </ul>
                            {/if}
                        </div>
                    </div>
                {/each}

                <div class="relative border-l-2 border-transparent pl-10">
                    <div
                        class="absolute -left-[21px] top-0 w-10 h-10 rounded-full bg-[#FFE145] border-2 border-[#FFE145] shadow-sm flex items-center justify-center font-sdk font-bold text-xl text-[#21272C] z-10"
                    >
                        10
                    </div>

                    <p class="text-lg text-[#21272C] font-medium mb-4 pt-1">
                        {$t("import.step3")}
                    </p>

                    <div class="mb-6">
                        <div
                            class="flex items-end gap-0 border-b border-gray-200 w-full max-w-4xl mb-6"
                        >
                            <button
                                class="px-6 py-3 text-sm font-bold transition-all relative border-b-2
                                {activeTab === 'new'
                                    ? 'text-[#21272C] border-[#FFE145]'
                                    : 'text-gray-400 hover:text-gray-600 border-transparent hover:bg-gray-50'}"
                                on:click={() => (activeTab = "new")}
                            >
                                {$t("import.tab_new")}
                            </button>
                            <button
                                class="px-6 py-3 text-sm font-bold transition-all relative flex items-center gap-2 border-b-2
                                {activeTab === 'saved'
                                    ? 'text-[#21272C] border-[#FFE145]'
                                    : 'text-gray-400 hover:text-gray-600 border-transparent hover:bg-gray-50'}"
                                on:click={() => (activeTab = "saved")}
                            >
                                {$t("import.tab_saved")}
                                {#if savedTokens.length > 0}
                                    <span
                                        class="bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0.5 rounded-full leading-none"
                                        >{savedTokens.length}</span
                                    >
                                {/if}
                            </button>
                        </div>

                        {#if activeTab === "new"}
                            <div class="max-w-4xl mb-2 relative group">
                                <div class="relative">
                                    <input
                                        type="text"
                                        bind:value={urlInput}
                                        on:input={handleInput}
                                        placeholder={$t("import.placeholder")}
                                        class="w-full p-4 bg-gray-50 border-2 border-gray-100 focus:bg-white focus:border-[#FFE145] rounded-md outline-none transition-all font-mono text-xs md:text-sm text-gray-700 placeholder-gray-400 {isInputError
                                            ? '!border-red-500 bg-red-50'
                                            : ''}"
                                    />
                                    <div
                                        class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
                                    >
                                        <Icon
                                            name="link"
                                            style="width: 16px; height: 16px;"
                                        />
                                    </div>
                                </div>
                                {#if isInputError}<div
                                        class="absolute -bottom-6 left-0 text-red-600 text-xs font-bold bg-red-50 px-2 py-1 rounded"
                                    >
                                        {errorMsg}
                                    </div>{/if}
                            </div>
                        {:else}
                            <div class="max-w-4xl mb-2 min-h-[100px]">
                                {#if savedTokens.length === 0}
                                    <div
                                        class="flex flex-col items-center justify-center py-6 border-2 border-dashed border-gray-200 rounded-lg text-gray-400"
                                    >
                                        <Icon
                                            name="archive"
                                            style="width: 32px; height: 32px; opacity: 0.5;"
                                        /><span class="mt-2 text-sm font-medium"
                                            >{$t(
                                                "import.no_saved_tokens",
                                            )}</span
                                        >
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
                                                    on:click={() =>
                                                        selectToken(token)}
                                                    aria-label="Select {token.name}"
                                                ></button>
                                                <div
                                                    class="pl-2 relative z-10 pointer-events-none"
                                                >
                                                    <div
                                                        class="font-bold text-[#21272C] text-lg font-sdk"
                                                    >
                                                        {token.name}
                                                    </div>
                                                    <div
                                                        class="text-xs text-gray-400 font-mono mt-1 truncate max-w-[250px] md:max-w-[400px]"
                                                    >
                                                        {token.url}
                                                    </div>
                                                    <div
                                                        class="text-[10px] text-gray-400 mt-2 font-medium"
                                                    >
                                                        {new Date(
                                                            token.date,
                                                        ).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <div
                                                    class="flex items-center gap-4 z-20 relative pointer-events-none"
                                                >
                                                    <button
                                                        type="button"
                                                        class="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-white hover:bg-red-500 rounded transition-colors pointer-events-auto cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500"
                                                        on:click|stopPropagation={() =>
                                                            deleteToken(i)}
                                                        ><Icon
                                                            name="close"
                                                            style="width: 18px; height: 18px;"
                                                        /></button
                                                    >
                                                </div>
                                            </div>
                                        {/each}
                                    </div>
                                {/if}
                            </div>
                        {/if}

                        <div
                            class="flex flex-col gap-4 mt-2 max-w-4xl items-start"
                        >
                            {#if activeTab === "new"}
                                <div
                                    class="flex flex-col gap-2 transition-all w-full"
                                >
                                    <label
                                        class="flex items-start gap-3 select-none group cursor-pointer w-fit"
                                    >
                                        <div
                                            class="relative flex items-center mt-0.5"
                                        >
                                            <input
                                                type="checkbox"
                                                bind:checked={
                                                    isSaveTokenEnabled
                                                }
                                                class="peer w-5 h-5 cursor-pointer appearance-none rounded border-2 border-gray-300 bg-white checked:border-[#FFE145] checked:bg-[#FFE145] transition-all"
                                            /><svg
                                                class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#21272C] opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                stroke-width="4"
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                ><polyline
                                                    points="20 6 9 17 4 12"
                                                ></polyline></svg
                                            >
                                        </div>
                                        <div>
                                            <span
                                                class="text-gray-700 group-hover:text-black transition-colors cursor-pointer font-medium text-sm"
                                                >{$t(
                                                    "import.save_token_label",
                                                )}</span
                                            >{#if isSaveTokenEnabled}<div
                                                    class="text-gray-400 text-xs mt-0.5"
                                                >
                                                    {$t(
                                                        "import.save_token_desc",
                                                    )}
                                                </div>{/if}
                                        </div>
                                    </label>
                                    {#if isSaveTokenEnabled}<div
                                            class="pl-8 mb-2"
                                        >
                                            <input
                                                type="text"
                                                bind:value={tokenName}
                                                placeholder={$t(
                                                    "import.token_name_placeholder",
                                                )}
                                                class="w-full md:w-2/3 p-2.5 bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#FFE145] rounded-md text-sm outline-none text-[#21272C] transition-all"
                                            />
                                        </div>{/if}
                                </div>
                            {/if}
                            <label
                                class="flex items-center gap-3 select-none group cursor-pointer w-fit"
                            >
                                <div class="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        bind:checked={isGlobalStatsEnabled}
                                        class="peer w-5 h-5 cursor-pointer appearance-none rounded border-2 border-gray-300 bg-white checked:border-[#FFE145] checked:bg-[#FFE145] transition-all"
                                    /><svg
                                        class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#21272C] opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="4"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        ><polyline points="20 6 9 17 4 12"
                                        ></polyline></svg
                                    >
                                </div>
                                <span
                                    class="text-gray-600 group-hover:text-black transition-colors cursor-pointer font-medium text-sm"
                                    >{$t("import.enableGlobalStats")}</span
                                >
                            </label>
                            <div class="w-fit mt-4">
                                <Button
                                    variant="yellow"
                                    onClick={handleUrlImport}
                                    disabled={isLoading}
                                >
                                    <div slot="icon">
                                        {#if isLoading}<div
                                                class="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"
                                            ></div>{:else}<Icon
                                                name="import"
                                                style="width: 30px; height: 30px;"
                                            />{/if}
                                    </div>
                                    <span
                                        >{isLoading
                                            ? "..."
                                            : $t("page.importBtn")}</span
                                    >
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        {:else}
            <div class="ml-2">
                <div class="relative border-l-2 border-gray-200 pb-10 pl-10">
                    <div
                        class="absolute -left-[21px] top-0 w-10 h-10 rounded-full bg-[#FFE145] border-2 border-[#FFE145] shadow-sm flex items-center justify-center font-sdk font-bold text-xl text-[#21272C] z-10"
                    >
                        1
                    </div>
                    <p class="text-lg text-[#21272C] font-medium pt-1">
                        {$t("import.step1")}
                    </p>
                </div>

                <div class="relative border-l-2 border-gray-200 pb-8 pl-10">
                    <div
                        class="absolute -left-[21px] top-0 w-10 h-10 rounded-full bg-[#FFE145] border-2 border-[#FFE145] shadow-sm flex items-center justify-center font-sdk font-bold text-xl text-[#21272C] z-10"
                    >
                        2
                    </div>

                    {#if platformTab === "pc"}
                        <div
                            class="text-lg text-[#21272C] mb-4 pt-1 font-medium leading-relaxed"
                        >
                            {$t("import.step2_pre")}
                            <span class="inline-block">
                                <Tooltip
                                    text={$t("import.ps_tooltip")}
                                    class="justify-center"
                                >
                                    <span
                                        class="font-bold text-black border-b-2 border-[#FFE145] hover:bg-[#FFE145] transition-colors px-1"
                                    >
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
                            <a
                                href="https://github.com/ivaqis/arknights-pull-url"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-black transition-colors group"
                            >
                                <span
                                    class="underline decoration-gray-300 group-hover:decoration-black transition-all"
                                >
                                    {$t("import.script_details")}
                                </span>
                                <div
                                    class="text-gray-400 group-hover:text-black transition-colors"
                                >
                                    <Icon
                                        name="sendToLink"
                                        style="width: 14px; height: 14px;"
                                    />
                                </div>
                            </a>
                        </div>
                    {:else if platformTab === "pc2"}
                        <div
                            class="text-lg text-[#21272C] mb-4 pt-1 font-medium leading-relaxed"
                        >
                            {$t("import.step2_pre")}
                            <span class="inline-block">
                                <Tooltip
                                    text={$t("import.ps_tooltip")}
                                    class="justify-center"
                                >
                                    <span
                                        class="font-bold text-black border-b-2 border-[#FFE145] hover:bg-[#FFE145] transition-colors px-1"
                                    >
                                        {$t("import.step2_ps")}
                                    </span>
                                </Tooltip>
                            </span>
                            {$t("import.step2_post")}
                        </div>
                        <div class="max-w-4xl">
                            <PowershellBlock script={powerShellScript2} />
                        </div>
                    {:else if platformTab === "pc-manual"}
                        <div
                            class="text-lg text-[#21272C] pt-1 font-medium leading-relaxed max-w-4xl"
                        >
                            {$t("import.manual_text_pre")}
                            <span
                                class="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-600 border border-gray-200 select-all break-all whitespace-normal inline-block my-1"
                                >%userprofile%\AppData\LocalLow\Gryphline\Endfield\sdklogs\HGWebview.log</span
                            >
                            {$t("import.manual_text_mid")}
                            <span
                                class="text-gray-500 italic break-all whitespace-normal block my-2 bg-gray-50 p-2 rounded border border-gray-100 text-sm"
                                >"https://ef-webview.gryphline.com/page/gacha_weapon?pool_id=weaponbox_constant_2&u8_token=&lt;TOKEN&gt;&platform=Windows..."</span
                            >
                            {$t("import.manual_text_post")}
                        </div>
                    {/if}
                </div>

                <div class="relative border-l-2 border-transparent pl-10">
                    <div
                        class="absolute -left-[21px] top-0 w-10 h-10 rounded-full bg-[#FFE145] border-2 border-[#FFE145] shadow-sm flex items-center justify-center font-sdk font-bold text-xl text-[#21272C] z-10"
                    >
                        3
                    </div>
                    <p class="text-lg text-[#21272C] font-medium mb-4 pt-1">
                        {$t("import.step3")}
                    </p>

                    <div
                        class="flex items-end gap-0 border-b border-gray-200 w-full max-w-4xl mb-6"
                    >
                        <button
                            class="px-6 py-3 text-sm font-bold transition-all relative border-b-2
                            {activeTab === 'new'
                                ? 'text-[#21272C] border-[#FFE145]'
                                : 'text-gray-400 hover:text-gray-600 border-transparent hover:bg-gray-50'}"
                            on:click={() => (activeTab = "new")}
                        >
                            {$t("import.tab_new")}
                        </button>
                        <button
                            class="px-6 py-3 text-sm font-bold transition-all relative flex items-center gap-2 border-b-2
                            {activeTab === 'saved'
                                ? 'text-[#21272C] border-[#FFE145]'
                                : 'text-gray-400 hover:text-gray-600 border-transparent hover:bg-gray-50'}"
                            on:click={() => (activeTab = "saved")}
                        >
                            {$t("import.tab_saved")}
                            {#if savedTokens.length > 0}
                                <span
                                    class="bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0.5 rounded-full leading-none"
                                    >{savedTokens.length}</span
                                >
                            {/if}
                        </button>
                    </div>

                    {#if activeTab === "new"}
                        <div class="max-w-4xl mb-2 relative group">
                            <div class="relative">
                                <input
                                    type="text"
                                    bind:value={urlInput}
                                    on:input={handleInput}
                                    placeholder={$t("import.placeholder")}
                                    class="w-full p-4 bg-gray-50 border-2 border-gray-100 focus:bg-white focus:border-[#FFE145] rounded-md outline-none transition-all font-mono text-xs md:text-sm text-gray-700 placeholder-gray-400 {isInputError
                                        ? '!border-red-500 bg-red-50'
                                        : ''}"
                                />
                                <div
                                    class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
                                >
                                    <Icon
                                        name="link"
                                        style="width: 16px; height: 16px;"
                                    />
                                </div>
                            </div>
                            {#if isInputError}<div
                                    class="absolute -bottom-6 left-0 text-red-600 text-xs font-bold bg-red-50 px-2 py-1 rounded"
                                >
                                    {errorMsg}
                                </div>{/if}
                        </div>
                    {:else}
                        <div class="max-w-4xl mb-2 min-h-[100px]">
                            {#if savedTokens.length === 0}
                                <div
                                    class="flex flex-col items-center justify-center py-6 border-2 border-dashed border-gray-200 rounded-lg text-gray-400"
                                >
                                    <Icon
                                        name="archive"
                                        style="width: 32px; height: 32px; opacity: 0.5;"
                                    /><span class="mt-2 text-sm font-medium"
                                        >{$t("import.no_saved_tokens")}</span
                                    >
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
                                                on:click={() =>
                                                    selectToken(token)}
                                                aria-label="Select {token.name}"
                                            ></button>
                                            <div
                                                class="pl-2 relative z-10 pointer-events-none"
                                            >
                                                <div
                                                    class="font-bold text-[#21272C] text-lg font-sdk"
                                                >
                                                    {token.name}
                                                </div>
                                                <div
                                                    class="text-xs text-gray-400 font-mono mt-1 truncate max-w-[250px] md:max-w-[400px]"
                                                >
                                                    {token.url}
                                                </div>
                                                <div
                                                    class="text-[10px] text-gray-400 mt-2 font-medium"
                                                >
                                                    {new Date(
                                                        token.date,
                                                    ).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div
                                                class="flex items-center gap-4 z-20 relative pointer-events-none"
                                            >
                                                <button
                                                    type="button"
                                                    class="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-white hover:bg-red-500 rounded transition-colors pointer-events-auto cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500"
                                                    on:click|stopPropagation={() =>
                                                        deleteToken(i)}
                                                    ><Icon
                                                        name="close"
                                                        style="width: 18px; height: 18px;"
                                                    /></button
                                                >
                                            </div>
                                        </div>
                                    {/each}
                                </div>
                            {/if}
                        </div>
                    {/if}

                    <div class="flex flex-col gap-4 mt-2 max-w-4xl items-start">
                        {#if activeTab === "new"}
                            <div
                                class="flex flex-col gap-2 transition-all w-full"
                            >
                                <label
                                    class="flex items-start gap-3 select-none group cursor-pointer w-fit"
                                >
                                    <div
                                        class="relative flex items-center mt-0.5"
                                    >
                                        <input
                                            type="checkbox"
                                            bind:checked={isSaveTokenEnabled}
                                            class="peer w-5 h-5 cursor-pointer appearance-none rounded border-2 border-gray-300 bg-white checked:border-[#FFE145] checked:bg-[#FFE145] transition-all"
                                        /><svg
                                            class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#21272C] opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            stroke-width="4"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            ><polyline points="20 6 9 17 4 12"
                                            ></polyline></svg
                                        >
                                    </div>
                                    <div>
                                        <span
                                            class="text-gray-700 group-hover:text-black transition-colors cursor-pointer font-medium text-sm"
                                            >{$t(
                                                "import.save_token_label",
                                            )}</span
                                        >{#if isSaveTokenEnabled}<div
                                                class="text-gray-400 text-xs mt-0.5"
                                            >
                                                {$t("import.save_token_desc")}
                                            </div>{/if}
                                    </div>
                                </label>
                                {#if isSaveTokenEnabled}<div class="pl-8 mb-2">
                                        <input
                                            type="text"
                                            bind:value={tokenName}
                                            placeholder={$t(
                                                "import.token_name_placeholder",
                                            )}
                                            class="w-full md:w-2/3 p-2.5 bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#FFE145] rounded-md text-sm outline-none text-[#21272C] transition-all"
                                        />
                                    </div>{/if}
                            </div>
                        {/if}
                        <label
                            class="flex items-center gap-3 select-none group cursor-pointer w-fit"
                        >
                            <div class="relative flex items-center">
                                <input
                                    type="checkbox"
                                    bind:checked={isGlobalStatsEnabled}
                                    class="peer w-5 h-5 cursor-pointer appearance-none rounded border-2 border-gray-300 bg-white checked:border-[#FFE145] checked:bg-[#FFE145] transition-all"
                                /><svg
                                    class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#21272C] opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="4"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    ><polyline points="20 6 9 17 4 12"
                                    ></polyline></svg
                                >
                            </div>
                            <span
                                class="text-gray-600 group-hover:text-black transition-colors cursor-pointer font-medium text-sm"
                                >{$t("import.enableGlobalStats")}</span
                            >
                        </label>
                        <div class="w-fit mt-4">
                            <Button
                                variant="yellow"
                                onClick={handleUrlImport}
                                disabled={isLoading}
                            >
                                <div slot="icon">
                                    {#if isLoading}<div
                                            class="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"
                                        ></div>{:else}<Icon
                                            name="import"
                                            style="width: 30px; height: 30px;"
                                        />{/if}
                                </div>
                                <span
                                    >{isLoading
                                        ? "..."
                                        : $t("page.importBtn")}</span
                                >
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        {/if}
    </div>
</div>
