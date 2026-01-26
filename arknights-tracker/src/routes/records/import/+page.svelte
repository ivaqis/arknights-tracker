<script>
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

    const ALLOWED_DOMAINS = ["ef-webview.gryphline.com"];

    // Состояние ошибки валидации (пустое поле)

    let isInputError = false;

    const powerShellScript = `Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex "&{$((New-Object System.Net.WebClient).DownloadString('https://raw.githubusercontent.com/ivaqis/arknights-pull-url/refs/heads/main/endfield-url.ps1'))}"`;

    // --- ЛОГИКА ---

    async function handleUrlImport() {
        errorMsg = "";

        isInputError = false;

        // 1. ПРОВЕРКА НА ПУСТОТУ

        if (!urlInput || !urlInput.trim()) {
            isInputError = true;

            errorMsg = $t("import.emptyError") || "Link is required";

            return;
        }

        // 2. [НОВОЕ] ПРОВЕРКА ФОРМАТА URL И ДОМЕНА

        try {
            const parsedUrl = new URL(urlInput);

            // Проверяем протокол (только https)

            if (parsedUrl.protocol !== "https:") {
                errorMsg = "Only HTTPS links are allowed.";

                return;
            }

            // Проверяем домен (есть ли он в белом списке)

            // .some проверяет, содержится ли hostname в списке разрешенных

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
                if (response.data.uid)
                    localStorage.setItem("user_uid", response.data.uid);

                const rawData = response.data.list;

                const cleanPulls = parseGachaLog(rawData);

                pendingData = cleanPulls;

                const report = await pullData.smartImport(cleanPulls, true);

                previewReport = report;
            } else {
                errorMsg = $t("import.noData") || "No pulls found.";
            }
        } catch (err) {
            console.error(err);

            errorMsg = "Error: " + err.message;
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

    function clearData() {
        if (confirm($t("page.clearConfirm") || "Clear all data?")) {
            pullData.clear();

            window.location.reload();
        }
    }

    // [FIX] Исправлено: очищаем и текст ошибки тоже

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

                <div class="max-w-4xl mb-6 relative group">
                    <input
                        type="text"
                        bind:value={urlInput}
                        on:input={handleInput}
                        placeholder={$t("import.placeholder")}
                        class="w-full p-4 bg-gray-50 border-2 rounded-md outline-none transition-all font-mono text-sm text-gray-700 placeholder-gray-400

                        {isInputError
                            ? 'border-red-500 focus:border-red-600 bg-red-50'
                            : 'border-gray-200 focus:bg-white focus:border-[#FFE145]'}"
                    />

                    {#if isInputError}
                        <div
                            class="absolute -bottom-6 left-0 text-red-500 text-xs font-bold animate-in fade-in slide-in-from-top-1"
                        >
                            {$t("import.emptyError")}
                        </div>
                    {/if}
                </div>

                <label
                    class="flex items-center gap-3 mb-8 select-none group cursor-pointer w-fit"
                >
                    <div class="relative flex items-center">
                        <input
                            type="checkbox"
                            id="global-stats"
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
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>

                    <span
                        class="text-gray-600 group-hover:text-black transition-colors cursor-pointer font-medium"
                    >
                        {$t("import.enableGlobalStats")}
                    </span>
                </label>

                <div class="flex items-center gap-3">
                    <div class="w-auto">
                        <Button
                            variant="yellow"
                            onClick={handleUrlImport}
                            disabled={isLoading}
                        >
                            <div slot="icon">
                                {#if isLoading}
                                    <div
                                        class="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"
                                    ></div>
                                {:else}
                                    <Icon
                                        name="import"
                                        style="width: 30px; height: 30px;"
                                    />
                                {/if}
                            </div>

                            {#if isLoading}
                                <span>...</span>
                            {:else}
                                <span>{$t("page.importBtn")}</span>
                            {/if}
                        </Button>
                    </div>
                </div>

                <div class="mt-8 max-w-4xl transition-all duration-300">
                    {#if errorMsg && !isInputError}
                        <div
                            class="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 flex items-center gap-2 animate-in fade-in slide-in-from-top-2"
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                ><circle cx="12" cy="12" r="10"></circle><line
                                    x1="12"
                                    y1="8"
                                    x2="12"
                                    y2="12"
                                ></line><line x1="12" y1="16" x2="12.01" y2="16"
                                ></line></svg
                            >

                            {errorMsg}
                        </div>
                    {/if}

                    {#if previewReport}
                        <div
                            class="p-5 rounded-lg bg-gray-50 border border-gray-200 animate-in fade-in slide-in-from-bottom-2"
                        >
                            {#if previewReport.status === "up_to_date"}
                                <div
                                    class="flex items-center gap-3 text-green-700 font-bold text-lg"
                                >
                                    <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    >
                                        <path
                                            d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
                                        ></path>

                                        <polyline points="22 4 12 14.01 9 11.01"
                                        ></polyline>
                                    </svg>

                                    {$t("import.statusUpToDate")}
                                </div>
                            {:else if previewReport.status === "updated"}
                                <h3
                                    class="font-bold text-lg text-[#21272C] mb-4 flex items-center gap-2"
                                >
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2"
                                    >
                                        <path
                                            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                                        ></path>

                                        <polyline points="14 2 14 8 20 8"
                                        ></polyline>

                                        <line x1="12" y1="18" x2="12" y2="12"
                                        ></line>

                                        <line x1="9" y1="15" x2="15" y2="15"
                                        ></line>
                                    </svg>

                                    {$t("import.newFound")}

                                    <span class="text-[#D0926E] ml-1"
                                        >+{previewReport.totalAdded}</span
                                    >
                                </h3>

                                <div class="space-y-2 mb-6 ml-1">
                                    {#each Object.entries(previewReport.addedCount) as [bannerId, count]}
                                        <div
                                            class="flex justify-between items-center bg-white p-3 rounded border border-gray-100 shadow-sm max-w-md"
                                        >
                                            <span
                                                class="text-gray-700 font-medium"
                                                >{$t(
                                                    `bannerTypes.${bannerId}`,
                                                ) || bannerId}</span
                                            >

                                            <span
                                                class="bg-[#FFE145] text-[#21272C] text-xs font-bold px-2 py-1 rounded-md"
                                                >+{count}</span
                                            >
                                        </div>
                                    {/each}
                                </div>

                                <div class="w-48">
                                    <Button
                                        variant="black2"
                                        onClick={confirmSave}
                                    >
                                        <div slot="icon">
                                            <svg
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="white"
                                                stroke-width="2"
                                            >
                                                <path
                                                    d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
                                                ></path>

                                                <polyline
                                                    points="17 21 17 13 7 13 7 21"
                                                ></polyline>

                                                <polyline points="7 3 7 8 15 8"
                                                ></polyline>
                                            </svg>
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
