<script>
    import { t } from "$lib/i18n";
    import { goto } from "$app/navigation";
    import { pullData } from "$lib/stores/pulls";
    import { PullParser } from "$lib/classes/pulls/PullParser";
    import { fetchPostImport } from "$lib/api/import/fetchPostImport";
    import { fetchSyncPulls } from "$lib/api/syncPulls/fetchSyncPulls";
    import { accountStore } from "$lib/stores/accounts";
    import { onMount } from "svelte";
    import { get } from "svelte/store";

    import Button from "$lib/components/Button.svelte";
    import Checkbox from "$lib/components/Checkbox.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import ConfirmationModal from "$lib/components/modals/ConfirmationModal.svelte";
    import Tooltip from "$lib/components/Tooltip.svelte";

    import FileDropzone from "$lib/components/records/import/FileDropzone.svelte";
    import SavedTokensList from "$lib/components/records/import/SavedTokensList.svelte";
    import ImportPreviewReport from "$lib/components/records/import/ImportPreviewReport.svelte";
    import ImportInstructions from "$lib/components/records/import/ImportInstructions.svelte";

    let platformTab = "pc-web";
    let urlInput = "";
    let realImportUrl = "";
    let isLoading = false;
    let previewReport = null;
    let pendingData = null;
    let signedSyncToken = null;
    let errorMsg = "";
    let isGlobalStatsEnabled = true;
    let isRecoveryEnabled = false;
    let activeTab = "new";
    let selectedServer = "3";
    let isSaveTokenEnabled = false;
    let tokenName = "";
    let savedTokens = [];
    let isInputError = false;
    let selectedFileName = "";
    let lastParsedPulls = null;
    let toolsDevJsonInput = "";
    let isDeleteModalOpen = false;
    let tokenToDeleteIndex = null;

    onMount(() => {
        loadSavedTokens();
    });

    function loadSavedTokens() {
        try {
            const raw = localStorage.getItem("ark_saved_tokens");
            if (raw) savedTokens = JSON.parse(raw);
        } catch (e) {
            console.error(e);
        }
    }

    function extractServerFromUrl(url) {
        if (!url) return null;
        try {
            const parsed = new URL(url);
            return parsed.searchParams.get("server");
        } catch {
            const match = url.match(/[?&]server=([^&#\s]+)/);
            return match ? match[1] : null;
        }
    }

    function updateServerInUrl(url, server) {
        if (!url || !server) return url;
        try {
            const parsed = new URL(url);
            parsed.searchParams.set("server", server);
            return parsed.toString();
        } catch {
            if (url.includes("server=")) {
                return url.replace(/([?&]server=)[^&#\s]*/, `$1${server}`);
            }
            const sep = url.includes("?") ? "&" : "?";
            return `${url}${sep}server=${server}`;
        }
    }

    function saveTokenToStorage(name, url) {
        try {
            const srv = selectedServer || extractServerFromUrl(url) || "3";
            const finalUrl = updateServerInUrl(url, srv);
            if (savedTokens.some((t) => t.url === finalUrl || t.url === url)) return;
            const newToken = { name, url: finalUrl, server: srv, date: Date.now() };
            const newList = [newToken, ...savedTokens];
            localStorage.setItem("ark_saved_tokens", JSON.stringify(newList));
            savedTokens = newList;
        } catch (e) {
            console.error(e);
        }
    }

    function requestDeleteToken(index) {
        tokenToDeleteIndex = index;
        isDeleteModalOpen = true;
    }

    function confirmDeleteToken() {
        if (tokenToDeleteIndex === null) return;
        const newList = [...savedTokens];
        newList.splice(tokenToDeleteIndex, 1);
        savedTokens = newList;
        localStorage.setItem("ark_saved_tokens", JSON.stringify(newList));
        isDeleteModalOpen = false;
        tokenToDeleteIndex = null;
    }

    function cancelDeleteToken() {
        isDeleteModalOpen = false;
        tokenToDeleteIndex = null;
    }

    function handleServerChange(newServer) {
        selectedServer = newServer;
        if (urlInput) {
            if (urlInput.startsWith("http")) {
                urlInput = updateServerInUrl(urlInput, newServer);
                realImportUrl = updateServerInUrl(realImportUrl, newServer);
            } else {
                realImportUrl = PullParser.buildImportUrl(urlInput, selectedServer);
            }
        }
    }

    function selectToken(token) {
        if (!token) return;
        let srv = token.server || extractServerFromUrl(token.url);
        if (!srv && token.name) {
            const nameLower = token.name.toLowerCase();
            if (nameLower.includes("asia") || nameLower.includes("азия")) {
                srv = "2";
            } else if (nameLower.includes("america") || nameLower.includes("америк") || nameLower.includes("europe") || nameLower.includes("европ")) {
                srv = "3";
            }
        }
        if (srv === "2" || srv === "3") {
            selectedServer = srv;
        }
        let url = token.url || "";
        if (url && (srv === "2" || srv === "3")) {
            url = updateServerInUrl(url, srv);
        }
        urlInput = url;
        realImportUrl = url;
        activeTab = "new";
        isSaveTokenEnabled = false;
        errorMsg = "";
    }

    function parseInputToken(raw) {
        let clean = (raw || "").trim();
        if (clean.includes("token")) {
            try {
                const jsonMatch = clean.match(/"token"\s*:\s*"([^"]+)"/);
                if (jsonMatch && jsonMatch[1]) clean = jsonMatch[1];
                else {
                    if (clean.startsWith("'") || clean.startsWith('"')) clean = clean.slice(1, -1);
                    const obj = JSON.parse(clean);
                    if (obj.token) clean = obj.token;
                }
            } catch {
                clean = clean.replace(/^{"token":"/, "").replace(/"}$/, "");
            }
        }
        let token = clean;
        let sId = selectedServer;
        if (clean.startsWith("http")) {
            try {
                const parsed = new URL(clean);
                const u8 = parsed.searchParams.get("u8_token");
                if (u8) token = u8;
                const s = parsed.searchParams.get("server");
                if (s) sId = s;
            } catch {}
        }
        token = decodeURIComponent(token).trim();
        return { token, serverId: sId };
    }

    function handleInputProcessing(e) {
        const rawValue = e.target.value;
        errorMsg = "";
        isInputError = false;
        if (!rawValue) {
            urlInput = "";
            realImportUrl = "";
            return;
        }
        if (rawValue.trim().startsWith("http")) {
            const trimmed = rawValue.trim();
            const srv = extractServerFromUrl(trimmed);
            if (srv === "2" || srv === "3") {
                selectedServer = srv;
            }
            urlInput = trimmed;
            realImportUrl = trimmed;
            return;
        }
        const { token } = parseInputToken(rawValue);
        if (!token) return;
        urlInput = token;
        e.target.value = token;
    }

    $: if (urlInput) {
        if (!urlInput.startsWith("http")) {
            realImportUrl = PullParser.buildImportUrl(urlInput, selectedServer);
        } else {
            realImportUrl = urlInput;
        }
    }

    function mapBackendError(backendMsg) {
        if (!backendMsg) return $t("import.error_unknown");
        if (backendMsg.includes("Invalid token") || backendMsg.includes("Token is invalid")) {
            return $t("import.error_invalid_token");
        }
        if (backendMsg.includes("Invalid domain")) {
            return $t("import.error_domain");
        }
        if (backendMsg.includes("No pulls found") || backendMsg.includes("expired")) {
            return $t("import.error_no_data");
        }
        if (backendMsg.includes("Profile not found")) {
            return $t("import.error_format");
        }
        return backendMsg;
    }

    function mapStreamCatchError(err) {
        const code = err?.code || "";
        const msg = err?.message || "";
        if (code === "ACCOUNT_MISMATCH_RECOVERY" || msg === "ACCOUNT_MISMATCH_RECOVERY") {
            return $t("import.error_account_mismatch_recovery");
        }
        if (code === "ACCOUNT_MISMATCH" || msg === "ACCOUNT_MISMATCH") {
            return $t("import.error_account_mismatch", err?.params || {});
        }
        if (msg === "RATE_LIMIT") {
            return $t("import.error_rate_limit");
        }
        if (msg === "NETWORK_ERROR" || msg.includes("Failed to fetch")) {
            return $t("import.error_network");
        }
        if (msg) {
            return msg;
        }
        return $t("import.error_unknown");
    }

    async function handleUrlImport() {
        errorMsg = "";
        isInputError = false;
        const urlToSend = realImportUrl || urlInput;

        if (!urlToSend || !urlToSend.trim()) {
            isInputError = true;
            errorMsg = $t("import.error_empty");
            return;
        }

        if (isSaveTokenEnabled && !tokenName.trim()) {
            const alreadyExists = savedTokens.some((t) => t.url === urlToSend);
            if (!alreadyExists) {
                isInputError = true;
                errorMsg = $t("import.error_token_name");
                return;
            }
        }

        if (urlToSend.startsWith("http:") && !urlToSend.startsWith("https:")) {
            isInputError = true;
            errorMsg = $t("import.error_https");
            return;
        }

        const { token, serverId } = parseInputToken(urlToSend);
        if (!token) {
            isInputError = true;
            errorMsg = $t("import.error_format");
            return;
        }

        isLoading = true;
        pendingData = null;
        signedSyncToken = null;

        previewReport = {
            status: "loading",
            totalAdded: 0,
            addedCount: {}
        };

        const primaryServer = (serverId === "2" || serverId === "3") ? serverId : (selectedServer === "2" || selectedServer === "3" ? selectedServer : "3");
        const serverCandidates = primaryServer === "2" ? ["2", "3"] : ["3", "2"];
        const selectedAccId = get(accountStore.selectedId);
        let currentPrivateId = null;
        if (typeof window !== "undefined" && selectedAccId && !isRecoveryEnabled) {
            currentPrivateId = localStorage.getItem(`ark_banner_private_id_${selectedAccId}`) || null;
        }

        try {
            const stream = await fetchPostImport(token, serverCandidates, currentPrivateId);

            for await (const msg of stream) {
                if (msg.type === "progress") {
                    const progressData = msg.data || {};
                    const bannerType = PullParser.normalizeBannerKey(progressData.type || "standard");
                    const count = Number(progressData.count || 0);
                    const newAddedCount = { ...previewReport.addedCount };
                    if (count > 0) {
                        newAddedCount[bannerType] = count;
                    }
                    const totalAdded = Object.values(newAddedCount).reduce((sum, c) => sum + c, 0);
                    previewReport = {
                        ...previewReport,
                        addedCount: newAddedCount,
                        totalAdded
                    };
                } else if (msg.type === "complete") {
                    await handleImportComplete(msg.data, urlToSend);
                } else if (msg.type === "error") {
                    errorMsg = mapBackendError(msg.message);
                    previewReport = null;
                    isLoading = false;
                    return;
                }
            }
        } catch (err) {
            console.error("Import Error:", err);
            errorMsg = mapStreamCatchError(err);
            previewReport = null;
            pendingData = null;
        } finally {
            isLoading = false;
        }
    }

    async function handleImportComplete(data, urlToSend) {
        if (!data) return;
        signedSyncToken = data.token || null;
        const backendServerId = data.serverId || selectedServer || "3";

        if (isSaveTokenEnabled && tokenName.trim()) {
            saveTokenToStorage(tokenName.trim(), urlToSend);
        }

        const pullsObj = data.pulls || {};
        const rawList = Array.isArray(data.list)
            ? data.list
            : Object.values(pullsObj).flat();

        const cleanPulls = PullParser.parseGachaLog(rawList);
        const report = await pullData.smartImport(
            cleanPulls,
            backendServerId,
            false,
            isRecoveryEnabled
        );
        pendingData = cleanPulls;
        previewReport = report;
    }

    async function confirmSave() {
        if (!pendingData) return;
        isLoading = true;
        try {
            const accounts = get(accountStore.accounts) || [];
            const selectedId = get(accountStore.selectedId);
            const currentAcc = accounts.find((a) => a.id === selectedId);
            const sId = currentAcc?.serverId || selectedServer || "3";

            if (signedSyncToken) {
                try {
                    const syncData = await fetchSyncPulls(signedSyncToken, true);
                    const profile = syncData?.profile;
                    if (profile?.privateId && typeof window !== "undefined" && selectedId) {
                        localStorage.setItem(`ark_banner_private_id_${selectedId}`, profile.privateId);
                    }
                } catch (e) {
                    console.error("Sync import failed:", e);
                }
            }

            await pullData.smartImport(
                pendingData,
                sId,
                true,
                isRecoveryEnabled
            );

            goto("/records");
        } catch (err) {
            console.error(err);
            errorMsg = mapStreamCatchError(err);
            isLoading = false;
        }
    }

    $: if (platformTab) {
        selectedFileName = "";
        lastParsedPulls = null;
        pendingData = null;
        previewReport = null;
        errorMsg = "";
        toolsDevJsonInput = "";
    }

    async function runSmartImportPreview(pullsMapped) {
        isLoading = true;
        try {
            const accounts = get(accountStore.accounts) || [];
            const selectedId = get(accountStore.selectedId);
            const currentAcc = accounts.find((a) => a.id === selectedId);
            const sId = currentAcc?.serverId || "3";

            const report = await pullData.smartImport(
                pullsMapped,
                sId,
                false,
                isRecoveryEnabled,
            );

            pendingData = pullsMapped;
            previewReport = report;
        } catch (err) {
            console.error("Import Error:", err);
            errorMsg = mapStreamCatchError(err);
        } finally {
            isLoading = false;
        }
    }

    function mapFileImportError(err, platform) {
        const msg = err?.message || "";
        if (msg === "PROTORIG_PARSE_ERROR") return $t("import.protorig_parse_error");
        if (msg === "PROTORIG_NO_PULLS_ERROR") return $t("import.protorig_no_pulls_error");
        if (msg === "TRACKMYPULLS_PARSE_ERROR") return $t("import.trackmypulls_parse_error");
        if (msg === "TRACKMYPULLS_NO_PULLS_ERROR") return $t("import.trackmypulls_no_pulls_error");
        if (msg === "ENDMIN_DECOMPRESS_ERROR") return $t("import.endmin_decompress_error");
        if (msg === "ENDMIN_NO_PROFILES_ERROR") return $t("import.endmin_no_profiles_error");
        if (msg === "ENDMIN_NO_PULLS_ERROR") return $t("import.endmin_no_pulls_error");
        if (msg === "TOOLSDEV_EMPTY_ERROR") return $t("import.endmin_no_pulls_error");
        if (msg === "TOOLSDEV_PARSE_ERROR") return $t("import.error_format");
        if (platform === "protorig") return $t("import.protorig_parse_error");
        if (platform === "trackmypulls") return $t("import.trackmypulls_parse_error");
        if (platform === "endmin") return $t("import.endmin_unknown_error");
        if (msg) return msg;
        return $t("import.error_unknown");
    }

    async function processFile(file) {
        if (!file) return;
        errorMsg = "";
        isInputError = false;
        selectedFileName = file.name;
        isLoading = true;
        previewReport = null;
        pendingData = null;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const fileContent = event.target.result;
                if (platformTab === "protorig") {
                    lastParsedPulls = PullParser.parseProtorigBackup(fileContent);
                } else if (platformTab === "trackmypulls") {
                    lastParsedPulls = PullParser.parseTrackMyPullsBackup(fileContent);
                } else {
                    lastParsedPulls = PullParser.parseEndminBackup(fileContent);
                }
            } catch (err) {
                console.error("Error processing backup file:", err);
                errorMsg = mapFileImportError(err, platformTab);
            } finally {
                isLoading = false;
            }
        };

        reader.onerror = () => {
            errorMsg = platformTab === "protorig"
                ? $t("import.protorig_parse_error")
                : platformTab === "trackmypulls"
                ? $t("import.trackmypulls_read_error")
                : $t("import.endmin_read_error");
            isLoading = false;
        };

        reader.readAsText(file);
    }

    async function handleToolsDevImport() {
        errorMsg = "";
        isInputError = false;
        if (!toolsDevJsonInput.trim()) {
            errorMsg = $t("import.error_empty");
            isInputError = true;
            return;
        }

        isLoading = true;
        previewReport = null;
        pendingData = null;

        try {
            lastParsedPulls = PullParser.parseToolsDevJson(toolsDevJsonInput);
        } catch (err) {
            console.error("Error processing endfieldtools.dev data:", err);
            errorMsg = mapFileImportError(err, "toolsdev");
        } finally {
            isLoading = false;
        }
    }

    function getBannerName(bannerId) {
        const norm = PullParser.normalizeBannerKey(bannerId);
        const bannersKey = `banners.${norm}`;
        const bannersTrans = $t(bannersKey);
        if (bannersTrans !== bannersKey) {
            return bannersTrans;
        }
        const typesKey = `bannerTypes.${norm}`;
        const typesTrans = $t(typesKey);
        if (typesTrans !== typesKey) {
            return typesTrans;
        }
        return norm;
    }

    $: if (lastParsedPulls && (platformTab === "endmin" || platformTab === "toolsdev" || platformTab === "protorig" || platformTab === "trackmypulls") && isRecoveryEnabled !== undefined) {
        runSmartImportPreview(lastParsedPulls);
    }
</script>

<svelte:head>
    <title>{$t("import.title")} - {$t("pages.records")} - Goyfield</title>
    <meta name="description" content={$t("seo.descriptions.import")} />
    <meta property="og:title" content={`${$t("import.title")} - ${$t("pages.records")} - Goyfield`} />
    <meta property="og:description" content={$t("seo.descriptions.import")} />
</svelte:head>

<div class="max-w-[1600px] justify-start">
    <div class="flex items-center gap-4 mb-8">
        <Button
            variant="roundSmall"
            color="white"
            onClick={() => goto("/records")}
        >
            <Icon name="arrowLeft" class="w-5 h-5" />
        </Button>
        <h2
            class="font-sdk text-5xl tracking-wide text-[#21272C] dark:text-[#FDFDFD] flex items-center gap-3"
        >
            {$t("import.title")}
        </h2>
    </div>

    <div
        class="bg-white p-8 md:p-12 rounded-xl dark:bg-[#383838] dark:border-[#444444] shadow-sm border border-gray-100 relative min-h-[400px]"
    >
        <div
            class="bg-white dark:bg-[#343434] border border-gray-200 dark:border-[#444444] rounded-xl p-4 mb-3 shadow-sm"
        >
            <div class="flex items-start gap-3">
                <div class="mt-0.5 text-[#FACC15] shrink-0">
                    <Icon name="info" class="w-5 h-5" />
                </div>
                <div class="flex-1">
                    <h3
                        class="text-gray-800 dark:text-[#E0E0E0] font-bold text-base uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-[#444] pb-2"
                    >
                        {$t("import.faq_security_title")}
                    </h3>

                    <div class="mb-3">
                        <h4
                            class="font-bold text-[#21272C] dark:text-[#FDFDFD] mb-1 text-sm"
                        >
                            {$t("import.faq_q1")}
                        </h4>
                        <p
                            class="text-sm text-gray-600 dark:text-[#B7B6B3] leading-relaxed"
                        >
                            {@html $t("import.faq_security_desc1")}
                        </p>
                    </div>

                    <div class="mb-3">
                        <h4
                            class="font-bold text-[#21272C] dark:text-[#FDFDFD] mb-1 text-sm"
                        >
                            {$t("import.faq_q2")}
                        </h4>
                        <p
                            class="text-sm text-gray-600 dark:text-[#B7B6B3] leading-relaxed"
                        >
                            {@html $t("import.faq_security_desc2")}
                        </p>
                    </div>

                    <div
                        class="mb-1 text-sm text-gray-500 dark:text-[#999] bg-gray-50 dark:bg-[#2C2C2C] border-l-2 border-[#FACC15] p-3 rounded-r-lg"
                    >
                        <span
                            class="font-bold text-gray-700 dark:text-[#E0E0E0]"
                            >{$t("import.note")}:</span
                        >
                        {@html $t("import.faq_security_desc3")}
                    </div>
                </div>
            </div>
        </div>
        <div class="w-full mb-4 mt-4 sm:mb-6 sm:mt-6 overflow-hidden">
            <div
                class="flex w-full overflow-x-auto no-scrollbar max-[719px]:bg-gray-100 max-[719px]:dark:bg-[#2b2b2b] max-[719px]:p-1 max-[719px]:rounded-xl max-[719px]:border max-[719px]:border-gray-200/50 max-[719px]:dark:border-gray-800/50 max-[719px]:gap-1 max-[719px]:items-center min-[720px]:border-b min-[720px]:border-gray-200 min-[720px]:dark:border-[#444444] min-[720px]:gap-0 min-[720px]:items-end min-[720px]:pb-1"
            >
                {#each [{ id: "pc-web", label: $t("import.tab_pc") }, { id: "pc1", label: $t("import.tab_pc1") }, { id: "pc2", label: $t("import.tab_pc2") }, { id: "pc3", label: $t("import.tab_pc3") }, { id: "pc-manual", label: $t("import.tab_pc_manual") }, { id: "android", label: $t("import.tab_android") }, { id: "ios", label: $t("import.tab_ios") }, { id: "endmin", label: "endmin.moe" }, { id: "toolsdev", label: "endfieldtools.dev" }, { id: "protorig", label: "PROTORIG.app" }, { id: "trackmypulls", label: "trackmypulls.com" }] as tab}
                    <button
                        class="font-bold transition-all whitespace-nowrap select-none
                            {platformTab === tab.id
                                ? 'text-[#21272C] dark:text-[#FDFDFD] max-[719px]:bg-white max-[719px]:dark:bg-[#383838] max-[719px]:shadow-sm max-[719px]:rounded-lg max-[719px]:px-4 max-[719px]:py-2 max-[719px]:text-xs min-[720px]:border-b-2 min-[720px]:border-[#FFE145] min-[720px]:px-6 min-[720px]:py-3 min-[720px]:text-sm'
                                : 'text-gray-400 dark:text-[#B7B6B3] hover:text-gray-600 max-[719px]:text-gray-500 max-[719px]:dark:text-[#B7B6B3] max-[719px]:px-4 max-[719px]:py-2 max-[719px]:text-xs min-[720px]:border-b-2 min-[720px]:border-transparent min-[720px]:hover:bg-gray-50 min-[720px]:hover:dark:bg-[#424242] min-[720px]:px-6 min-[720px]:py-3 min-[720px]:text-sm'}"
                        on:click={() => (platformTab = tab.id)}
                    >
                        {tab.label}
                    </button>
                {/each}
            </div>
        </div>

        <ImportInstructions {platformTab} />

        <div class="mb-6 {platformTab === 'ios' ? '' : 'pl-10'}">
            {#if platformTab === 'endmin'}
                <FileDropzone
                    accept=".endmin"
                    {selectedFileName}
                    filesLabel={$t("import.endmin_files_label")}
                    inputId="endmin-file-input"
                    on:select={(e) => processFile(e.detail)}
                />
            {:else if platformTab === 'toolsdev'}
                <div class="max-w-4xl mb-6 relative flex flex-col gap-3">
                    <textarea
                        bind:value={toolsDevJsonInput}
                        placeholder={$t("import.toolsdev_placeholder")}
                        class="w-full min-h-[160px] p-3 mb-3 bg-gray-50 dark:bg-[#343434] dark:border-[#444444] dark:text-[#E0E0E0] border border-gray-200 focus:bg-white focus:border-[#FFE145] focus:dark:border-[#FFE145] rounded-lg text-sm outline-none text-[#21272C] transition-colors font-mono resize-y"
                    ></textarea>
                    <div
                        class="w-fit {isLoading
                            ? 'opacity-60 pointer-events-none cursor-not-allowed'
                            : ''}"
                    >
                        <Button
                            variant="yellow"
                            onClick={() => {
                                if (!isLoading) handleToolsDevImport();
                            }}
                            disabled={isLoading}
                        >
                            <div
                                slot="icon"
                                class="text-gray-800 dark:text-gray-800"
                            >
                                {#if isLoading}
                                    <Icon
                                        name="loading"
                                        class="w-4 h-4 animate-spin"
                                    />
                                {:else}
                                    <Icon
                                        name="import"
                                        class="w-[30px] h-[30px]"
                                    />
                                {/if}
                            </div>
                            <span>
                                {isLoading
                                    ? $t("import.importing")
                                    : $t("page.importBtn")}
                            </span>
                        </Button>
                    </div>
                </div>
            {:else if platformTab === 'protorig'}
                <FileDropzone
                    accept=".json"
                    {selectedFileName}
                    filesLabel={$t("import.protorig_files_label")}
                    inputId="protorig-file-input"
                    on:select={(e) => processFile(e.detail)}
                />
            {:else if platformTab === 'trackmypulls'}
                <FileDropzone
                    accept=".json"
                    {selectedFileName}
                    filesLabel={$t("import.trackmypulls_files_label")}
                    inputId="trackmypulls-file-input"
                    on:select={(e) => processFile(e.detail)}
                />
            {:else}
                <div
                    class="flex items-end gap-0 border-b border-gray-200 dark:border-[#444444] w-full max-w-4xl mb-4"
                >
                    <button
                        class="px-6 py-3 text-sm font-bold transition-all relative border-b-2
                    {activeTab === 'new'
                                ? 'text-[#21272C] dark:text-[#FDFDFD] border-[#FFE145]'
                                : 'text-gray-400 hover:text-gray-600 hover:dark:bg-[#424242] dark:text-[#B7B6B3] border-transparent hover:bg-gray-50'}"
                            on:click={() => (activeTab = "new")}
                        >
                            {$t("import.tab_new")}
                        </button>
                        <button
                            class="px-6 py-3 text-sm font-bold transition-all relative flex items-center gap-2 border-b-2
                    {activeTab === 'saved'
                                ? 'text-[#21272C] border-[#FFE145] dark:text-[#FDFDFD]'
                                : 'text-gray-400 hover:text-gray-600 hover:dark:bg-[#424242] dark:text-[#B7B6B3] border-transparent hover:bg-gray-50'}"
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
                        <div class="max-w-4xl mb-6 relative group">
                            {#if platformTab !== "endmin" && platformTab !== "toolsdev" && platformTab !== "protorig"}
                                <div
                                    class="flex gap-2 mb-3 p-1 bg-gray-100 dark:bg-[#2C2C2C] rounded-lg w-fit transition-all"
                                >
                                    <button
                                        class="px-4 py-1.5 text-sm font-bold rounded-md transition-colors {selectedServer ===
                                        '3'
                                            ? 'bg-white dark:bg-[#444] text-[#21272C] dark:text-white shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}"
                                        on:click={() =>
                                            handleServerChange("3")}
                                    >
                                        Americas / Europe
                                    </button>
                                    <button
                                        class="px-4 py-1.5 text-sm font-bold rounded-md transition-colors {selectedServer ===
                                        '2'
                                            ? 'bg-white dark:bg-[#444] text-[#21272C] dark:text-white shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}"
                                        on:click={() =>
                                            handleServerChange("2")}
                                    >
                                        Asia
                                    </button>
                                </div>
                            {/if}

                        <div class="relative">
                            <input
                                type="text"
                                value={urlInput}
                                on:input={handleInputProcessing}
                                placeholder={platformTab === "android" ||
                                platformTab === "pc-web" ||
                                platformTab === "pc2" ||
                                platformTab === "pc3"
                                    ? $t("import.placeholder_token")
                                    : $t("import.placeholder_url")}
                                class="w-full p-4 bg-gray-50 border-2 border-gray-100 dark:bg-[#343434] dark:border-[#444444] dark:text-[#E0E0E0] focus:bg-white focus:border-[#FFE145] focus:dark:border-[#FFE145] rounded-md outline-none transition-all font-mono text-xs md:text-sm text-gray-700 placeholder-gray-400
            {isInputError && errorMsg !== $t('import.error_token_name')
                ? '!border-red-500 bg-red-50'
                : ''}"
                            />

                                <div
                                    class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
                                >
                                    {#if (platformTab === "android" || platformTab === "pc-web" || platformTab === "pc2" || platformTab === "pc3") && urlInput && !urlInput.startsWith("http")}
                                        <Icon
                                            name="check"
                                            class="w-4 h-4 text-green-600"
                                        />
                                    {:else}
                                        <div
                                            class="bg-gray-50/90 dark:bg-[#343434]/80 p-1 rounded-lg"
                                        >
                                            <Icon
                                                name="link"
                                                class="w-4 h-4"
                                            />
                                        </div>
                                    {/if}
                                </div>
                            </div>

                        {#if isInputError && errorMsg !== $t("import.error_token_name")}
                            <div
                                class="absolute -bottom-6 left-0 text-red-600 text-xs font-bold px-2 py-1 rounded animate-in fade-in slide-in-from-top-1"
                            >
                                {errorMsg}
                            </div>
                        {/if}
                    </div>
                {:else}
                    <SavedTokensList
                        {savedTokens}
                        on:select={(e) => selectToken(e.detail)}
                        on:delete={(e) => requestDeleteToken(e.detail)}
                    />
                {/if}
            {/if}

            <div class="flex flex-col gap-4 mt-2 max-w-4xl items-start">
                {#if activeTab === "new" && platformTab !== 'endmin' && platformTab !== 'toolsdev' && platformTab !== 'protorig' && platformTab !== 'trackmypulls'}
                    <div
                        class="flex flex-col gap-2 transition-all w-full"
                    >
                        <Checkbox bind:checked={isSaveTokenEnabled} variant="yellow" align="start">
                            <div>
                                <span
                                    class="text-gray-600 dark:text-[#E0E0E0] group-hover:dark:text-[#FDFDFD] group-hover:text-black transition-colors cursor-pointer font-medium text-sm"
                                >
                                    {$t(
                                        platformTab === "android" ||
                                            platformTab === "pc-web" ||
                                            platformTab === "pc2" ||
                                            platformTab === "pc3"
                                            ? "import.save_label_token"
                                            : "import.save_label_url",
                                    )}
                                </span>
                                {#if isSaveTokenEnabled}
                                    <div
                                        class="text-gray-400 text-xs mt-1 max-w-md"
                                    >
                                        {$t(
                                            platformTab === "android" ||
                                                platformTab === "pc-web" ||
                                                platformTab === "pc2" ||
                                                platformTab === "pc3"
                                                ? "import.save_desc_token"
                                                : "import.save_desc_url",
                                        )}
                                    </div>
                                {/if}
                            </div>
                        </Checkbox>

                        {#if isSaveTokenEnabled}
                            <div class="pl-8 mb-1 relative">
                                <input
                                    type="text"
                                    bind:value={tokenName}
                                    placeholder={$t("import.token_name_placeholder")}
                                    class="w-full md:w-2/3 p-2.5 bg-gray-50 dark:bg-[#343434] dark:border-[#444444] dark:text-[#E0E0E0] border border-gray-200 focus:bg-white focus:border-[#FFE145] focus:dark:border-[#FFE145] rounded-md text-sm outline-none text-[#21272C] transition-all
            {isInputError && errorMsg === $t('import.error_token_name')
                ? '!border-red-500 bg-red-50'
                : ''}"
                                />

                                {#if isInputError && errorMsg === $t("import.error_token_name")}
                                    <div
                                        class="absolute -bottom-5 left-8 text-red-600 text-xs font-bold px-1 rounded animate-in fade-in slide-in-from-top-1"
                                    >
                                        {errorMsg}
                                    </div>
                                {/if}
                            </div>
                        {/if}
                    </div>
                {/if}

                {#if platformTab !== 'endmin' && platformTab !== 'toolsdev' && platformTab !== 'protorig' && platformTab !== 'trackmypulls'}
                    <Checkbox bind:checked={isGlobalStatsEnabled} variant="yellow" align="center">
                        <span
                            class="text-gray-600 dark:text-[#E0E0E0] group-hover:text-black group-hover:dark:text-[#FDFDFD] transition-colors cursor-pointer font-medium text-sm"
                        >
                            {$t("import.enableGlobalStats")}
                        </span>
                    </Checkbox>
                {/if}

                <Checkbox bind:checked={isRecoveryEnabled} variant="red" align="center">
                    <span
                        class="text-gray-600 dark:text-[#E0E0E0] group-hover:text-black group-hover:dark:text-[#FDFDFD] transition-colors cursor-pointer font-medium text-sm flex items-center gap-1.5"
                    >
                        {$t("import.recoveryStats")}
                        <Tooltip text={$t("import.recoveryTooltip")}>
                            <span
                                class="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 mt-0.5 inline-flex items-center"
                            >
                                <Icon name="info" class="m-1 w-4 h-4" />
                            </span>
                        </Tooltip>
                    </span>
                </Checkbox>

                {#if platformTab !== 'endmin' && platformTab !== 'toolsdev' && platformTab !== 'protorig' && platformTab !== 'trackmypulls'}
                    <div
                        class="w-fit mt-4 {isLoading
                            ? 'opacity-60 pointer-events-none cursor-not-allowed'
                            : ''}"
                    >
                        <Button
                            variant="yellow"
                            onClick={() => {
                                if (!isLoading) handleUrlImport();
                            }}
                            disabled={isLoading}
                        >
                            <div
                                slot="icon"
                                class="text-gray-800 dark:text-gray-800"
                            >
                                {#if isLoading}
                                    <Icon
                                        name="loading"
                                        class="w-4 h-4 animate-spin"
                                    />
                                {:else}
                                    <Icon
                                        name="import"
                                        class="w-[30px] h-[30px]"
                                    />
                                {/if}
                            </div>
                            <span>
                                {isLoading
                                    ? $t("import.importing")
                                    : $t("page.importBtn")}
                            </span>
                        </Button>
                    </div>
                {/if}
            </div>
        </div>

        {#if errorMsg && !isInputError}
            <div
                class="mt-5 p-4 bg-red-50 dark:text-red-300 text-red-600 dark:bg-[#902E2E] dark:border-[#444444] rounded-lg border border-red-100 flex items-center gap-2 animate-in fade-in slide-in-from-top-2"
            >
                <Icon name="close" class="w-5 h-5" />
                {errorMsg}
            </div>
        {/if}

        <ImportPreviewReport
            {previewReport}
            {isLoading}
            getBannerName={getBannerName}
            on:save={confirmSave}
        />
    </div>
</div>

<ConfirmationModal
    isOpen={isDeleteModalOpen}
    title={$t("import.delete_token_title")}
    description={$t("import.delete_confirm")}
    confirmText={$t("settings.account.delete")}
    isDestructive={true}
    on:confirm={confirmDeleteToken}
    on:close={cancelDeleteToken}
/>

<style>
    @media (max-width: 719px) {
        .no-scrollbar {
            scrollbar-width: none;
            -ms-overflow-style: none;
        }
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
    }

    @media (min-width: 720px) {
        .no-scrollbar::-webkit-scrollbar {
            height: 5px;
        }
        .no-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .no-scrollbar::-webkit-scrollbar-thumb {
            background: #d1d5db;
            border-radius: 9999px;
        }
        :global(.dark) .no-scrollbar::-webkit-scrollbar-thumb {
            background: #4b5563;
        }
        .no-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #9ca3af;
        }
        :global(.dark) .no-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #6b7280;
        }
    }
</style>
