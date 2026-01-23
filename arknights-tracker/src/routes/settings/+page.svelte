<script>
    import { t } from "$lib/i18n";
    import { get } from "svelte/store"; // <--- ВАЖНО: Добавлен импорт get
    import Select from "$lib/components/Select.svelte";
    import Icon from "$lib/components/Icons.svelte";
    import Button from "$lib/components/Button.svelte";
    import ConfirmationModal from "$lib/components/ConfirmationModal.svelte";

    import { accountStore } from "$lib/stores/accounts";
    import { pullData } from "$lib/stores/pulls";

    const { accounts, selectedId } = accountStore;

    // --- Логика JSON Бэкапа (FULL SYSTEM) ---
    let fileInputJson;

    // ЭКСПОРТ ВСЕХ АККАУНТОВ
    function handleExportBackup() {
        // 1. Берем список всех аккаунтов
        const currentAccounts = get(accounts);
        const currentSelectedId = get(selectedId);

        // 2. Формируем структуру полного бэкапа
        const fullBackup = {
            type: "ark_tracker_full_backup", // Маркер типа файла
            version: 1,
            timestamp: new Date().toISOString(),
            meta: {
                accounts: currentAccounts,
                selectedId: currentSelectedId,
            },
            // Здесь будут лежать данные круток: { "acc_id": { ...данные... }, "acc_id_2": ... }
            data: {},
        };

        // 3. Проходимся по каждому аккаунту и достаем его данные из LocalStorage
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
                    // Если данные битые, сохраняем пустую структуру, чтобы не ломать JSON
                    fullBackup.data[acc.id] = {
                        standard: { pulls: [], stats: {} },
                    };
                }
            } else {
                // Если данных нет (новый акк), пишем null или пустой объект
                fullBackup.data[acc.id] = null;
            }
        });

        // 4. Скачиваем
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
    }

    // Импорт (Триггер)
    function handleImportBackup() {
        fileInputJson.click();
    }

    // ИМПОРТ (Умное определение типа)
    function handleFileChangeJson(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const json = JSON.parse(e.target.result);

                if (!json || typeof json !== "object") {
                    alert("Invalid JSON format");
                    return;
                }

                // СЦЕНАРИЙ 1: Полный бэкап (наш новый формат)
                if (
                    json.type === "ark_tracker_full_backup" &&
                    json.data &&
                    json.meta
                ) {
                    if (
                        !confirm(
                            "This is a Full System Backup. Restoring it will OVERWRITE all current accounts and pull history. Continue?",
                        )
                    ) {
                        return;
                    }

                    // 1. Восстанавливаем данные круток в LocalStorage
                    Object.entries(json.data).forEach(([accId, accData]) => {
                        if (accData) {
                            localStorage.setItem(
                                `ark_tracker_data_${accId}`,
                                JSON.stringify(accData),
                            );
                        }
                    });

                    // 2. Восстанавливаем список аккаунтов (через стор, чтобы обновился UI и LS)
                    accountStore.accounts.set(json.meta.accounts);

                    // 3. Восстанавливаем выбранный ID
                    if (json.meta.selectedId) {
                        accountStore.selectAccount(json.meta.selectedId);
                    }

                    alert("Full system backup restored successfully!");
                    // Желательно перезагрузить страницу, чтобы все сторы перечитали LS начисто
                    window.location.reload();
                }
                // СЦЕНАРИЙ 2: Обычный импорт данных (UGE/старый формат) в ТЕКУЩИЙ аккаунт
                else {
                    // Пытаемся понять, это данные круток или мусор
                    // Обычно данные круток содержат ключи типа 'standard', 'special' или массив
                    const isPullData =
                        json.standard || json.special || Array.isArray(json);

                    if (isPullData) {
                        if (
                            confirm(
                                "This file looks like pull data (not a full backup). Import it into the CURRENTLY selected account?",
                            )
                        ) {
                            try {
                                // Используем smartImport из pulls.js для мержа
                                await pullData.smartImport(json);
                                alert(
                                    "Pulls imported into current account successfully!",
                                );
                            } catch (err) {
                                alert("Import Error: " + err.message);
                            }
                        }
                    } else {
                        alert(
                            "Unknown file format. Neither a full backup nor valid pull data.",
                        );
                    }
                }
            } catch (error) {
                console.error(error);
                alert("Error reading JSON file");
            }
        };
        reader.readAsText(file);
        event.target.value = "";
    }

    // ... (Остальной код страницы без изменений) ...
    $: accountOptions = $accounts.map((acc) => ({
        value: acc.id,
        label: acc.name,
    }));

    let currentSelection;
    $: if ($selectedId) {
        currentSelection = $selectedId;
    }

    let showClearModal = false;
    let showDeleteModal = false;
    let accountToDeleteName = "";

    function handleAccountChange(e) {
        accountStore.selectAccount(e.detail);
    }
    function handleAddAccount() {
        accountStore.addAccount();
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
    function confirmClear() {
        accountStore.clearCurrentData();
        showClearModal = false;
    }
    function confirmDelete() {
        accountStore.deleteAccount($selectedId);
        showDeleteModal = false;
    }
    const noop = () => {};
</script>

<div class="max-w-[1000px] w-full pb-20">
    <h1 class="font-sdk text-5xl font-black text-[#21272C] mb-8">
        {$t("settings.title")}
    </h1>

    <section class="mb-10">
        <div class="flex items-center gap-4 mb-4">
            <h2 class="font-sdk text-2xl font-bold text-[#21272C]">
                {$t("settings.account.title")}
            </h2>
            <div class="flex gap-2 items-center">
                <Button
                    variant="roundSmall"
                    color="white"
                    onClick={handleAddAccount}
                >
                    <div class="flex items-center gap-2 px-2">
                        <Icon name="plus" class="w-4 h-4" /><span
                            >{$t("settings.account.add")}</span
                        >
                    </div>
                </Button>
                <Button
                    variant="roundSmall"
                    color="white"
                    onClick={openClearModal}
                >
                    <div class="flex items-center gap-2 px-2 text-red-500">
                        <Icon name="trash" class="w-4 h-4" /><span
                            >{$t("settings.account.clear")}</span
                        >
                    </div>
                </Button>
                {#if $accounts.length > 1}
                    <Button
                        variant="roundSmall"
                        color="white"
                        onClick={openDeleteModal}
                    >
                        <div class="flex items-center gap-2 px-2 text-red-500">
                            <Icon name="close" class="w-4 h-4" /><span
                                >{$t("settings.account.delete")}</span
                            >
                        </div>
                    </Button>
                {/if}
            </div>
        </div>
        <div class="w-80">
            <Select
                options={accountOptions}
                value={currentSelection}
                on:change={handleAccountChange}
                placeholder="Select account..."
                variant="black"
            />
        </div>
    </section>

    <section class="mb-10">
        <h2 class="font-sdk text-2xl font-bold text-[#21272C] mb-4">
            {$t("settings.cloud.title")}
        </h2>
        <div
            class="bg-gray-100 rounded-xl p-5 mb-5 flex items-start gap-4 text-gray-600 text-sm leading-relaxed"
        >
            <div class="mt-0.5 flex-shrink-0">
                <Icon name="info" class="w-5 h-5 text-gray-400" />
            </div>
            <p>{$t("settings.cloud.description")}</p>
        </div>
        <div class="w-[340px]">
            <Button variant="black2" onClick={noop}>
                <div
                    slot="icon"
                    class="flex items-center justify-center w-6 h-6"
                >
                    <Icon name="googleDrive" class="w-6 h-6" />
                </div>
                {$t("settings.cloud.btn")}
            </Button>
        </div>
    </section>

    <section class="mb-10">
        <h2 class="font-sdk text-2xl font-bold text-[#21272C] mb-4">
            {$t("settings.backup.title")}
        </h2>
        <div
            class="bg-gray-100 rounded-xl p-5 mb-5 flex items-start gap-4 text-gray-600 text-sm leading-relaxed"
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
            <div class="w-64">
                <Button
                    variant="round"
                    color="white"
                    onClick={handleExportBackup}
                >
                    {$t("settings.backup.export")}
                </Button>
            </div>
            <div class="w-64">
                <Button
                    variant="round"
                    color="white"
                    onClick={handleImportBackup}
                >
                    {$t("settings.backup.import")}
                </Button>
            </div>
        </div>
    </section>

    <section class="mb-10">
        <h2 class="font-sdk text-2xl font-bold text-[#21272C] mb-4">
            {$t("settings.sources.title")}
        </h2>
        <div class="text-gray-400 italic">Work in progress...</div>
    </section>

    <section class="mb-10">
        <h2 class="font-sdk text-2xl font-bold text-[#21272C] mb-4">
            {$t("settings.feedback.title")}
        </h2>
        <div class="w-48">
            <Button variant="black2" onClick={noop}>
                <div slot="icon"><Icon name="telegram" class="w-6 h-6" /></div>
                {$t("settings.feedback.telegram")}
            </Button>
        </div>
    </section>
</div>

<ConfirmationModal
    isOpen={showClearModal}
    title={$t("settings.account.clear") + "?"}
    description="This will permanently delete all pull history for the current account. This action cannot be undone."
    confirmText="Yes, clear data"
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
    confirmText="Delete Account"
    isDestructive={true}
    on:confirm={confirmDelete}
    on:close={() => (showDeleteModal = false)}
/>
