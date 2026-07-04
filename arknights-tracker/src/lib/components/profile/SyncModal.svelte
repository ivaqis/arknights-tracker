<script>
    import { createEventDispatcher } from "svelte";
    import { t } from "$lib/i18n.js";
    import { fade } from "svelte/transition";
    import Icon from "$lib/components/Icon.svelte";
    import Modal from "$lib/components/modals/Modal.svelte";
    import ConfirmationModal from "$lib/components/modals/ConfirmationModal.svelte";
    import Checkbox from "$lib/components/Checkbox.svelte";

    export let isOpen = false;

    const dispatch = createEventDispatcher();

    let syncActiveTab = "new";
    let selectedServer = "both";
    let gameTokenInput = "";
    let showToken = false;
    let isSaveTokenEnabled = false;
    let tokenName = "";
    let syncing = false;
    let savedSyncTokens = [];

    function loadSavedSyncTokens() {
        try {
            const raw = localStorage.getItem("profile_saved_tokens");
            if (raw) savedSyncTokens = JSON.parse(raw);
        } catch (e) {
            console.error(e);
        }
    }

    function saveSyncToken(name, token, serverId) {
        try {
            if (savedSyncTokens.some((t) => t.token === token && t.serverId === serverId)) return;
            const newToken = { name, token, serverId, date: Date.now() };
            const newList = [newToken, ...savedSyncTokens];
            localStorage.setItem("profile_saved_tokens", JSON.stringify(newList));
            savedSyncTokens = newList;
        } catch (e) {
            console.error(e);
        }
    }

    let tokenToDeleteIndex = null;
    let showDeleteTokenModal = false;

    function triggerDeleteSyncToken(index) {
        tokenToDeleteIndex = index;
        showDeleteTokenModal = true;
    }

    export function confirmDeleteSyncToken() {
        showDeleteTokenModal = false;
        if (tokenToDeleteIndex === null || tokenToDeleteIndex === undefined) return;
        const newList = [...savedSyncTokens];
        newList.splice(tokenToDeleteIndex, 1);
        savedSyncTokens = newList;
        localStorage.setItem("profile_saved_tokens", JSON.stringify(newList));
        tokenToDeleteIndex = null;
    }

    function selectSyncToken(item) {
        gameTokenInput = item.token;
        selectedServer = item.serverId || "both";
        syncActiveTab = "new";
    }

    export function onSyncSuccess() {
        syncing = false;
        syncActiveTab = "new";
        gameTokenInput = "";
    }

    async function handleSync() {
        const rawInput = gameTokenInput.trim();
        if (!rawInput) {
            dispatch("error", $t("profile.token_empty") || "Game Token cannot be empty");
            return;
        }

        let tokenToUse = rawInput;
        if (rawInput.startsWith('{') && rawInput.endsWith('}')) {
            try {
                const parsed = JSON.parse(rawInput);
                if (parsed.data && parsed.data.content) {
                    tokenToUse = parsed.data.content.trim();
                } else if (parsed.content) {
                    tokenToUse = parsed.content.trim();
                } else {
                    dispatch("error", $t("profile.token_invalid") || "Invalid token format. It must be a 24-character code or a valid JSON containing it");
                    return;
                }
            } catch (err) {
                dispatch("error", $t("profile.token_invalid") || "Invalid token format. It must be a 24-character code or a valid JSON containing it");
                return;
            }
        }

        // Validate final token characters and length
        const base64Regex = /^[A-Za-z0-9+/=_-]+$/;
        if (!base64Regex.test(tokenToUse) || tokenToUse.length < 10 || tokenToUse.length > 128) {
            dispatch("error", $t("profile.token_invalid") || "Invalid token format. It must be a 24-character code or a valid JSON containing it");
            return;
        }

        syncing = true;
        dispatch("sync", {
            token: tokenToUse,
            server: selectedServer,
            saveName: isSaveTokenEnabled && tokenName.trim() ? tokenName.trim() : null,
            onSuccess: (didSave) => {
                if (didSave === false) {
                    const existingIdx = savedSyncTokens.findIndex(t => t.token === tokenToUse);
                    if (existingIdx !== -1) {
                        let updated = false;
                        if (savedSyncTokens[existingIdx].serverId !== selectedServer) {
                            savedSyncTokens[existingIdx].serverId = selectedServer;
                            updated = true;
                        }
                        if (isSaveTokenEnabled && tokenName.trim() && savedSyncTokens[existingIdx].name !== tokenName.trim()) {
                            savedSyncTokens[existingIdx].name = tokenName.trim();
                            updated = true;
                        }
                        if (updated) {
                            localStorage.setItem("profile_saved_tokens", JSON.stringify(savedSyncTokens));
                            savedSyncTokens = [...savedSyncTokens];
                        }
                    } else if (isSaveTokenEnabled && tokenName.trim()) {
                        saveSyncToken(tokenName.trim(), tokenToUse, selectedServer);
                    }
                    tokenName = "";
                    isSaveTokenEnabled = false;
                    gameTokenInput = "";
                    syncing = false;
                }
            },
            onError: () => {
                syncing = false;
            }
        });
    }

    $: if (isOpen) loadSavedSyncTokens();
