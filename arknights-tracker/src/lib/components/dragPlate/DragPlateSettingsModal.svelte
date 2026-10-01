<script>
    import Button from "$lib/components/Button.svelte";
    import { t } from "$lib/i18n";
    import { ctrlForZoom } from "$lib/stores/dragPlateSettings.js";

    export let isOpen;

    function toggleMode() {
        ctrlForZoom.update((v) => !v);
    }

    function stopPropagation(e) {
        e.stopPropagation();
    }

    function close() {
        isOpen = false;
    }

    function handleKeydown(e) {
        if (e.key === "Escape") close();
    }

</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}

    <div
        class="md:ml-[var(--sb-w)] fixed inset-0 bg-black/50 z-[60] flex items-center justify-center backdrop-blur-sm transition-opacity overflow-y-auto p-4 md:p-10"
        onclick={close}
        onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && close()}
        role="button"
        tabindex="0"
    >

        <div
            class="bg-white rounded-2xl p-8 w-[500px] max-w-[95vw] dark:bg-[#383838] dark:border-[#444444] shadow-2xl transform transition-all scale-100 cursor-default flex flex-col my-auto relative overflow-visible"
            onclick={stopPropagation}
            onkeydown={stopPropagation}
            role="dialog"
            aria-modal="true"
            tabindex="-1"
        >

            <h2 class="text-2xl font-bold dark:text-[#FDFDFD] mb-6 text-[#21272C] font-sdk shrink-0">
                {$t("settings.title")}
            </h2>

            <div class="flex items-center gap-3">

                <button
                    type="button"
                    role="switch"
                    aria-label="switch"
                    aria-checked={$ctrlForZoom}
                    class="shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none {$ctrlForZoom
                    ? 'bg-[#F9B90C]'
                    : 'bg-gray-200 dark:bg-[#555]'}"
                    onclick={toggleMode}
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

            <div class="mt-8 flex justify-end shrink-0">
                <div class="w-auto">
                    <Button variant="round" color="white" onClick={close}>
                        {$t("page.recordsSettings.close")}
                    </Button>
                </div>
            </div>

        </div>

    </div>

{/if}