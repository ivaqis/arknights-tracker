<script>
    import { onMount } from "svelte";
    import { user, checkSync } from "$lib/stores/cloudStore";
    import { get } from "svelte/store";
    import { t } from "$lib/i18n";
    import { goto } from "$app/navigation";
    import { pullData } from "$lib/stores/pulls";
    import { parseGachaLog } from "$lib/utils/importUtils";
    import { currentUid } from "$lib/stores/auth";
    import { accountStore } from "$lib/stores/accounts";
    import { API_BASE } from "$lib/api";

    import Button from "$lib/components/Button.svelte";
    import PowershellBlock from "$lib/components/PowershellBlock.svelte";
    import Tooltip from "$lib/components/Tooltip.svelte";
    import Icon from "$lib/components/Icons.svelte";
    import ConfirmationModal from "$lib/components/ConfirmationModal.svelte";

    let platformTab = "pc";
    let urlInput = "";
    let realImportUrl = "";
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
            if (raw) savedTokens = JSON.parse(raw);
        } catch (e) {
            console.error(e);
        }
    }

    function saveTokenToStorage(name, url) {
        try {
            if (savedTokens.some((t) => t.url === url)) return;
            const newToken = { name, url, date: Date.now() };
            const newList = [newToken, ...savedTokens];
            localStorage.setItem("ark_saved_tokens", JSON.stringify(newList));
            savedTokens = newList;
        } catch (e) {
            console.error(e);
        }
    }

    let isDeleteModalOpen = false;
    let tokenToDeleteIndex = null;

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
        realImportUrl = token.url;
        activeTab = "new";
        isSaveTokenEnabled = false;
        errorMsg = "";
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
            urlInput = rawValue;
            realImportUrl = rawValue;
            return;
        }
        let cleanToken = rawValue.trim();
        if (cleanToken.includes("token")) {
            try {
                const jsonMatch = cleanToken.match(/"token"\s*:\s*"([^"]+)"/);
                if (jsonMatch && jsonMatch[1]) cleanToken = jsonMatch[1];
                else {
                    if (
                        cleanToken.startsWith("'") ||
                        cleanToken.startsWith('"')
                    )
                        cleanToken = cleanToken.slice(1, -1);
                    const obj = JSON.parse(cleanToken);
                    if (obj.token) cleanToken = obj.token;
                }
            } catch (err) {
                cleanToken = cleanToken
                    .replace(/^{"token":"/, "")
                    .replace(/"}$/, "");
            }
        }
        if (!cleanToken) return;
        const encodedToken = encodeURIComponent(cleanToken);
        const baseUrl =
            "https://ef-webview.gryphline.com/page/gacha_weapon?pool_id=weaponbox_constant_2&u8_token=";
        const tail =
            "&platform=Android&channel=6&subChannel=6&lang=ru-ru&server=3";
        realImportUrl = baseUrl + encodedToken + tail;
        urlInput = cleanToken;
        e.target.value = cleanToken;
    }

    async function handleUrlImport() {
        errorMsg = "";
        isInputError = false;
        const urlToSend = realImportUrl || urlInput;

        if (!urlToSend || !urlToSend.trim()) {
            isInputError = true;
            errorMsg = $t("import.error_empty") || "Link or Token is required";
            return;
        }
        if (isSaveTokenEnabled && !tokenName.trim()) {
            const alreadyExists = savedTokens.some((t) => t.url === urlToSend);
            if (!alreadyExists) {
                isInputError = true;
                errorMsg =
                    $t("import.error_token_name") || "Token name required";
                return;
            }
        }

        isLoading = true;
        pendingData = null;

        previewReport = {
            status: "loading",
            totalAdded: 0,
            addedCount: {},
        };

        try {
            const response = await fetch(`${API_BASE}/import`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rawUrl: urlToSend }),
            });

            if (!response.ok && response.status !== 429) {
                throw new Error(`HTTP Error ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop();

                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const msg = JSON.parse(line);

                        console.log("Stream received:", msg);

                        if (msg.type === "progress") {
                            const { poolId, count } = msg;
                            console.log(`Live Import: ${poolId} +${count}`);

                            const currentPoolCount =
                                previewReport.addedCount[poolId] || 0;
                            previewReport.totalAdded += count;

                            previewReport.addedCount = {
                                ...previewReport.addedCount,
                                [poolId]: currentPoolCount + count,
                            };

                            previewReport = previewReport;

                            await new Promise((r) => setTimeout(r, 0));
                        } else if (msg.type === "complete") {
                            console.log("Import Complete!");
                            await handleImportComplete(msg.data, urlToSend);
                        } else if (msg.type === "error") {
                            throw new Error(msg.message);
                        }
                    } catch (e) {
                        console.error("Stream parse error:", e);
                    }
                }
            }
        } catch (err) {
            console.error("Import Error:", err);
            errorMsg = err.message || "Unknown Error";
            previewReport = null;
        } finally {
            isLoading = false;
        }
    }

    async function handleImportComplete(data, urlToSend) {
        const importedUid = data.uid;
        const backendServerId = data.serverId;

        if (importedUid) {
            const accounts = get(accountStore.accounts);
            const selectedId = get(accountStore.selectedId);
            const currentAcc = accounts.find((a) => a.id === selectedId);

            const currentPullData = get(pullData);
            let hasPulls = false;

            if (currentPullData) {
                for (const key of Object.keys(currentPullData)) {
                    if (currentPullData[key]?.pulls?.length > 0) {
                        hasPulls = true;
                        break;
                    }
                }
            }

            const isUidMatch =
                currentAcc &&
                String(currentAcc.serverUid) === String(importedUid);

            const shortUid =
                importedUid.length > 4 ? importedUid.slice(-4) : importedUid;
            const newSmartName = `Account ${shortUid}`;

            if (!hasPulls || isUidMatch) {
                if (accountStore.updateAccount && currentAcc) {
                    const shouldRename =
                        currentAcc.name === "Main Account" ||
                        currentAcc.name.startsWith("Account") ||
                        currentAcc.name.startsWith("Doctor");

                    const nameToSet = shouldRename
                        ? newSmartName
                        : currentAcc.name;

                    accountStore.updateAccount(currentAcc.id, {
                        uid: importedUid,
                        serverId: backendServerId,
                        name: nameToSet,
                    });
                }
            } else {
                const existingAccount = accounts.find(
                    (a) => String(a.serverUid) === String(importedUid),
                );

                if (existingAccount) {
                    accountStore.selectAccount(existingAccount.id);
                } else {
                    accountStore.addAccount(
                        importedUid,
                        newSmartName,
                        backendServerId,
                    );
                }
            }
        }

        if (isSaveTokenEnabled && tokenName.trim()) {
            saveTokenToStorage(tokenName.trim(), urlToSend);
        }

        const rawData = data.list;
        const cleanPulls = parseGachaLog(rawData);
        pendingData = cleanPulls;

        const report = await pullData.smartImport(
            cleanPulls,
            backendServerId,
            false,
        );
        previewReport = report;
    }

    async function confirmSave() {
        if (!pendingData) return;
        isLoading = true;
        try {
            const accounts = get(accountStore.accounts);
            const selectedId = get(accountStore.selectedId);

            const currentAcc = accounts.find((a) => a.id === selectedId);
            const sId = currentAcc?.serverId || "3";

            await pullData.smartImport(pendingData, sId, true);

            goto("/records");
        } catch (err) {
            console.error(err);
            errorMsg = err.message;
            isLoading = false;
        }
    }

    function cancelImport() {
        pendingData = null;
        previewReport = null;
        urlInput = "";
        realImportUrl = "";
    }

    function handleInput() {}
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
            class="font-sdk text-5xl tracking-wide text-[#21272C] dark:text-[#FDFDFD] flex items-center gap-3"
        >
            {$t("import.title")}
        </h2>
    </div>

    <div
        class="bg-white p-8 md:p-12 rounded-xl dark:bg-[#383838] dark:border-[#444444] shadow-sm border border-gray-100 relative min-h-[400px]"
    >
        <div
            class="flex items-end gap-0 border-b border-gray-200 dark:border-[#444444] w-full mb-8 overflow-x-auto custom-tab-scroll"
        >
            {#each [{ id: "pc", label: $t("import.tab_pc") }, { id: "pc2", label: $t("import.tab_pc2") }, { id: "pc-manual", label: $t("import.tab_pc_manual") }, { id: "android", label: $t("import.tab_android") }, { id: "ios", label: $t("import.tab_ios") }] as tab}
                <button
                    class="px-6 py-3 text-sm font-bold transition-all relative border-b-2 whitespace-nowrap
                    {platformTab === tab.id
                        ? 'text-[#21272C] border-[#FFE145] dark:text-[#FDFDFD]'
                        : 'text-gray-400 hover:text-gray-600 border-transparent hover:bg-gray-50 hover:dark:bg-[#424242] dark:text-[#B7B6B3]'}"
                    on:click={() => (platformTab = tab.id)}
                >
                    {tab.label}
                </button>
            {/each}
        </div>

        <div class="bg-white dark:bg-[#343434] border border-gray-200 dark:border-[#444444] rounded-xl p-5 mb-3 shadow-sm">
    <div class="flex items-start gap-4">
        <div class="mt-0.5 text-[#FACC15] shrink-0">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </div>
        <div class="flex-1">
            <h3 class="text-gray-800 dark:text-[#E0E0E0] font-bold text-base uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-[#444] pb-2">
                {$t("import.faq_security_title") || "FAQ: Безопасность аккаунта"}
            </h3>

            <div class="mb-4">
                <h4 class="font-bold text-[#21272C] dark:text-[#FDFDFD] mb-1 text-sm">
                    {$t("import.faq_q1") || "Опасно ли использовать скрипты?"}
                </h4>
                <p class="text-sm text-gray-600 dark:text-[#B7B6B3] leading-relaxed">
                    {@html $t("import.faq_security_desc1") || "Передача токенов авторизации сторонним сайтам и выполнение PowerShell скриптов всегда несет риски."}
                </p>
            </div>

            <div class="mb-4">
                <h4 class="font-bold text-[#21272C] dark:text-[#FDFDFD] mb-1 text-sm">
                    {$t("import.faq_q2") || "Опасен ли Goyfield.moe?"}
                </h4>
                <p class="text-sm text-gray-600 dark:text-[#B7B6B3] leading-relaxed">
                    {@html $t("import.faq_security_desc2") || '<strong>Goyfield.moe</strong> никогда не сохраняет вашу личную информацию, такую как токены и ссылки. Ваш токен обрабатывается только для получения наймов и никогда не сохраняется. Если у вас есть какие-либо беспокойства на счет PowerShell скрипта, используйте метод "PC 2", который получает токен встроенными средствами PowerShell через regex.'}
                </p>
            </div>

            <div class="mb-5 text-sm text-gray-500 dark:text-[#999] bg-gray-50 dark:bg-[#2C2C2C] border-l-2 border-[#FACC15] p-3 rounded-r-lg">
                <span class="font-bold text-gray-700 dark:text-[#E0E0E0]">{$t("import.note") || "Note"}:</span> 
                {@html $t("import.faq_security_desc3") || "Для запуска скриптов PowerShell <strong>не требуется</strong> запуск PowerShell с правами администратора."}
            </div>

            <div class="bg-red-50 dark:bg-red-500/10 rounded-lg p-3 border border-red-100 dark:border-red-500/20">
                <p class="text-xs font-bold text-red-600 dark:text-red-400 flex items-start gap-2 m-0">
                    <span class="text-base leading-none text-red-600 dark:text-red-400 mt-0.5">
                        <Icon name="warning" class="w-4 h-4" />
                    </span>
                    <span class="leading-relaxed">
                        {@html $t("import.faq_security_warning").replace(
                            "{link}",
                            "https://www.reddit.com/r/Endfield/comments/1rjx5v6/endfieldrecords_dot_com_pull_tracker_malware/"
                        ) || `Если вы пользовались сайтом <strong>Endfieldrecords</strong>, то немедленно поменяйте пароль в игре и проследуйте <a href="https://www.reddit.com/r/Endfield/comments/1rjx5v6/endfieldrecords_dot_com_pull_tracker_malware/" target="_blank" class="underline">гайду на Reddit</a> для проверки своего компьютера.`}
                    </span>
                </p>
            </div>
        </div>
    </div>
</div>
        {#if platformTab === "android"}
            <div
                class="mb-4 p-4 bg-yellow-50 dark:bg-yellow-600/30 border border-yellow-100 dark:border-yellow-500/20 rounded-lg flex items-start gap-3 transition-colors"
            >
                <div
                    class="text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0"
                >
                    <Icon name="info" style="width: 20px; height: 20px;" />
                </div>

                <div
                    class="text-sm text-red-900 dark:text-red-100 leading-relaxed font-medium"
                >
                    {@html $t("import.android_note")}
                </div>
            </div>
        {/if}

        <div class="ml-2 pt-2">
            {#if platformTab === "ios"}
                {#each [{ text: $t("import.ios_step1") }, { text: $t("import.ios_step2") }, { text: $t("import.ios_step3"), subList: [$t("import.ios_step3_1"), $t("import.ios_step3_2"), $t("import.ios_step3_3")] }, { text: $t("import.ios_step4") }, { text: $t("import.ios_step5") }, { text: $t("import.ios_step6") }, { text: $t("import.ios_step7") }, { text: $t("import.ios_step8") }, { text: $t("import.ios_step9") }, { text: $t("import.ios_step10") }, { text: $t("import.ios_step11") }] as step, i}
                    <div
                        class="relative border-l-2 border-gray-200 dark:border-[#FDFD1F]/50 pb-10 pl-10 last:border-transparent last:pb-0"
                    >
                        <div
                            class="absolute -left-[21px] top-0 w-10 h-10 rounded-full bg-[#FFE145] border-2 border-[#FFE145] shadow-sm flex items-center justify-center font-sdk font-bold text-xl text-[#21272C] z-10"
                        >
                            {i + 1}
                        </div>
                        <div
                            class="text-lg text-[#21272C] dark:text-[#E0E0E0] pt-1 font-medium leading-relaxed max-w-4xl"
                        >
                            {@html step.text}
                            {#if step.subList}
                                <ul
                                    class="list-disc pl-5 mt-3 space-y-2 text-gray-600 text-base dark:border-[#444444] dark:bg-[#343434] dark:text-[#E0E0E0] bg-gray-50 p-4 rounded-lg border border-gray-100"
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
                        12
                    </div>
                    <p
                        class="text-lg text-[#21272C] dark:text-[#E0E0E0] font-medium mb-4 pt-1"
                    >
                        {$t("import.ios_step12")}
                    </p>

                    <div class="mb-6"></div>
                </div>
            {:else if platformTab === "android"}
                {#each [{ text: $t("import.android_s1") }, { text: $t("import.android_s2") }, { text: $t("import.android_s3"), subList: [$t("import.android_s3_sub1"), $t("import.android_s3_sub2"), $t("import.android_s3_sub3")] }, { text: $t("import.android_s4") }, { text: $t("import.android_s5") }, { text: $t("import.android_s6") }, { text: $t("import.android_s7") }, { text: $t("import.android_s8") }, { text: $t("import.android_s9") }, { text: $t("import.android_s10") }] as step, i}
                    <div
                        class="relative dark:border-[#FDFD1F]/50 border-l-2 border-gray-200 pb-10 pl-10 last:border-transparent"
                    >
                        <div
                            class="absolute -left-[21px] top-0 w-10 h-10 rounded-full bg-[#FFE145] border-2 border-[#FFE145] shadow-sm flex items-center justify-center font-sdk font-bold text-xl text-[#21272C] z-10"
                        >
                            {i + 1}
                        </div>
                        <div
                            class="text-lg text-[#21272C] dark:text-[#E0E0E0] pt-1 font-medium leading-relaxed max-w-4xl"
                        >
                            {@html step.text}
                            {#if step.subList}
                                <ul
                                    class="list-disc pl-5 mt-3 space-y-2 dark:text-[#E0E0E0] text-gray-600 text-sm bg-gray-50 dark:bg-[#343434] dark:border-[#444444] p-4 rounded-lg border border-gray-100"
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
                        11
                    </div>
                    <p
                        class="text-lg text-[#21272C] dark:text-[#E0E0E0] font-medium mb-4 pt-1"
                    >
                        {$t("import.android_s11")}
                    </p>
                </div>
            {:else}
                <div
                    class="relative border-l-2 dark:border-[#FDFD1F]/50 border-gray-200 pb-10 pl-10"
                >
                    <div
                        class="absolute -left-[21px] top-0 w-10 h-10 rounded-full bg-[#FFE145] border-2 border-[#FFE145] shadow-sm flex items-center justify-center font-sdk font-bold text-xl text-[#21272C] z-10"
                    >
                        1
                    </div>
                    <p
                        class="text-lg text-[#21272C] dark:text-[#E0E0E0] font-medium pt-1"
                    >
                        {$t("import.step1")}
                    </p>
                </div>

                <div
                    class="relative border-l-2 dark:border-[#FDFD1F]/50 border-gray-200 pb-8 pl-10"
                >
                    <div
                        class="absolute -left-[21px] top-0 w-10 h-10 rounded-full bg-[#FFE145] border-2 border-[#FFE145] shadow-sm flex items-center justify-center font-sdk font-bold text-xl text-[#21272C] z-10"
                    >
                        2
                    </div>

                    {#if platformTab === "pc"}
                        <div
                            class="text-lg dark:text-[#E0E0E0] text-[#21272C] mb-4 pt-1 font-medium leading-relaxed"
                        >
                            {$t("import.step2_pre")}
                            <span class="inline-block">
                                <Tooltip
                                    text={$t("import.ps_tooltip")}
                                    class="justify-center"
                                >
                                    <span
                                        class="font-bold text-black dark:text-[#E0E0E0] border-b-2 border-[#FFE145] hover:bg-[#FFE145] hover:dark:text-[#373737] transition-colors px-1"
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
                                class="inline-flex items-center gap-1.5 text-sm text-gray-400 dark:text-[#B7B6B3] hover:text-black hover:dark:text-[#E4E4E4] transition-colors group"
                            >
                                <span
                                    class="underline decoration-gray-300 dark:decoration-[#B7B6B3] group-hover:decoration-black group-hover:dark:decoration-[#E4E4E4] group-hover:dark:text-[#E4E4E4] transition-all"
                                >
                                    {$t("import.script_details")}
                                </span>
                                <div
                                    class="text-gray-400 dark:text-[#B7B6B3] group-hover:text-black group-hover:dark:dark:text-[#E4E4E4] transition-colors"
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
                            class="text-lg dark:text-[#E0E0E0] text-[#21272C] mb-4 pt-1 font-medium leading-relaxed"
                        >
                            {$t("import.step2_pre")}
                            <span class="inline-block">
                                <Tooltip
                                    text={$t("import.ps_tooltip")}
                                    class="justify-center"
                                >
                                    <span
                                        class="font-bold text-black dark:text-[#E0E0E0] border-b-2 border-[#FFE145] hover:bg-[#FFE145] hover:dark:text-[#373737] transition-colors px-1"
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
                            class="text-lg dark:text-[#E0E0E0] text-[#21272C] pt-1 font-medium leading-relaxed max-w-4xl"
                        >
                            {$t("import.manual_text_pre")}
                            <span
                                class="bg-gray-100 px-1.5 py-0.5 rounded dark:bg-[#343434] dark:border-[#444444] dark:text-[#E0E0E0] text-sm font-mono text-gray-600 border border-gray-200 select-all break-all whitespace-normal inline-block my-1"
                                >%userprofile%\AppData\LocalLow\Gryphline\Endfield\sdklogs\HGWebview.log</span
                            >
                            {$t("import.manual_text_mid")}
                            <span
                                class="text-gray-500 italic break-all dark:bg-[#343434] dark:border-[#444444] dark:text-[#E0E0E0] whitespace-normal block my-2 bg-gray-50 p-2 rounded border border-gray-100 text-sm"
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
                    <p
                        class="text-lg text-[#21272C] dark:text-[#E0E0E0] font-medium mb-4 pt-1"
                    >
                        {$t("import.step3")}
                    </p>
                </div>
            {/if}

            <div class="mb-6 {platformTab === 'ios' ? '' : 'pl-10'}">
                <div
                    class="flex items-end gap-0 border-b border-gray-200 dark:border-[#444444] w-full max-w-4xl mb-6"
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
                        <div class="relative">
                            <input
                                type="text"
                                value={urlInput}
                                on:input={handleInputProcessing}
                                placeholder={platformTab === "android"
                                    ? $t("import.placeholder_token") ||
                                      "Paste Token here"
                                    : $t("import.placeholder_url") ||
                                      "Paste Link here"}
                                class="w-full p-4 bg-gray-50 border-2 border-gray-100 dark:bg-[#343434] dark:border-[#444444] dark:text-[#E0E0E0] focus:bg-white focus:border-[#FFE145] focus:dark:border-[#FFE145] rounded-md outline-none transition-all font-mono text-xs md:text-sm text-gray-700 placeholder-gray-400
                {isInputError &&
                                errorMsg !== $t('import.error_token_name') &&
                                errorMsg !==
                                    'Token name is required for saving.'
                                    ? '!border-red-500 bg-red-50'
                                    : ''}"
                            />

                            <div
                                class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
                            >
                                {#if platformTab === "android" && urlInput.startsWith("Token_")}
                                    <Icon
                                        name="check"
                                        style="width: 16px; height: 16px; color: green;"
                                    />
                                {:else}
                                    <div
                                        class="bg-gray-50/90 dark:bg-[#343434]/80 p-1 rounded-lg"
                                    >
                                        <Icon
                                            name="link"
                                            style="width: 16px; height: 16px;"
                                        />
                                    </div>
                                {/if}
                            </div>
                        </div>

                        {#if isInputError && errorMsg !== $t("import.error_token_name") && errorMsg !== "Token name is required for saving."}
                            <div
                                class="absolute -bottom-6 left-0 text-red-600 text-xs font-bold px-2 py-1 rounded animate-in fade-in slide-in-from-top-1"
                            >
                                {errorMsg}
                            </div>
                        {/if}
                    </div>
                {:else}
                    <div class="max-w-4xl mb-2 min-h-[100px]">
                        {#if savedTokens.length === 0}
                            <div
                                class="flex flex-col items-center justify-center py-6 border-2 dark:border-[#444444] dark:text-[#B7B6B3] border-dashed border-gray-200 rounded-lg text-gray-400"
                            >
                                <Icon
                                    name="archive"
                                    style="width: 32px; height: 32px; opacity: 0.5;"
                                />
                                <span class="mt-2 text-sm font-medium"
                                    >{$t("import.no_saved_tokens")}</span
                                >
                            </div>
                        {:else}
                            <div class="grid gap-3 pb-3">
                                {#each savedTokens as token, i}
                                    <div
                                        class="group relative flex items-center justify-between p-4 bg-white border border-gray-200 dark:bg-[#343434] dark:border-[#444444] hover:border-[#FFE145] hover:border-[#FFE145] hover:shadow-sm transition-all text-left rounded-md overflow-hidden"
                                    >
                                        <button
                                            type="button"
                                            class="absolute inset-0 w-full h-full z-0 cursor-pointer focus:outline-none"
                                            on:click={() => selectToken(token)}
                                            aria-label="Select {token.name}"
                                        ></button>
                                        <div
                                            class="pl-2 relative z-10 pointer-events-none"
                                        >
                                            <div
                                                class="font-bold text-[#21272C] dark:text-[#E0E0E0] text-lg font-sdk"
                                            >
                                                {token.name}
                                            </div>
                                            <div
                                                class="text-xs text-gray-400 dark:text-[#B7B6B3] font-mono mt-1 truncate max-w-[250px] md:max-w-[400px]"
                                            >
                                                {token.url}
                                            </div>
                                            <div
                                                class="text-[10px] text-gray-400 dark:text-[#B7B6B3] mt-2 font-medium"
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
                                                    requestDeleteToken(i)}
                                            >
                                                <Icon
                                                    name="close"
                                                    style="width: 18px; height: 18px;"
                                                />
                                            </button>
                                        </div>
                                    </div>
                                {/each}
                            </div>
                        {/if}
                    </div>
                {/if}

                <div class="flex flex-col gap-4 mt-2 max-w-4xl items-start">
                    {#if activeTab === "new"}
                        <div class="flex flex-col gap-2 transition-all w-full">
                            <label
                                class="flex items-start gap-3 select-none group cursor-pointer w-fit"
                            >
                                <div class="relative flex items-center mt-0.5">
                                    <input
                                        type="checkbox"
                                        bind:checked={isSaveTokenEnabled}
                                        class="peer w-5 h-5 cursor-pointer appearance-none rounded border-2 border-gray-300 bg-white checked:border-[#FFE145] checked:bg-[#FFE145] transition-all"
                                    />
                                    <svg
                                        class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#21272C] opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="4"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    >
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                                <div>
                                    <span
                                        class="text-gray-600 dark:text-[#E0E0E0] group-hover:dark:text-[#FDFDFD] group-hover:text-black transition-colors cursor-pointer font-medium text-sm"
                                    >
                                        {$t(
                                            platformTab === "android"
                                                ? "import.save_label_token"
                                                : "import.save_label_url",
                                        )}
                                    </span>
                                    {#if isSaveTokenEnabled}
                                        <div
                                            class="text-gray-400 text-xs mt-0.5 max-w-md"
                                        >
                                            {$t(
                                                platformTab === "android"
                                                    ? "import.save_desc_token"
                                                    : "import.save_desc_url",
                                            )}
                                        </div>
                                    {/if}
                                </div>
                            </label>
                            {#if isSaveTokenEnabled}
                                <div class="pl-8 mb-3 relative">
                                    <input
                                        type="text"
                                        bind:value={tokenName}
                                        placeholder={$t(
                                            "import.token_name_placeholder",
                                        )}
                                        class="w-full md:w-2/3 p-2.5 bg-gray-50 dark:bg-[#343434] dark:border-[#444444] dark:text-[#E0E0E0] border border-gray-200 focus:bg-white focus:border-[#FFE145] focus:dark:border-[#FFE145] rounded-md text-sm outline-none text-[#21272C] transition-all
                    {isInputError &&
                                        (errorMsg ===
                                            $t('import.error_token_name') ||
                                            errorMsg ===
                                                'Token name is required for saving.')
                                            ? '!border-red-500 bg-red-50'
                                            : ''}"
                                    />

                                    {#if isInputError && (errorMsg === $t("import.error_token_name") || errorMsg === "Token name is required for saving.")}
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

                    <label
                        class="flex items-center gap-3 select-none group cursor-pointer w-fit"
                    >
                        <div class="relative flex items-center">
                            <input
                                type="checkbox"
                                bind:checked={isGlobalStatsEnabled}
                                class="peer w-5 h-5 cursor-pointer appearance-none rounded border-2 border-gray-300 bg-white checked:border-[#FFE145] checked:bg-[#FFE145] transition-all"
                            />
                            <svg
                                class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#21272C] opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="4"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <span
                            class="text-gray-600 dark:text-[#E0E0E0] group-hover:text-black group-hover:dark:text-[#FDFDFD] transition-colors cursor-pointer font-medium text-sm"
                        >
                            {$t("import.enableGlobalStats")}
                        </span>
                    </label>

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
                                        style="width: 30px; height: 30px;"
                                    />
                                {/if}
                            </div>
                            <span>
                                {isLoading
                                    ? $t("import.importing") || "Scanning..."
                                    : $t("page.importBtn")}
                            </span>
                        </Button>
                    </div>
                </div>
            </div>

            {#if errorMsg && !isInputError}
                <div
                    class="mt-5 p-4 bg-red-50 dark:text-red-300 text-red-600 dark:bg-[#902E2E] dark:border-[#444444] rounded-lg border border-red-100 flex items-center gap-2 animate-in fade-in slide-in-from-top-2"
                >
                    <Icon name="close" style="width: 20px; height: 20px;" />
                    {errorMsg}
                </div>
            {/if}

            {#if previewReport}
                <div
                    class="mt-5 p-5 rounded-lg bg-gray-50 dark:bg-[#343434] dark:border-[#444444] border border-gray-200 animate-in fade-in slide-in-from-bottom-2"
                >
                    {#if previewReport.status === "up_to_date"}
                        <div
                            class="flex items-center gap-3 dark:text-green-500 text-green-600 font-bold text-lg"
                        >
                            <Icon
                                name="check"
                                style="width: 24px; height: 24px;"
                            />
                            {$t("import.statusUpToDate")}
                        </div>
                    {:else}
                        <h3
                            class="font-bold text-lg gap-4 dark:text-[#E0E0E0] text-[#21272C] mb-4 flex items-center gap-2"
                        >
                            {#if isLoading}
                                <span class="relative flex h-3 w-3 mr-1">
                                    <span
                                        class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D0926E] opacity-75"
                                    ></span>
                                    <span
                                        class="relative inline-flex rounded-full h-3 w-3 bg-[#D0926E]"
                                    ></span>
                                </span>
                                {$t("import.processing") ||
                                    "Scanning Servers..."}
                            {:else}
                                <Icon
                                    name="import"
                                    style="width: 20px; height: 20px;"
                                />
                                {$t("import.newFound")}
                            {/if}

                            <span class="text-[#D0926E] ml-1"
                                >+{previewReport.totalAdded}</span
                            >
                        </h3>

                        <div class="space-y-2 mb-3 ml-1">
                            {#each Object.entries(previewReport.addedCount) as [bannerId, count]}
                                <div
                                    class="flex justify-between dark:bg-[#373737] dark:border-[#444444] items-center bg-white p-3 rounded border border-gray-100 shadow-sm max-w-md transition-all duration-300"
                                >
                                    <span
                                        class="text-gray-700 dark:text-[#E0E0E0] font-medium flex items-center gap-2"
                                    >
                                        {$t(`bannerTypes.${bannerId}`) ||
                                            bannerId}
                                    </span>
                                    <span
                                        class="bg-[#FFE145] text-[#21272C] text-xs font-bold px-2 py-1 rounded-md transition-all"
                                    >
                                        +{count}
                                    </span>
                                </div>
                            {/each}

                            {#if isLoading && Object.keys(previewReport.addedCount).length === 0}
                                <div class="text-sm text-gray-500 italic ml-2">
                                    {$t("import.waiting_response") ||
                                        "Waiting for response..."}
                                </div>
                            {/if}
                        </div>

                        {#if !isLoading}
                            <div
                                class="w-48 animate-in fade-in zoom-in duration-300"
                            >
                                <Button variant="black2" onClick={confirmSave}>
                                    <div slot="icon">
                                        <Icon
                                            name="save"
                                            class="w-4 h-4 text-white"
                                        />
                                    </div>
                                    {$t("buttons.saveBtn") || "Save"}
                                </Button>
                            </div>
                        {/if}
                    {/if}
                </div>
            {/if}
        </div>
    </div>
</div>
<ConfirmationModal
    isOpen={isDeleteModalOpen}
    title={$t("import.delete_token_title") || "Delete Token"}
    description={$t("import.delete_confirm") ||
        "Are you sure you want to delete this saved token?"}
    confirmText={$t("settings.account.delete") || "Delete"}
    isDestructive={true}
    on:confirm={confirmDeleteToken}
    on:close={cancelDeleteToken}
/>

<style>
    .custom-tab-scroll {
        scrollbar-width: thin;
        scrollbar-color: #cbd5e1 transparent;
    }
    :global(.dark) .custom-tab-scroll {
        scrollbar-color: #525252 transparent;
    }

    .custom-tab-scroll::-webkit-scrollbar {
        height: 4px;
    }

    .custom-tab-scroll::-webkit-scrollbar-track {
        background: transparent;
    }

    .custom-tab-scroll::-webkit-scrollbar-thumb {
        background-color: #e2e8f0;
        border-radius: 10px;
    }

    .custom-tab-scroll::-webkit-scrollbar-thumb:hover {
        background-color: #cbd5e1;
    }

    :global(.dark) .custom-tab-scroll::-webkit-scrollbar-thumb {
        background-color: #404040;
    }

    :global(.dark) .custom-tab-scroll::-webkit-scrollbar-thumb:hover {
        background-color: #525252;
    }
</style>
