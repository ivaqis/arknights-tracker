<script>
    import { createEventDispatcher } from "svelte";
    import { t } from "$lib/i18n.js";
    import Icon from "$lib/components/Icon.svelte";
    import Image from "$lib/components/Image.svelte";
    import Modal from "$lib/components/modals/Modal.svelte";
    import Select from "$lib/components/Select.svelte";

    export let isOpen = false;
    export let isPrivate = false;
    export let profile = null;
    export let activeAccount = null;
    export let primaryAccountOptions = [];
    export let filteredBackgrounds = [];
    export let bgSearchQuery = "";

    const dispatch = createEventDispatcher();
</script>

<Modal {isOpen} on:close={() => dispatch("close")}>
    <div class="bg-white dark:bg-[#383838] border border-gray-200 dark:border-[#444444] rounded-2xl p-6 md:p-8 w-full max-w-2xl shadow-2xl relative">
        <button
            on:click={() => dispatch("close")}
            class="absolute top-4 right-4 text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
        >
            <Icon name="close" class="w-6 h-6" />
        </button>

        <h3 class="text-xl font-bold dark:text-white text-gray-900 mb-6 font-sdk select-text">
            {$t("profile.settings_title")}
        </h3>

        <div class="flex items-center justify-between mb-6">
            <span class="text-sm text-gray-700 dark:text-gray-300 font-sdk pr-4 select-text">
                {$t("profile.settings_hide_data")}
            </span>
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
                on:click={() => dispatch("togglePrivate")}
                class="w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 shrink-0
                {isPrivate ? 'bg-[#FFE145]' : 'bg-gray-300 dark:bg-gray-600'}"
            >
                <div
                    class="bg-white dark:bg-[#1a1a1a] w-4 h-4 rounded-full shadow-md transform transition-transform duration-300
                    {isPrivate ? 'translate-x-6' : 'translate-x-0'}"
                ></div>
            </div>
        </div>

        <div class="mb-6 relative z-50">
            <span class="block text-sm font-bold text-gray-700 dark:text-gray-300 font-sdk mb-2">
                {$t("profile.settings_primary_account")}
            </span>
            {#if activeAccount}
                <div class="shadow-sm">
                    <Select
                        options={primaryAccountOptions}
                        value={activeAccount.records_uid || ""}
                        on:change={(e) => dispatch("selectRecordsUid", e.detail)}
                        placeholder={$t("profile.settings_primary_account_none")}
                        variant="black"
                    />
                </div>
            {:else}
                <div class="text-xs text-gray-500 dark:text-gray-400 bg-gray-50/20 dark:bg-[#2e2e2e]/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-center">
                    {$t("profile.sync_first_to_bind")}
                </div>
            {/if}
        </div>

        <div class="mb-6">
            <span class="block text-sm font-bold text-gray-700 dark:text-gray-300 font-sdk mb-2">
                {$t("profile.settings_background")}
            </span>
            <input
                type="text"
                bind:value={bgSearchQuery}
                on:input={() => dispatch("bgSearch", bgSearchQuery)}
                placeholder={$t("profile.settings_bg_search")}
                class="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFE145] mb-2"
            />
            <div class="max-h-[420px] overflow-y-auto grid grid-cols-4 gap-2 p-1 border border-gray-200 dark:border-white/10 rounded-lg bg-gray-50 dark:bg-white/5">
                <button
                    on:click={() => dispatch("selectBackground", null)}
                    class="flex flex-col items-center justify-center p-2 rounded-lg border-2 text-[10px] font-bold text-gray-500 dark:text-gray-400 bg-white/5 dark:bg-white/3 transition-all select-none outline-none
                    {!profile?.background ? 'border-[#FFE145] bg-[#FFE145]/15' : 'border-transparent hover:border-gray-300 dark:hover:border-white/20'}"
                >
                    <Icon name="noData" class="mb-1" />
                    <span class="text-center leading-tight">{$t("profile.settings_bg_none")}</span>
                </button>

                {#each filteredBackgrounds as bg (bg.id)}
                    <button
                        on:click={() => dispatch("selectBackground", bg.id)}
                        class="group relative flex flex-col rounded-lg border-2 overflow-hidden transition-all bg-white/5 dark:bg-white/3 outline-none
                        {profile?.background === bg.id ? 'border-[#FFE145] bg-[#FFE145]/5' : 'border-transparent hover:border-gray-300 dark:hover:border-white/20'}"
                    >
                        <div class="w-full aspect-video bg-neutral-800 relative overflow-hidden">
                            <Image id="{bg.id}.webp" variant="operator-art-lq" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            <div class="absolute top-0.5 left-0.5 bg-black/60 text-white text-[8px] font-bold px-1 py-0.2 rounded leading-none">
                                P{bg.pot}
                            </div>
                        </div>
                        <div class="p-1 text-[9px] font-bold text-gray-700 dark:text-gray-300 text-center truncate w-full">
                            {$t(`characters.${bg.id.split('_')[0]}`) || bg.name}
                        </div>
                    </button>
                {/each}
            </div>
        </div>

        <button
            on:click={() => dispatch("logout")}
            class="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors font-sdk"
        >
            {$t("profile.settings_logout")}
        </button>
    </div>
</Modal>