</script>

<Modal {isOpen} on:close={() => dispatch("close")}>
    <div class="bg-white dark:bg-[#383838] border border-gray-200 dark:border-[#444444] rounded-2xl p-6 md:p-8 w-full max-w-lg shadow-2xl relative">
        <button
            on:click={() => dispatch("close")}
            class="absolute top-4 right-4 text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
        >
            <Icon name="close" class="w-6 h-6" />
        </button>

        <h3 class="text-2xl font-bold dark:text-white text-gray-900 mb-6 font-sdk">
            {$t("profile.sync_with_game")}
        </h3>

        <div class="flex border-b border-gray-200 dark:border-[#444444] mb-6 relative">
            <button
                class="px-6 py-3 text-sm font-bold transition-all relative border-b-2
                {syncActiveTab === 'new'
                    ? 'text-[#21272C] dark:text-[#FDFDFD] border-[#FFE145]'
                    : 'text-gray-400 hover:text-gray-600 hover:dark:bg-[#424242] dark:text-[#B7B6B3] border-transparent hover:bg-gray-50'}"
                on:click={() => (syncActiveTab = "new")}
            >
                {$t("profile.tab_new")}
            </button>
            <button
                class="px-6 py-3 text-sm font-bold transition-all relative flex items-center gap-2 border-b-2
                {syncActiveTab === 'saved'
                    ? 'text-[#21272C] dark:text-[#FDFDFD] border-[#FFE145]'
                    : 'text-gray-400 hover:text-gray-600 hover:dark:bg-[#424242] dark:text-[#B7B6B3] border-transparent hover:bg-gray-50'}"
                on:click={() => (syncActiveTab = "saved")}
            >
                {$t("profile.tab_saved")}
                {#if savedSyncTokens.length > 0}
                    <span class="bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white text-[10px] px-1.5 py-0.5 rounded-full leading-none">
                        {savedSyncTokens.length}
                    </span>
                {/if}
            </button>
        </div>

        {#if syncActiveTab === 'new'}
            <div class="flex gap-2 mb-4 p-1 bg-gray-100 dark:bg-[#2C2C2C] rounded-lg w-fit transition-all">
                <button
                    type="button"
                    class="px-4 py-1.5 text-xs font-bold rounded-md transition-colors {selectedServer === 'both'
                        ? 'bg-white dark:bg-[#444] text-[#21272C] dark:text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}"
                    on:click={() => (selectedServer = "both")}
                >
                    {$t("profile.all")}
                </button>
                <button
                    type="button"
                    class="px-4 py-1.5 text-xs font-bold rounded-md transition-colors {selectedServer === '3'
                        ? 'bg-white dark:bg-[#444] text-[#21272C] dark:text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}"
                    on:click={() => (selectedServer = '3')}
                >
                    Americas / Europe
                </button>
                <button
                    type="button"
                    class="px-4 py-1.5 text-xs font-bold rounded-md transition-colors {selectedServer === '2'
                        ? 'bg-white dark:bg-[#444] text-[#21272C] dark:text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}"
                    on:click={() => (selectedServer = '2')}
                >
                    Asia
                </button>
            </div>

            <div class="flex flex-col gap-6 text-left mb-6 font-mono text-sm">
                <div class="flex gap-4">
                    <div class="w-6 h-6 rounded-full bg-[#FFE145] text-gray-900 flex items-center justify-center font-bold font-sdk text-xs shrink-0 mt-0.5">1</div>
                    <div class="flex-1">
                        <p class="text-sm text-gray-800 dark:text-white font-sdk font-bold mb-1 select-text">{$t("profile.sync_step1")}</p>
                        <a href="https://endfield.gryphline.com/" target="_blank" rel="noopener noreferrer" class="text-xs text-amber-600 dark:text-[#FFE145] hover:underline font-mono break-all select-text">
                            https://endfield.gryphline.com/
                        </a>
                    </div>
                </div>
                <div class="flex gap-4">
                    <div class="w-6 h-6 rounded-full bg-[#FFE145] text-gray-900 flex items-center justify-center font-bold font-sdk text-xs shrink-0 mt-0.5">2</div>
                    <div class="flex-1">
                        <p class="text-sm text-gray-800 dark:text-white font-sdk font-bold mb-1 select-text">{$t("profile.sync_step2")}</p>
                        <a href="https://web-api.gryphline.com/cookie_store/account_token" target="_blank" rel="noopener noreferrer" class="text-xs text-amber-600 dark:text-[#FFE145] hover:underline font-mono break-all select-text">
                            https://web-api.gryphline.com/cookie_store/account_token
                        </a>
                    </div>
                </div>
                <div class="flex gap-4">
                    <div class="w-6 h-6 rounded-full bg-[#FFE145] text-gray-900 flex items-center justify-center font-bold font-sdk text-xs shrink-0 mt-0.5">3</div>
                    <div class="flex-1">
                        <p class="text-sm text-gray-800 dark:text-white font-sdk font-bold mb-2 select-text">{$t("profile.sync_step3")}</p>
                        <div class="relative w-full">
                            <input
                                type={showToken ? "text" : "password"}
                                bind:value={gameTokenInput}
                                placeholder={`{"code":0,"data":{"content":"QqW2fmIQq...ZctQjc"},"msg":""}`}
                                class="w-full p-2.5 bg-gray-50 dark:bg-[#343434] dark:border-[#444444] dark:text-[#E0E0E0] border border-gray-200 focus:bg-white focus:border-[#FFE145] focus:dark:border-[#FFE145] rounded-md text-sm outline-none text-[#21272C] transition-all font-mono pl-4 pr-12"
                                disabled={syncing}
                            />
                            <button
                                type="button"
                                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                                on:click={() => showToken = !showToken}
                                aria-label="Toggle token visibility"
                            >
                                <Icon name={showToken ? "eyeOpen" : "eyeClosed"} class="w-5 h-5 fill-current" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mt-4 mb-6 text-left">
                <Checkbox bind:checked={isSaveTokenEnabled} variant="yellow" align="start">
                    <div>
                        <span class="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer font-medium text-sm">
                            {$t("import.save_label_token")}
                        </span>
                        {#if isSaveTokenEnabled}
                            <div class="text-gray-500 dark:text-gray-400 text-xs mt-1 max-w-md">
                                {$t("import.save_desc_token")}
                            </div>
                        {/if}
                    </div>
                </Checkbox>

                {#if isSaveTokenEnabled}
                    <div class="mt-3" in:fade>
                        <input
                            type="text"
                            bind:value={tokenName}
                            placeholder={$t("profile.token_name_placeholder")}
                            class="w-full p-2.5 bg-gray-50 dark:bg-[#343434] dark:border-[#444444] dark:text-[#E0E0E0] border border-gray-200 focus:bg-white focus:border-[#FFE145] focus:dark:border-[#FFE145] rounded-md text-sm outline-none text-[#21272C] transition-all font-mono"
                            disabled={syncing}
                        />
                    </div>
                {/if}
            </div>

            <div class="flex flex-col gap-3">
                <button
                    on:click={handleSync}
                    class="w-full py-3 bg-[#FFE145] hover:bg-[#ebd03e] text-gray-900 font-bold rounded-lg transition-colors font-sdk flex items-center justify-center gap-2 disabled:opacity-50"
                    disabled={syncing}
                >
                    {#if syncing}
                        <Icon name="loading" class="w-5 h-5 animate-spin" />
                        <span>Updating...</span>
                    {:else}
                        <Icon name="refresh" class="w-4 h-4" />
                        <span>{$t("profile.update_btn")}</span>
                    {/if}
                </button>
            </div>
        {:else}
            <div class="max-w-4xl mb-2 text-left">
                {#if savedSyncTokens.length === 0}
                    <div class="flex flex-col items-center justify-center py-8 border-2 border-gray-200 dark:border-[#444444] border-dashed rounded-lg text-gray-400 dark:text-gray-500">
                        <Icon name="noData" class="w-8 h-8 mb-2 opacity-30" />
                        <span class="mt-2 text-sm font-medium">{$t("profile.no_saved_tokens")}</span>
                    </div>
                {:else}
                    <div class="grid gap-3 pb-3 max-h-[420px] overflow-y-auto pr-1">
                        {#each savedSyncTokens as item, i}
                            <div class="group relative flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#444444] hover:shadow-sm transition-all text-left rounded-md overflow-hidden">
                                <button
                                    type="button"
                                    class="absolute inset-0 w-full h-full z-0 cursor-pointer focus:outline-none"
                                    on:click={() => selectSyncToken(item)}
                                    aria-label="Select {item.name}"
                                ></button>
                                <div class="pl-2 relative z-10 pointer-events-none">
                                    <div class="font-bold text-gray-900 dark:text-white text-base font-sdk">
                                        {item.name}
                                    </div>
                                    <div class="flex gap-2 items-center mt-2">
                                        <span class="text-[10px] bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-white px-2 py-0.5 rounded-full font-medium">
                                            {item.serverId === '3' ? 'Americas / Europe' : item.serverId === '2' ? 'Asia' : 'Both'}
                                        </span>
                                        <span class="text-[10px] text-gray-500 dark:text-[#B7B6B3] font-medium">
                                            {new Date(item.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <div class="flex items-center gap-4 z-20 relative pointer-events-none">
                                    <button
                                        type="button"
                                        class="w-8 h-8 flex items-center justify-center text-gray-400 dark:text-gray-300 hover:text-white hover:bg-red-500 rounded transition-colors pointer-events-auto cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500"
                                        on:click|stopPropagation={() => triggerDeleteSyncToken(i)}
                                    >
                                        <Icon name="close" class="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>
        {/if}
    </div>
</Modal>

<ConfirmationModal
    isOpen={showDeleteTokenModal}
    title={$t("import.delete_confirm") || "Delete this saved token?"}
    confirmText={$t("settings.account.deleteAccount") || "Delete"}
    isDestructive={true}
    on:confirm={confirmDeleteSyncToken}
    on:close={() => (showDeleteTokenModal = false)}
/>
