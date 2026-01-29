<script>
    import { syncStatus, cloudDataBuffer, applyCloudData, uploadLocalData } from "$lib/stores/cloudStore";
    import { accountStore } from "$lib/stores/accounts";
    import { pullData } from "$lib/stores/pulls";
    import Button from "$lib/components/Button.svelte";
    import Icon from "$lib/components/Icons.svelte";
    import { t } from "$lib/i18n";

    const formatDate = (ts) => ts === 0 ? "Never" : new Date(ts).toLocaleString();

    function getAllLocalPullsCount() {
        if (typeof window === 'undefined') return 0;
        
        let total = 0;
        let accounts = [];
        let currentId = 'main';

        // 1. Берем аккаунты из стора
        try { 
            if ($accountStore && $accountStore.accounts) {
                accounts = $accountStore.accounts; 
                currentId = $accountStore.selectedId;
            }
        } catch(e) {}

        if (!accounts.length) {
            try { const raw = localStorage.getItem("ark_tracker_accounts"); if (raw) accounts = JSON.parse(raw).accounts; } catch(e) {}
        }
        if (!accounts || !accounts.length) accounts = [{id: 'main'}];

        // 2. Считаем
        accounts.forEach(acc => {
            // Если активный аккаунт - берем из $pullData (СВЕЖАК!)
            if (acc.id === currentId && $pullData) {
                ['standard', 'special', 'new-player'].forEach(cat => { 
                    if ($pullData[cat]?.pulls) total += $pullData[cat].pulls.length; 
                });
                return;
            }

            // Иначе с диска
            const raw = localStorage.getItem(`ark_tracker_data_${acc.id}`);
            if (raw) {
                try {
                    const data = JSON.parse(raw);
                    ['standard', 'special', 'new-player'].forEach(cat => { if (data[cat]?.pulls) total += data[cat].pulls.length; });
                } catch (e) {}
            }
        });
        return total;
    }

    let localCount = 0;
    let localTime = 0;
    
    $: cloudData = $cloudDataBuffer;
    $: cloudCount = cloudData?.total ?? 0;
    $: cloudTime = cloudData?.timestamp || 0;

    // --- СТРОГАЯ ЛОГИКА ПОБЕДИТЕЛЯ ---
    // Зеленым подсвечиваем ТОЛЬКО того, на кого указывает статус конфликта.
    // Никаких сравнений времени тут, чтобы не путать пользователя.
    $: isLocalWinner = $syncStatus === "local_newer";
    $: isCloudWinner = $syncStatus === "conflict_cloud_newer";

    let showModal = false;

    // --- УСЛОВИЕ ПОКАЗА ---
    $: {
        const isConflict = $syncStatus === "conflict_cloud_newer" || $syncStatus === "local_newer";
        
        // Читаем игнор
        const storedIgnore = typeof window !== 'undefined' ? localStorage.getItem("ark_ignore_cloud_ts") : null;
        const ignoredTs = storedIgnore ? parseInt(storedIgnore) : 0;

        if (isConflict) {
            // Если игнор снят (кнопкой) ИЛИ время в облаке изменилось -> ПОКАЗАТЬ
            // Также показываем, если у нас local_newer (так как мы хотим предложить загрузку)
            if (!storedIgnore || parseInt(storedIgnore) !== cloudTime || isLocalWinner) {
                showModal = true;
                updateLocalStats();
            } else {
                showModal = false;
            }
        } else {
            showModal = false;
        }
    }

    function updateLocalStats() {
        localCount = getAllLocalPullsCount();
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem("ark_last_sync");
            localTime = stored ? parseInt(stored) : 0;
            
            // ФИКС ВРЕМЕНИ: 
            // Если система говорит, что локальные новее, но время "0" (никогда не синкали),
            // показываем "Сейчас", чтобы было понятно, что данные свежие.
            if ($syncStatus === "local_newer") {
                localTime = Date.now();
            }
        }
    }
    
    function handleLeftButton() {
        if ($syncStatus === "local_newer") {
            // LOCAL NEWER -> UPLOAD
            uploadLocalData();
            showModal = false;
        } else {
            // CLOUD NEWER -> IGNORE (KEEP LOCAL)
            if (typeof window !== 'undefined' && cloudTime > 0) {
                localStorage.setItem("ark_ignore_cloud_ts", cloudTime.toString());
            }
            showModal = false;
            syncStatus.set("idle");
        }
    }
