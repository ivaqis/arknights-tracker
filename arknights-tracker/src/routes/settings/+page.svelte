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
    import { currentLocale } from "$lib/stores/locale";

    import Select from "$lib/components/Select.svelte";
    import Checkbox from "$lib/components/Checkbox.svelte";
    import Icon from "$lib/components/Icons.svelte";
    import Tooltip from "$lib/components/Tooltip.svelte";
    import Button from "$lib/components/Button.svelte";
    import ConfirmationModal from "$lib/components/ConfirmationModal.svelte";
    import SyncModal from "$lib/components/SyncModal.svelte";

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
    $: if ($syncStatus && $currentLocale && typeof window !== "undefined") {
        const ts = parseInt(localStorage.getItem("ark_last_sync") || "0");
        if (ts > 0) {
            try {
                lastSyncDate = new Intl.DateTimeFormat($currentLocale, {
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
                            <Icon name="google" class="w-10 h-10 text-white" />
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
            accept=".json"
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
                        <Icon name="telegram" class="w-6 h-6" />
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
                        <Icon name="boosty" class="w-6 h-6" />
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
                        <Icon name="tribute" class="w-6 h-6" />
                    </div>
                    Tribute
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
        <div class="flex items-center gap-3">
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
