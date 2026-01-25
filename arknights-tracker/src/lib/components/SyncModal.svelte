<script>
    import { syncStatus, cloudDataBuffer, applyCloudData } from "$lib/stores/cloudStore";
    import { accountStore } from "$lib/stores/accounts";
    import Button from "$lib/components/Button.svelte";
    import Icon from "$lib/components/Icons.svelte";
    import { t } from "$lib/i18n";

    const formatDate = (ts) => ts === 0 ? "Never" : new Date(ts).toLocaleString();

    function getAllLocalPullsCount() {
        if (typeof window === 'undefined') return 0;
        let accounts = [];
        try { if ($accountStore && $accountStore.accounts) accounts = $accountStore.accounts; } catch(e) {}
        if (!accounts.length) {
            try { const raw = localStorage.getItem("ark_tracker_accounts"); if (raw) accounts = JSON.parse(raw).accounts; } catch(e) {}
        }
        if (!accounts || !accounts.length) accounts = [{id: 'main'}];
        let total = 0;
        accounts.forEach(acc => {
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
    let localTime = 0; // Инициализируем нулем

    $: showModal = $syncStatus === "conflict_cloud_newer";

    // РЕАКТИВНОСТЬ: Как только модалка открывается, читаем данные свежие
    $: if (showModal) {
        localCount = getAllLocalPullsCount();
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem("ark_last_sync");
            localTime = stored ? parseInt(stored) : 0;
            // Если времени нет (0), ставим текущее, так как конфликт уже произошел
            if (localTime === 0) localTime = Date.now(); 
        }
    }
    
    $: cloudData = $cloudDataBuffer;
    $: cloudCount = cloudData?.total ?? 0;
    $: cloudTime = cloudData?.timestamp || 0;

    $: isCloudNewer = cloudTime > localTime;
    $: isLocalNewer = localTime > cloudTime;
    
    function close() { syncStatus.set("idle"); }
</script>

{#if showModal}
    <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
        <div class="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
            
            <div class="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 class="text-xl font-bold text-[#21272C] flex items-center gap-3">
                    <Icon name="cloud" class="w-6 h-6 text-[#21272C]" />
                    {$t("settings.cloud.syncConflict")}
                </h2>
            </div>

            <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div class="relative p-5 rounded-lg border-2 transition-all {isLocalNewer ? 'border-red-500 bg-red-50' : 'border-gray-100 bg-white opacity-60'}">
                    <div class="flex justify-between items-start mb-2">
                        <span class="text-xs font-bold text-gray-500 tracking-wider">
                            {$t("settings.cloud.thisDevice")}
                        </span>
                        {#if isLocalNewer}
                            <span class="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded uppercase">
                                {$t("settings.cloud.newerData")}
                            </span>
                        {/if}
                    </div>
                    <div class="text-3xl font-bold text-[#21272C] font-nums mb-1">{localCount}</div>
                    <div class="text-sm text-gray-500">{$t("settings.cloud.totalPulls")}</div>
                    <div class="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-400 font-mono">
                        {formatDate(localTime)}
                    </div>
                </div>

                <div class="relative p-5 rounded-lg border-2 transition-all {isCloudNewer ? 'border-green-500 bg-green-50' : 'border-gray-100 bg-white opacity-60'}">
                    <div class="flex justify-between items-start mb-2">
                        <span class="text-xs font-bold text-gray-500 tracking-wider">
                            {$t("settings.cloud.googleCloud")}
                        </span>
                         {#if isCloudNewer}
                            <span class="px-1.5 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded uppercase">
                                {$t("settings.cloud.newerData")}
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
                 {@html $t("settings.cloud.cloudNewerAlert")}
            </div>

            <div class="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <Button variant="black2" onClick={close}>
                    {$t("settings.cloud.cancel")}
                </Button>
                <Button variant="yellow" onClick={applyCloudData}>
                    <div class="flex items-center gap-2">
                        
                        {$t("settings.cloud.downloadBtn")}
                    </div>
                </Button>
            </div>
        </div>
    </div>
{/if}