</script>

{#if showModal}
    <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
        <div class="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
            
            <div class="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 class="text-xl font-bold text-[#21272C] flex items-center gap-3">
                    <Icon name="cloud" class="w-6 h-6 text-[#21272C]" />
                    {#if isLocalWinner}
                        {$t("settings.cloud.localNewerTitle")}
                    {:else}
                        {$t("settings.cloud.syncConflict")}
                    {/if}
                </h2>
            </div>

            <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="relative p-5 rounded-lg border-2 transition-all {isLocalWinner ? 'border-green-500 bg-green-50' : 'border-gray-100 bg-white opacity-60'}">
                    <div class="flex justify-between items-start mb-2">
                        <span class="text-xs font-bold text-gray-500 tracking-wider">
                            {$t("settings.cloud.thisDevice")}
                        </span>
                        {#if isLocalWinner}
                            <span class="px-1.5 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded uppercase">
                                {$t("settings.cloud.badgeNewerMore")}
                            </span>
                        {/if}
                    </div>
                    <div class="text-3xl font-bold text-[#21272C] font-nums mb-1">{localCount}</div>
                    <div class="text-sm text-gray-500">{$t("settings.cloud.totalPulls")}</div>
                    <div class="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-400 font-mono">
                        {formatDate(localTime)}
                        {#if isLocalWinner && localTime === Date.now()} <span class="text-[10px] opacity-60">(Unsynced)</span>{/if}
                    </div>
                </div>

                <div class="relative p-5 rounded-lg border-2 transition-all {isCloudWinner ? 'border-green-500 bg-green-50' : 'border-gray-100 bg-white opacity-60'}">
                    <div class="flex justify-between items-start mb-2">
                        <span class="text-xs font-bold text-gray-500 tracking-wider">
                            {$t("settings.cloud.googleCloud")}
                        </span>
                         {#if isCloudWinner}
                            <span class="px-1.5 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded uppercase">
                                {$t("settings.cloud.badgeNewer")}
                            </span>
                        {/if}
                    </div>
                    <div class="text-3xl font-bold text-[#21272C] font-nums mb-1">{cloudCount}</div>
                    <div class="text-sm text-gray-500">{$t("settings.cloud.totalPulls")}</div>
                    <div class="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-400 font-mono">
                        {formatDate(cloudTime)}
                    </div>
                </div>
            </div>

            <div class="px-6 pb-6 text-sm text-gray-500 leading-relaxed">
                 {#if isLocalWinner}
                    {@html $t("settings.cloud.localNewerMsg", { localCount, cloudCount })}
                 {:else}
                    {@html $t("settings.cloud.cloudNewerAlert")}
                 {/if}
            </div>

            <div class="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <Button variant="black2" onClick={handleLeftButton}>
                    <div slot="icon">
                        {#if isLocalWinner}
                            <Icon name="export" style="width: 20px; height: 20px;" />
                        {:else}
                            <Icon name="local" style="width: 30px; height: 30px;" />
                        {/if}
                    </div>
                    {#if isLocalWinner}
                        {$t("settings.cloud.uploadBtn")}
                    {:else}
                        {$t("settings.cloud.localBtn")}
                    {/if}
                </Button>

                <Button variant="yellow" onClick={applyCloudData}>
                    <div slot="icon"><Icon name="cloud" style="width: 35px; height: 30px;" /></div>
                    {$t("settings.cloud.downloadBtn")}
                </Button>
            </div>
        </div>
    </div>
{/if}