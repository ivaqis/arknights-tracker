<script>
    import { t } from "$lib/i18n";
    import { get } from "svelte/store";
    import { browser } from "$app/environment";
    import { onMount } from "svelte";
    import { accountStore } from "$lib/stores/accounts";
    import { pullData } from "$lib/stores/pulls";
    import { analytics } from "$lib/firebase";
    import { logEvent } from "firebase/analytics";
    import { currentUid } from "$lib/stores/auth";
    import { fade } from "svelte/transition";
    import { onDestroy } from "svelte";
    import { disableDarkening } from "$lib/stores/settings";
    import { addNotification } from "$lib/stores/notifications";
    import { currentLocale, currentUiLocale } from "$lib/stores/locale";
    import { ctrlForZoom } from "$lib/stores/dragPlateSettings.js";

    import Select from "$lib/components/Select.svelte";
    import Checkbox from "$lib/components/Checkbox.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import Tooltip from "$lib/components/Tooltip.svelte";
    import Button from "$lib/components/Button.svelte";
    import ConfirmationModal from "$lib/components/modals/ConfirmationModal.svelte";
    import SyncModal from "$lib/components/modals/SyncModal.svelte";

    let isEmailVisible = false;
    let emailTimer;

    function handleEmailClick() {
        isEmailVisible = !isEmailVisible;
        if (isEmailVisible) clearTimeout(emailTimer);
    }

    function handleEmailLeave() {
        if (isEmailVisible) {
            emailTimer = setTimeout(() => {
                isEmailVisible = false;
            }, 1500);
        }
    }

    function handleEmailEnter() {
        clearTimeout(emailTimer);
    }

    function trackClick() {
        if (analytics) {
            logEvent(analytics, "button_click");
        }
    }

    function toggleDarkening() {
        disableDarkening.update((v) => !v);
    }

    function toggleDragPlateMode() {
        ctrlForZoom.update((v) => !v);
    }

    import {
        user,
        login,
        logout,
        syncStatus,
        checkSync,
        uploadLocalData,
        initAuth,
    } from "$lib/stores/cloudStore";

    const { accounts, selectedId } = accountStore;

    function handleVisibilityChange() {
        if (
            document.visibilityState === "visible" &&
            $user &&
            $syncStatus !== "checking"
        ) {
            console.log("Tab active, checking cloud...");
            checkSync($user);
        }
    }

    let currentServerId = "3";

    const serverOptions = [
        { value: "3", label: "Americas/Europe" },
        { value: "2", label: "Asia" },
    ];

    let showServerTime = false;
    let isInitialized = false;

    $: if (isInitialized && browser) {
        localStorage.setItem("show_server_time", showServerTime.toString());
    }

    onMount(() => {
        initAuth();
        if (typeof window !== "undefined") {
            const savedServer = localStorage.getItem("ark_server_id");
            if (savedServer) {
                currentServerId = savedServer;
            } else {
                localStorage.setItem("ark_server_id", "3");
            }
        }
        if (browser) {
            const savedTimePref = localStorage.getItem("show_server_time");
            if (savedTimePref !== null) {
                showServerTime = savedTimePref === "true";
            }
            isInitialized = true;
        }
    });

    function handleServerChange(e) {
        const newServerId = e.detail;
        currentServerId = newServerId;

        if (typeof window !== "undefined") {
            localStorage.setItem("ark_server_id", newServerId);
        }
    }

    function handleSync() {
        if ($syncStatus === "synced" || $syncStatus === "local_newer") {
            uploadLocalData();
        } else {
            checkSync($user);
        }
    }

    let lastSyncDate = "";
    $: if ($syncStatus && $currentUiLocale && typeof window !== "undefined") {
        const ts = parseInt(localStorage.getItem("ark_last_sync") || "0");
        if (ts > 0) {
            try {
                lastSyncDate = new Intl.DateTimeFormat($currentUiLocale, {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                }).format(new Date(ts));
            } catch (e) {
                lastSyncDate = new Date(ts).toLocaleString();
            }
        } else {
            lastSyncDate = "-";
        }
    }

    $: maskedName = $user?.displayName
        ? $user.displayName.substring(
              0,
              Math.ceil($user.displayName.length / 2),
          ) + "***"
        : "";

    let fileInputJson;
    let showImportFullModal = false;
    let showImportPullsModal = false;
    let importedJsonData = null;

    function handleExportBackup() {
        try {
            const currentAccounts = get(accounts);
            const currentSelectedId = get(selectedId);

            const fullBackup = {
                type: "ark_tracker_full_backup",
                version: 1,
                timestamp: new Date().toISOString(),
                meta: {
                    accounts: currentAccounts,
                    selectedId: currentSelectedId,
                },
                data: {},
            };

            currentAccounts.forEach((acc) => {
                const key = `ark_tracker_data_${acc.id}`;
                const rawData = localStorage.getItem(key);
                if (rawData) {
                    try {
                        fullBackup.data[acc.id] = JSON.parse(rawData);
                    } catch (e) {
                        console.error(
                            `Error exporting data for account ${acc.id}`,
                            e,
                        );
                        fullBackup.data[acc.id] = {
                            standard: { pulls: [], stats: {} },
                        };
                    }
                } else {
                    fullBackup.data[acc.id] = null;
                }
            });

            const dataStr =
                "data:text/json;charset=utf-8," +
                encodeURIComponent(JSON.stringify(fullBackup, null, 2));
            const downloadAnchorNode = document.createElement("a");
            downloadAnchorNode.setAttribute("href", dataStr);
            const date = new Date().toISOString().slice(0, 10);
            downloadAnchorNode.setAttribute(
                "download",
                `Goyfield_FullBackup_${date}.json`,
            );
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();

            addNotification("success", $t("settings.backup.success_export"));
        } catch (err) {
            console.error("Backup export failed:", err);
            addNotification("error", $t("settings.backup.error_export"));
        }
    }

    function handleImportBackup() {
        fileInputJson.click();
    }

    function handleFileChangeJson(event) {
        const file = event.target.files[0];
        if (!file) return;

        const MAX_SIZE = 10 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            addNotification("error", $t("settings.backup.error_too_large"));
            event.target.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const json = JSON.parse(e.target.result);
                if (!json || typeof json !== "object")
                    throw new Error("Invalid JSON structure: not an object");

                importedJsonData = json;

                if (
                    json.type === "ark_tracker_full_backup" &&
                    json.data &&
                    json.meta
                ) {
                    showImportFullModal = true;
                } else {
                    const isPullData =
                        json.standard ||
                        json.special ||
                        json["wish-counter-standard-pool"] ||
                        Array.isArray(json);
                    if (isPullData) {
                        showImportPullsModal = true;
                    } else {
                        addNotification("error", $t("settings.backup.error_invalid_format"));
                        importedJsonData = null;
                    }
                }
            } catch (error) {
                console.error(error);
                addNotification("error", $t("settings.backup.error_parse").replace("{error}", error.message));
                importedJsonData = null;
            }
        };
        reader.onerror = () => {
            addNotification("error", $t("settings.backup.error_read"));
            importedJsonData = null;
        };
        reader.readAsText(file);
        event.target.value = "";
    }

    async function confirmImportFull() {
        showImportFullModal = false;
        if (!importedJsonData) return;

        try {
            Object.entries(importedJsonData.data).forEach(
                ([accId, accData]) => {
                    if (accData)
                        localStorage.setItem(
                            `ark_tracker_data_${accId}`,
                            JSON.stringify(accData),
                        );
                },
            );
            accountStore.accounts.set(importedJsonData.meta.accounts);
            if (importedJsonData.meta.selectedId)
                accountStore.selectAccount(importedJsonData.meta.selectedId);

            addNotification("success", $t("settings.backup.success_import_full"));
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (err) {
            console.error("Full Backup Restore Error:", err);
            addNotification("error", $t("settings.backup.error_import").replace("{error}", err.message));
        } finally {
            importedJsonData = null;
        }
    }

    async function confirmImportPulls() {
        showImportPullsModal = false;
        if (!importedJsonData) return;

        try {
            await pullData.smartImport(importedJsonData);
            addNotification("success", $t("settings.backup.success_import_pulls"));

            const currentMemData = get(pullData);

            if ($user) {
                if (typeof window !== "undefined")
                    localStorage.removeItem("ark_ignore_cloud_ts");

                checkSync($user, currentMemData);
            }
        } catch (err) {
            console.error("Smart Import Error:", err);
            addNotification("error", $t("settings.backup.error_import").replace("{error}", err.message));
        } finally {
            importedJsonData = null;
        }
    }

    function getServerLabel(sid) {
        if (String(sid) === "2") return "Asia";
        return "Americas/Europe";
    }

    $: accountOptions = ($accounts || []).map((acc) => ({
        value: acc.id,
        label: `${acc.name} (${getServerLabel(acc.serverId || "3")})`,
    }));

    let currentSelection;
    $: if ($selectedId) {
        currentSelection = $selectedId;
    }

    let showClearModal = false;
    let showDeleteModal = false;
    let accountToDeleteName = "";
    function handleAccountChange(e) {
        const newAccountId = e.detail;
        accountStore.selectAccount(newAccountId);
    }
    function handleAddAccount() {
        accountStore.createEmptyAccount();
    }
    function openClearModal() {
        showClearModal = true;
    }
    function openDeleteModal() {
        if ($accounts.length <= 1) return;
        const acc = $accounts.find((a) => a.id === $selectedId);
        accountToDeleteName = acc ? acc.name : "Account";
        showDeleteModal = true;
    }
    async function confirmClear() {
        accountStore.clearCurrentData();
        showClearModal = false;

        if ($user) {
            await uploadLocalData();
        }
    }
    async function confirmDelete() {
        accountStore.deleteAccount($selectedId);
        showDeleteModal = false;

        if ($user) {
            await uploadLocalData();
        }
    }

    async function handleForceSync() {
        if (typeof window !== "undefined") {
            localStorage.removeItem("ark_ignore_cloud_ts");
        }
        syncStatus.set("checking");
        setTimeout(() => {
            checkSync($user);
        }, 50);
    }

    const noop = () => {};

    let showRenameModal = false;
    let tempAccountName = "";

    function openRenameModal() {
        const currentAcc = $accounts.find((a) => a.id === $selectedId);

        if (currentAcc) {
            console.log("[Accounts] Account found:", currentAcc.name);
            tempAccountName = currentAcc.name;
            showRenameModal = true;
        } else {
            console.error("[Accounts] Account NOT found!");
        }
    }

    function confirmRename() {
        const currentAcc = $accounts.find((a) => a.id === $selectedId);
        if (currentAcc && tempAccountName.trim() !== "") {
            accountStore.renameAccount(currentAcc.id, tempAccountName.trim());
        }
        showRenameModal = false;
    }
</script>

<div class="max-w-[1000px] w-full pb-20">
    <h1
        class="font-sdk dark:text-[#FDFDFD] text-5xl font-black text-[#21272C] mb-8"
    >
        {$t("settings.title")}
    </h1>

    <section class="mb-1 ml-2">
        <div
            class="flex flex-col items-start gap-4 mb-4 md:flex-row md:items-center"
        >
            <h2
                class="font-sdk dark:text-[#FDFDFD] text-2xl font-bold text-[#21272C] whitespace-nowrap"
            >
                {$t("settings.account.title")}
            </h2>

            <div class="flex gap-2 items-center flex-wrap">
                <Button
                    variant="roundSmall"
                    color="white"
                    onClick={handleAddAccount}
                >
                    <div class="flex items-center gap-1 px-2">
                        +<span>{$t("settings.account.add")}</span>
                    </div>
                </Button>
                <Button
                    variant="roundSmall"
                    color="red"
                    onClick={openClearModal}
                >
                    <div class="flex items-center gap-1 px-2 text-red-500">
                        <Icon name="trash" class="w-3 h-3" />
                        <span>{$t("settings.account.clear")}</span>
                    </div>
                </Button>
                {#if $accounts.length > 1}
                    <Button
                        variant="roundSmall"
                        color="red"
                        onClick={openDeleteModal}
                    >
                        <div class="flex items-center gap-1 px-2 text-red-500">
                            <Icon name="close" class="w-4 h-4" />
                            <span>{$t("settings.account.delete")}</span>
                        </div>
                    </Button>
                {/if}
            </div>
        </div>

        <div class="flex items-center gap-2 w-full md:w-auto">
            <div class="w-80">
                <Select
                    options={accountOptions}
                    value={currentSelection}
                    on:change={handleAccountChange}
                    placeholder="Select account..."
                    variant="black"
                />
            </div>

            <Tooltip text={$t("settings.account.rename") || "Rename account"}>
                <Button
                    variant="roundSmall"
                    color="white"
                    onClick={openRenameModal}
                    className="w-10 h-10 flex items-center justify-center !p-0"
                >
                    <div
                        class="text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors"
                    >
                        <Icon name="pen" class="w-4 h-4" />
                    </div>
                </Button>
            </Tooltip>
        </div>
    </section>

    <section class="mb-2 ml-2">
        <div class="mt-4 flex flex-col items-start gap-2">
            <h2
                class="font-sdk dark:text-[#FDFDFD] text-2xl font-bold text-[#21272C] whitespace-nowrap"
            >
                {$t("settings.server.title") || "Select Server"}
            </h2>

            <div class="w-80">
                <Select
                    options={serverOptions}
                    value={currentServerId}
                    on:change={handleServerChange}
                    variant="black"
                    placeholder="Select server..."
                />
            </div>

            <p class="text-xs text-gray-500 dark:text-[#787878] max-w-md">
                {$t("settings.server.hint") ||
                    "Changing the server affects import links and data fetching."}
            </p>

            <Checkbox bind:checked={showServerTime} variant="accent" align="start">
                <div>
                    <span
                        class="text-gray-600 dark:text-[#E0E0E0] group-hover:dark:text-[#FDFDFD] group-hover:text-black transition-colors cursor-pointer font-medium text-base"
                    >
                        {$t("settings.server.show_server_time")}
                    </span>
                </div>
            </Checkbox>

            <p class="text-xs text-gray-500 dark:text-[#787878] max-w-md">
                {$t("settings.server.show_server_time_desc")}
            </p>
        </div>
    </section>

    <section class="mb-3 ml-2">
        <h2
            class="font-sdk dark:text-[#FDFDFD] text-2xl font-bold text-[#21272C] mb-4"
        >
            {$t("settings.cloud.title")}
        </h2>

        <div
            class="bg-white p-6 rounded-xl dark:bg-[#383838] dark:border-[#444444] border border-gray-200 shadow-sm flex flex-col gap-4 max-w-[500pt] min-h-[180px] relative justify-center"
        >
            {#if $user === undefined}
                <div class="animate-pulse flex flex-col gap-4 w-full" in:fade>
                    <div class="flex justify-between items-center">
                        <div class="flex gap-2 items-center">
                            <div class="w-10 h-10 rounded bg-gray-200"></div>
                            <div class="w-32 h-6 bg-gray-200 rounded"></div>
                        </div>
                        <div class="w-24 h-6 bg-gray-200 rounded-full"></div>
                    </div>
                    <div class="h-px bg-gray-100 w-full my-2"></div>
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-full bg-gray-200"></div>
                        <div class="flex flex-col gap-2">
                            <div class="w-24 h-4 bg-gray-200 rounded"></div>
                            <div class="w-32 h-3 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>
            {:else}
                <div in:fade>
                    <div
                        class="flex items-center justify-between flex-wrap gap-2"
                    >
                        <div
                            class="flex items-center dark:text-[#FDFDFD] gap-2 font-bold text-[#21272C]"
                        >
                            <Icon name="google" class="w-6 h-6 text-white" />
                            {$t("settings.cloud.integration")}
                        </div>

                        <div class="flex items-center gap-2">
                            {#if $user}
                                <div
                                    class="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 dark:bg-[#474C48] dark:border-[#444444] dark:text-green-500 rounded-full text-[10px] font-bold border border-green-200 uppercase tracking-wider"
                                >
                                    <div
                                        class="w-1.5 h-1.5 rounded-full bg-green-500"
                                    ></div>
                                    {$t("settings.cloud.connected")}
                                </div>
                            {:else}
                                <div
                                    class="flex items-center gap-2 dark:bg-[#424242] dark:text-[#B7B6B3] px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-[10px] font-bold uppercase tracking-wider"
                                >
                                    {$t("settings.cloud.disconnected")}
                                </div>
                            {/if}

                            {#if $user}
                                {#if $syncStatus === "synced"}
                                    <div
                                        class="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 dark:bg-[#434548] dark:border-[#444444] dark:text-blue-500 rounded-full text-[10px] font-bold border border-blue-200 uppercase tracking-wider"
                                    >
                                        <Icon name="check" class="w-4 h-4" />
                                        {$t("settings.cloud.synced")}
                                    </div>
                                {:else}
                                    <div
                                        class="flex items-center gap-2 px-3 py-1 bg-orange-50 dark:text-orange-400 text-orange-700 dark:bg-[#803E18] dark:border-[#444444] rounded-full text-[10px] font-bold border border-orange-200 uppercase tracking-wider"
                                    >
                                        <Icon
                                            name="loading"
                                            class="w-3 h-3 animate-spin"
                                        />
                                        {$t("settings.cloud.notSynced")}
                                    </div>
                                {/if}
                            {/if}
                        </div>
                    </div>

                    <div
                        class="h-px bg-gray-100 w-full dark:bg-[#444444] my-4"
                    ></div>

                    {#if !$user}
                        <div
                            class="flex items-start dark:text-[#B7B6B3] gap-4 text-gray-600 text-sm leading-relaxed mb-3"
                        >
                            <div class="mt-0.5 flex-shrink-0">
                                <Icon
                                    name="info"
                                    class="w-5 h-5 text-gray-400"
                                />
                            </div>
                            <p>{$t("settings.cloud.description")}</p>
                        </div>

                        <button
                            on:click={login}
                            class="flex items-center justify-center gap-3 w-full py-3 border border-gray-300 dark:border-[#444444] dark:bg-[#424242] dark:text-[#E4E4E4] rounded-lg hover:bg-gray-50 transition-all font-bold text-gray-700 bg-white"
                        >
                            <Icon name="google" class="w-5 h-5" />
                            {$t("settings.cloud.signIn")}
                        </button>
                    {:else}
                        <div
                            class="flex items-center justify-between dark:bg-[#373737] dark:border-[#444444] gap-4 bg-[#F8F9FA] p-3 rounded-lg border border-gray-200 mb-4"
                        >
                            <div
                                class="flex items-center gap-4 overflow-hidden"
                            >
                                {#if $user.photoURL}
                                    <img
                                        src={$user.photoURL}
                                        alt="Avatar"
                                        class="w-10 h-10 rounded-full dark:border-[#7A7A7A] border border-white shadow-sm shrink-0"
                                    />
                                {:else}
                                    <div
                                        class="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold text-lg shrink-0"
                                    >
                                        {$user.displayName
                                            ? $user.displayName[0]
                                            : "U"}
                                    </div>
                                {/if}

                                <div class="flex flex-col min-w-0">
                                    <span
                                        class="font-bold text-[#21272C] dark:text-[#E0E0E0] text-sm truncate"
                                        title={$user.displayName}
                                    >
                                        {maskedName}
                                    </span>
                                    <button
                                        on:click={handleEmailClick}
                                        on:mouseleave={handleEmailLeave}
                                        on:mouseenter={handleEmailEnter}
                                        class="text-xs text-gray-400 text-left transition-all duration-300 select-none {isEmailVisible
                                            ? 'blur-none cursor-text'
                                            : 'blur-[4px] cursor-pointer hover:bg-gray-200 rounded px-1 -ml-1'}"
                                        title={isEmailVisible
                                            ? "Click to hide"
                                            : "Click to show email"}
                                    >
                                        {$user.email}
                                    </button>
                                </div>
                            </div>

                            <div class="text-right shrink-0">
                                <div
                                    class="text-[10px] font-bold text-gray-400 uppercase tracking-wider"
                                >
                                    {$t("settings.cloud.lastSync")}
                                </div>
                                <div
                                    class="text-xs dark:text-[#E0E0E0] font-mono text-[#21272C]"
                                >
                                    {lastSyncDate}
                                </div>
                            </div>
                        </div>

                        <div class="flex gap-3">
                            {#if $syncStatus !== "synced"}
                                <button
                                    on:click={handleForceSync}
                                    disabled={$syncStatus === "checking"}
                                    class="flex-1 flex border dark:border-[#444444] items-center justify-center gap-2 py-2 dark:bg-[#2C2C2C] bg-[#21272C] text-white rounded hover:bg-[#333] transition-all font-bold text-sm relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {#if $syncStatus === "checking"}
                                        <Icon
                                            name="loading"
                                            class="w-4 h-4 animate-spin"
                                        />
                                        <span>Checking...</span>
                                    {:else}
                                        <Icon name="refresh" class="w-4 h-4" />
                                        {$t("settings.cloud.syncBtn") ||
                                            "Sync"}
                                    {/if}
                                </button>
                            {/if}

                            <button
                                on:click={logout}
                                class="px-4 py-2 border dark:border-[#444444] border-red-200 dark:text-red-500 text-red-600 rounded hover:dark:bg-[#5F2121] hover:bg-red-50 font-bold text-sm transition-colors
        {$syncStatus === 'synced' ? 'w-full' : ''}"
                            >
                                {$t("settings.cloud.logout")}
                            </button>
                        </div>
                    {/if}
                </div>
            {/if}
        </div>
    </section>

    <section class="mb-4 ml-2">
        <h2
            class="font-sdk dark:text-[#FDFDFD] text-2xl font-bold text-[#21272C] mb-4"
        >
            {$t("settings.backup.title")}
        </h2>
        <div
            class="bg-gray-200 rounded-xl p-5 dark:bg-[#383838] dark:border-[#444444] dark:text-[#B7B6B3] mb-3 flex items-start gap-4 text-gray-600 text-sm leading-relaxed"
        >
            <div class="mt-0.5 flex-shrink-0">
                <Icon name="info" class="w-5 h-5 text-gray-400" />
            </div>
            <p>{$t("settings.backup.description")}</p>
        </div>

        <input
            type="file"
            accept=".json,application/json"
            class="hidden"
            bind:this={fileInputJson}
            on:change={handleFileChangeJson}
        />

        <div class="flex flex-wrap gap-4">
            <Button variant="round" color="white" onClick={handleExportBackup}
                >{$t("settings.backup.export")}</Button
            >
            <Button variant="round" color="white" onClick={handleImportBackup}
                >{$t("settings.backup.import")}</Button
            >
        </div>
    </section>

    <section class="mb-3 ml-2">
        <h2
            class="font-sdk dark:text-[#FDFDFD] text-2xl font-bold text-[#21272C] mb-4"
        >
            {$t("settings.feedback.title")}
        </h2>
        <div
            class="bg-gray-200 rounded-xl p-5 mb-5 dark:bg-[#383838] dark:border-[#444444] dark:text-[#B7B6B3] flex items-start gap-4 text-gray-600 text-sm leading-relaxed"
        >
            <div class="mt-0.5 flex-shrink-0">
                <Icon name="info" class="w-5 h-5 text-gray-400" />
            </div>
            <p>{$t("settings.feedback.text")}</p>
        </div>

        <div class="w-48 flex gap-3">
            <a
                href="https://t.me/ivawa73"
                target="_blank"
                rel="noreferrer"
                class="no-underline"
            >
                <Button variant="black2">
                    <div slot="icon">
                        <Icon name="telegram" class="w-10 h-10" />
                    </div>
                    {$t("settings.feedback.telegram")}
                </Button>
            </a>
            <a
                href="https://discord.gg/nqfuaRbWWn"
                target="_blank"
                rel="noreferrer"
                class="no-underline"
            >
                <Button variant="black2">
                    <div slot="icon">
                        <Icon name="discord" class="w-6 h-6" />
                    </div>
                    Discord
                </Button>
            </a>
        </div>
    </section>

    <section class="mb-4 ml-2">
        <h2
            class="font-sdk dark:text-[#FDFDFD] text-2xl font-bold text-[#21272C] mb-4"
        >
            {$t("settings.donate.title")}
        </h2>
        <div class="w-48 flex gap-3">
            <a
                href="https://boosty.to/ivawa/donate"
                target="_blank"
                rel="noreferrer"
                class="no-underline"
            >
                <Button variant="black2">
                    <div slot="icon">
                        <svg
                            width="23"
                            height="28"
                            viewBox="0 0 23 28"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M0.723377 16.2279L5.42796 0H12.658L11.2005 5.0308C11.186 5.05955 11.1716 5.08829 11.1572 5.11704L7.31845 18.3984H10.8974C9.39655 22.1211 8.22762 25.039 7.39061 27.1519C0.781102 27.0801 -1.0661 22.3655 0.550202 16.7885M7.41947 27.1663L16.1359 14.6756H12.4415L15.6597 6.6694C21.1724 7.24435 23.7701 11.5708 22.2404 16.8029C20.6096 22.423 14.0001 27.1663 7.56378 27.1663C7.50606 27.1663 7.46277 27.1663 7.41947 27.1663Z"
                                fill="url(#paint0_linear_1573_82538)"
                            />
                            <defs>
                                <linearGradient
                                    id="paint0_linear_1573_82538"
                                    x1="15.2668"
                                    y1="3.52846"
                                    x2="6.02824"
                                    y2="35.1606"
                                    gradientUnits="userSpaceOnUse"
                                >
                                    <stop stop-color="#EF7829" />
                                    <stop offset="0.0518954" stop-color="#F07529" />
                                    <stop offset="0.3551" stop-color="#F0672B" />
                                    <stop offset="0.6673" stop-color="#F15E2C" />
                                    <stop offset="1" stop-color="#F15A2C" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    Boosty
                </Button>
            </a>
            <a
                href="https://t.me/tribute/app?startapp=dFlw"
                target="_blank"
                rel="noreferrer"
                class="no-underline"
            >
                <Button variant="black2">
                    <div slot="icon">
                        <Icon name="tribute" class="w-7 h-7" />
                    </div>
                    Tribute
                </Button>
            </a>
            <a
                href="https://patreon.com/ivawa?utm_medium=unknown&utm_source=join_link&utm_campaign=creatorshare_creator&utm_content=copyLink"
                target="_blank"
                rel="noreferrer"
                class="no-underline block"
            >
                <Button
                    variant="black2"
                    className="w-full justify-center"
                >
                    <div slot="icon">
                        <svg
                            width="26"
                            height="26"
                            viewBox="0 0 26 26"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            xmlns:xlink="http://www.w3.org/1999/xlink"
                        >
                            <rect width="26" height="26" fill="url(#pattern0_1573_82525)" />
                            <defs>
                                <pattern
                                    id="pattern0_1573_82525"
                                    patternContentUnits="objectBoundingBox"
                                    width="1"
                                    height="1"
                                >
                                    <use
                                        xlink:href="#image0_1573_82525"
                                        transform="scale(0.00195312)"
                                    />
                                </pattern>
                                <image
                                    id="image0_1573_82525"
                                    width="512"
                                    height="512"
                                    preserveAspectRatio="none"
                                    xlink:href="data:image/png;base64,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"
                                />
                            </defs>
                        </svg>
                    </div>
                    Patreon
                </Button>
            </a>
        </div>
    </section>
    <section class="mb-10 ml-2">
        <h2
            class="font-sdk dark:text-[#FDFDFD] text-2xl font-bold text-[#21272C] mb-4"
        >
            {$t("settings.other")}
        </h2>
        <div class="flex items-center gap-3 mb-4">
        <button
                type="button"
                role="switch"
                aria-label="switch"
                aria-checked={$disableDarkening}
                class="shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none {$disableDarkening
                    ? 'bg-[#F9B90C]'
                    : 'bg-gray-200 dark:bg-[#555]'}"
                on:click={toggleDarkening}
            >
                <span
                    class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {$disableDarkening
                        ? 'translate-x-6'
                        : 'translate-x-1'} shadow-sm"
                ></span>
            </button>
            <span class="text-sm font-bold dark:text-[#E0E0E0] text-gray-800">
                {$t("settings.disableDarkening") || "Disable darkening"}
            </span>
            
        </div>

        <div class="flex items-center gap-3">

            <button
                type="button"
                role="switch"
                aria-label="switch"
                aria-checked={$ctrlForZoom}
                class="shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none {$ctrlForZoom
                    ? 'bg-[#F9B90C]'
                    : 'bg-gray-200 dark:bg-[#555]'}"
                on:click={toggleDragPlateMode}
            >
                    <span
                        class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {$ctrlForZoom
                    ? 'translate-x-6'
                    : 'translate-x-1'} shadow-sm"
                    ></span>
            </button>

            <span class="text-sm font-bold dark:text-[#E0E0E0] text-gray-800">
                    {$t("settings.toggleCtrlForZoom")}
                </span>

        </div>
    </section>
</div>

<ConfirmationModal
    isOpen={showClearModal}
    title={$t("settings.account.clear") + "?"}
    description={$t("settings.account.clearDescription")}
    confirmText={$t("settings.account.yesClear")}
    isDestructive={true}
    on:confirm={confirmClear}
    on:close={() => (showClearModal = false)}
/>
<ConfirmationModal
    isOpen={showDeleteModal}
    title={$t("settings.account.deleteModalTitle")}
    description={$t("settings.account.deleteModalDesc").replace(
        "{name}",
        accountToDeleteName,
    )}
    confirmText={$t("settings.account.deleteAccount")}
    isDestructive={true}
    on:confirm={confirmDelete}
    on:close={() => (showDeleteModal = false)}
/>
<ConfirmationModal
    isOpen={showRenameModal}
    title={$t("settings.account.rename") || "Rename Account"}
    description={$t("settings.account.rename_desc") ||
        "Enter a new name for this account:"}
    confirmText={$t("settings.account.save") || "Save"}
    enableInput={true}
    bind:value={tempAccountName}
    on:confirm={confirmRename}
    confirmColor="green"
    on:confirm={confirmRename}
    on:close={() => (showRenameModal = false)}
/>
<ConfirmationModal
    isOpen={showImportFullModal}
    title={$t("settings.backup.confirm_full_title")}
    description={$t("settings.backup.confirm_full_desc")}
    confirmText={$t("settings.backup.confirm_full_btn")}
    isDestructive={true}
    on:confirm={confirmImportFull}
    on:close={() => (showImportFullModal = false)}
/>
<ConfirmationModal
    isOpen={showImportPullsModal}
    title={$t("settings.backup.confirm_pulls_title")}
    description={$t("settings.backup.confirm_pulls_desc")}
    confirmText={$t("settings.backup.confirm_pulls_btn")}
    confirmColor="yellow"
    on:confirm={confirmImportPulls}
    on:close={() => (showImportPullsModal = false)}
/>
