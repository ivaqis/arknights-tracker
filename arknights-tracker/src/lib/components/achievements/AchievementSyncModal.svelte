<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { t } from '$lib/i18n';
    import { user } from '$lib/stores/cloudStore';
    import { getUserProfile } from '$lib/api';
    import { syncAchievementsFromProfile, achievementStore } from '$lib/stores/achievementStore';
    import { addNotification } from '$lib/stores/notifications';
    import { getServerLabel } from '$lib/utils/profileUtils';
    import Modal from '$lib/components/modals/Modal.svelte';
    import Button from '$lib/components/Button.svelte';
    import Icon from '$lib/components/Icon.svelte';

    export let isOpen = false;

    const dispatch = createEventDispatcher();

    let loading = false;
    let profileData: any = null;
    let selectedGameUid = '';

    let prevIsOpen = false;
    $: if (isOpen && !prevIsOpen) {
        prevIsOpen = true;
        if ($user) {
            loadProfile();
        }
    }
    $: if (!isOpen && prevIsOpen) {
        prevIsOpen = false;
    }

    async function loadProfile() {
        if (!$user) return;
        loading = true;
        try {
            const token = await ($user as any).getIdToken();
            const profile = await getUserProfile(null, token);
            profileData = profile;
            if (profile?.details && profile.details.length > 0) {
                if (!selectedGameUid || !profile.details.some((a: any) => a.game_uid === selectedGameUid)) {
                    selectedGameUid = profile.details[0].game_uid;
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            loading = false;
        }
    }

    $: accounts = (profileData?.details || []) as any[];

    $: hasProgress = Object.values($achievementStore || {}).some((a) => (a.level || 0) > 0 || a.plated);

    $: if (accounts.length > 0 && (!selectedGameUid || !accounts.some((a) => a.game_uid === selectedGameUid))) {
        selectedGameUid = accounts[0].game_uid;
    }

    function handleSync() {
        if (!profileData || accounts.length === 0) return;

        const selectedAccount = accounts.find((a) => a.game_uid === selectedGameUid) || accounts[0];
        if (!selectedAccount) return;

        const result = syncAchievementsFromProfile(selectedAccount);
        if (result.totalFound === 0) {
            addNotification('warning', $t('achievements.noMedalsInProfile'));
        } else if (result.syncedCount > 0) {
            addNotification(
                'success',
                $t('achievements.syncSuccess').replace('{count}', String(result.syncedCount))
            );
        } else {
            addNotification('info', $t('achievements.syncNothingToUpdate'));
        }

        dispatch('synced', result);
        dispatch('close');
    }

    function close() {
        dispatch('close');
    }
</script>

<Modal {isOpen} on:close={close}>
    <div class="bg-white dark:bg-[#383838] border border-gray-200 dark:border-[#444444] rounded-2xl p-6 md:p-8 w-full max-w-lg shadow-2xl relative">
        <button
            on:click={close}
            class="absolute top-4 right-4 text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
        >
            <Icon name="close" class="w-6 h-6" />
        </button>

        <h3 class="text-2xl font-bold dark:text-white text-gray-900 mb-6 font-sdk">
            {$t('achievements.syncModalTitle')}
        </h3>

        {#if !$user}
            <div class="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-4 py-3 rounded-xl flex items-center gap-3.5">
                <Icon name="info" class="w-5 h-5 text-[#FFE145] shrink-0" />
                <div class="text-xs text-gray-600 dark:text-gray-300 leading-normal">
                    {$t('achievements.notLoggedInDesc')}
                    <a href="/profile" on:click={close} class="text-yellow-600 dark:text-[#FFE145] hover:underline block font-bold mt-0.5">
                        {$t('leaderboard.not_synced_btn')} &rarr;
                    </a>
                </div>
            </div>
        {:else if loading}
            <div class="flex flex-col items-center justify-center py-12 text-gray-400">
                <div class="w-7 h-7 border-2 border-[#FFE145] border-t-transparent rounded-full animate-spin"></div>
            </div>
        {:else if !profileData || accounts.length === 0}
            <div class="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-4 py-3 rounded-xl flex items-center gap-3.5">
                <Icon name="info" class="w-5 h-5 text-[#FFE145] shrink-0" />
                <div class="text-xs text-gray-600 dark:text-gray-300 leading-normal">
                    {$t('achievements.noAccountsDesc')}
                    <a href="/profile" on:click={close} class="text-yellow-600 dark:text-[#FFE145] hover:underline block font-bold mt-0.5">
                        {$t('leaderboard.not_synced_btn')} &rarr;
                    </a>
                </div>
            </div>
        {:else}
            <div class="flex flex-col gap-3">
                <span class="text-sm font-bold text-gray-900 dark:text-white font-sdk">
                    {$t('achievements.selectAccount')}
                </span>

                <div class="grid gap-2.5 max-h-[280px] overflow-y-auto pr-1">
                    {#each accounts as acc (acc.game_uid || acc.serverId)}
                        {@const isSelected = selectedGameUid === acc.game_uid}
                        {@const accName = acc.info?.base?.name || acc.name || acc.game_uid}
                        {@const accLevel = acc.info?.base?.level ?? acc.level ?? 1}
                        {@const accServer = getServerLabel(acc.info?.base?.serverId ?? acc.serverId)}

                        <button
                            type="button"
                            on:click={() => (selectedGameUid = acc.game_uid)}
                            class="group relative flex items-center justify-between m-0.5 p-3.5 bg-gray-50 dark:bg-white/5 border {isSelected
                                ? 'border-[#FFE145] ring-1 ring-[#FFE145]'
                                : 'border-gray-200 dark:border-[#444444] hover:border-gray-300 dark:hover:border-gray-500'} hover:shadow-sm transition-all text-left rounded-xl overflow-hidden cursor-pointer"
                        >
                            <div class="flex items-center gap-3 min-w-0">
                                <div
                                    class="w-4 h-4 rounded-full border flex items-center justify-center shrink-0 {isSelected
                                        ? 'border-[#FFE145] bg-[#FFE145]'
                                        : 'border-gray-400 dark:border-gray-500'}"
                                >
                                    {#if isSelected}
                                        <div class="w-1.5 h-1.5 rounded-full bg-black"></div>
                                    {/if}
                                </div>

                                <div class="flex flex-col min-w-0">
                                    <div class="flex items-center gap-2">
                                        <span class="text-sm font-bold truncate text-gray-900 dark:text-white font-sdk">
                                            {accName}
                                        </span>
                                        <span class="text-xs font-medium text-gray-500 dark:text-gray-400 font-nums">
                                            Lv.{accLevel}
                                        </span>
                                    </div>
                                    <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-[#B7B6B3]">
                                        <span class="bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                                            {accServer}
                                        </span>
                                        <span>&bull;</span>
                                        <span class="font-nums">UID: {acc.game_uid}</span>
                                    </div>
                                </div>
                            </div>
                        </button>
                    {/each}
                </div>

                {#if hasProgress}
                    <div class="bg-amber-500/10 border border-amber-500/20 px-4 py-3 rounded-xl flex items-center gap-3.5">
                        <Icon name="info" class="w-5 h-5 text-amber-500 dark:text-[#FFE145] shrink-0" />
                        <div class="text-xs text-amber-800 dark:text-amber-200/90 leading-normal">
                            {$t('achievements.syncWarningProgress')}
                        </div>
                    </div>
                {/if}
            </div>
        {/if}

        <div class="flex items-center justify-end gap-3 pt-4 mt-2">
            <Button variant="round" color="gray" onClick={close}>
                {$t('privacy.close')}
            </Button>
            <Button
                variant="round"
                color="yellow"
                disabled={!$user || !profileData || accounts.length === 0}
                onClick={handleSync}
            >
                {$t('achievements.syncAction')}
            </Button>
        </div>
    </div>
</Modal>
