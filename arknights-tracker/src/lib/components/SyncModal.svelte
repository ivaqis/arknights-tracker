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

        try { if ($accountStore && $accountStore.accounts) { accounts = $accountStore.accounts; currentId = $accountStore.selectedId; } } catch(e) {}
        if (!accounts.length) { try { const raw = localStorage.getItem("ark_tracker_accounts"); if (raw) accounts = JSON.parse(raw).accounts; } catch(e) {} }
        if (!accounts || !accounts.length) accounts = [{id: 'main'}];

        accounts.forEach(acc => {
            if (acc.id === currentId && $pullData) {
                ['standard', 'special', 'new-player'].forEach(cat => { if ($pullData[cat]?.pulls) total += $pullData[cat].pulls.length; });
            } else {
                const raw = localStorage.getItem(`ark_tracker_data_${acc.id}`);
                if (raw) {
                    try {
                        const data = JSON.parse(raw);
                        ['standard', 'special', 'new-player'].forEach(cat => { if (data[cat]?.pulls) total += data[cat].pulls.length; });
                    } catch (e) {}
                }
            }
        });
        return total;
    }

    let localCount = 0;
    let localTime = 0;
    
    $: cloudData = $cloudDataBuffer;
    $: cloudCount = cloudData?.total ?? 0;
    $: cloudTime = cloudData?.timestamp || 0;
    $: isLocalMore = localCount > cloudCount;
    $: isCloudMore = cloudCount > localCount;
    $: isLocalNewerTime = localTime > cloudTime;
    $: isCloudNewerTime = cloudTime > localTime;
    $: highlightLocal = $syncStatus === "local_newer" && !isCloudNewerTime;
    $: highlightCloud = $syncStatus === "conflict_cloud_newer" || (isCloudNewerTime && !highlightLocal);

    let showModal = false;

    $: {
        const isConflict = $syncStatus === "conflict_cloud_newer" || $syncStatus === "local_newer";
        const storedIgnore = typeof window !== 'undefined' ? localStorage.getItem("ark_ignore_cloud_ts") : null;
        
        if (isConflict) {
            if (!storedIgnore || parseInt(storedIgnore) !== cloudTime || $syncStatus === "local_newer") {
                showModal = true;
                localCount = getAllLocalPullsCount(); 
                updateLocalStats();
            } else {
                showModal = false;
            }
        } else {
            showModal = false;
        }
    }

    function updateLocalStats() {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem("ark_last_sync");
            localTime = stored ? parseInt(stored) : 0;
            if ($syncStatus === "local_newer" && localTime === 0) {
                 localTime = Date.now();
            }
        }
    }
    
    function handleLeftButton() {
        if ($syncStatus === "local_newer") {
            uploadLocalData($pullData);
            showModal = false;
        } else {
            if (typeof window !== 'undefined' && cloudTime > 0) {
                localStorage.setItem("ark_ignore_cloud_ts", cloudTime.toString());
            }
            showModal = false;
            syncStatus.set("idle");
        }
    }
</script>

{#if showModal}
    <div class="md:ml-[var(--sb-w)] fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
        <div class="bg-white dark:bg-[#383838] rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
            
            <div class="px-6 py-5 border-b border-gray-100 dark:border-[#444444] flex justify-between items-center bg-gray-50 dark:bg-[#343434]">
                <h2 class="text-xl font-bold text-[#21272C] dark:text-[#FDFDFD] flex items-center gap-3">
                    <Icon name="cloud" class="w-6 h-6 text-[#21272C] dark:text-[#FDFDFD]" />
                    {#if highlightLocal}
                        {$t("settings.cloud.localNewerTitle")}
                    {:else}
                        {$t("settings.cloud.syncConflict")}
                    {/if}
                </h2>
            </div>

            <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div class="relative p-5 rounded-lg border-2 transition-all {highlightLocal ? 'border-green-500 bg-green-50 dark:bg-[#1a382e] dark:border-green-600' : 'border-gray-100 dark:border-[#444444] bg-white dark:bg-[#2C2C2C] opacity-60'}">
                    <div class="flex flex-col gap-2 items-start mb-2">
                        <span class="text-xs font-bold text-gray-500 dark:text-[#B7B6B3] tracking-wider">
                            {$t("settings.cloud.thisDevice")}
                        </span>
                        
                        <div class="flex gap-1 flex-wrap">
                            {#if isLocalMore}
                                <span class="px-1.5 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded uppercase">
                                    {$t("settings.cloud.badgeMore")}
                                </span>
                            {/if}
                            {#if isLocalNewerTime}
                                <span class="px-1.5 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded uppercase">
                                    {$t("settings.cloud.badgeNewer")}
                                </span>
                            {/if}
                        </div>
                    </div>

                    <div class="text-3xl font-bold text-[#21272C] dark:text-[#FDFDFD] font-nums mb-1">{localCount}</div>
                    <div class="text-sm text-gray-500 dark:text-[#B7B6B3]">{$t("settings.cloud.totalPulls")}</div>
                    <div class="mt-4 pt-3 border-t border-gray-200 dark:border-[#444444] text-xs text-gray-400 dark:text-[#787878] font-mono">
                        {formatDate(localTime)}
                    </div>
                </div>

                <div class="relative p-5 rounded-lg border-2 transition-all {highlightCloud ? 'border-green-500 bg-green-50 dark:bg-[#1a382e] dark:border-green-600' : 'border-gray-100 dark:border-[#444444] bg-white dark:bg-[#2C2C2C] opacity-60'}">
                    <div class="flex flex-col gap-2 items-start mb-2">
                        <span class="text-xs font-bold text-gray-500 dark:text-[#B7B6B3] tracking-wider">
                            {$t("settings.cloud.googleCloud")}
                        </span>

                        <div class="flex gap-1 flex-wrap">
                            {#if isCloudMore}
                                <span class="px-1.5 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded uppercase">
                                    {$t("settings.cloud.badgeMore")}
                                </span>
                            {/if}
                            {#if isCloudNewerTime}
                                <span class="px-1.5 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded uppercase">
                                    {$t("settings.cloud.badgeNewer")}
                                </span>
                            {/if}
                        </div>
                    </div>

                    <div class="text-3xl font-bold text-[#21272C] dark:text-[#FDFDFD] font-nums mb-1">{cloudCount}</div>
                    <div class="text-sm text-gray-500 dark:text-[#B7B6B3]">{$t("settings.cloud.totalPulls")}</div>
                    <div class="mt-4 pt-3 border-t border-gray-200 dark:border-[#444444] text-xs text-gray-400 dark:text-[#787878] font-mono">
                        {formatDate(cloudTime)}
                    </div>
                </div>
            </div>

            <div class="px-6 pb-6 text-sm text-gray-500 dark:text-[#B7B6B3] leading-relaxed">
                 {#if $syncStatus === "local_newer"}
                    {@html $t("settings.cloud.localNewerMsg")}
                 {:else}
                    {@html $t("settings.cloud.cloudNewerAlert")}
                 {/if}
            </div>

            <div class="p-4 bg-gray-50 dark:bg-[#343434] border-t border-gray-100 dark:border-[#444444] flex justify-end gap-3">
                <Button variant="black2" onClick={handleLeftButton}>
                    <div slot="icon">
                        {#if $syncStatus === "local_newer"}
                            <Icon name="export" style="width: 20px; height: 20px;" />
                        {:else}
                            <Icon name="local" style="width: 30px; height: 30px;" />
                        {/if}
                    </div>
                    {#if $syncStatus === "local_newer"}
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