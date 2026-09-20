<script>
    import { createEventDispatcher } from "svelte";
    import { t } from "$lib/i18n.js";
    import Icon from "$lib/components/Icon.svelte";
    import Button from "$lib/components/Button.svelte";
    import Modal from "$lib/components/modals/Modal.svelte";

    export let isOpen = false;
    export let imageUrl = null;
    export let imageBlob = null;
    export let operatorName = "operator";
    export let fileName = "";
    export let isGenerating = false;

    const dispatch = createEventDispatcher();

    let copied = false;

    function handleDownload() {
        if (!imageUrl) return;
        const link = document.createElement("a");
        link.download = fileName || `goyfield_${operatorName || "operator"}_${new Date().toISOString().slice(0, 10)}.png`;
        link.href = imageUrl;
        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    async function handleCopy() {
        if (!imageBlob) return;
        try {
            await navigator.clipboard.write([
                new ClipboardItem({
                    "image/png": imageBlob
                })
            ]);
            copied = true;
            setTimeout(() => {
                copied = false;
            }, 2000);
        } catch (e) {
            console.error("Failed to copy image to clipboard", e);
        }
    }
</script>

<Modal {isOpen} on:close={() => dispatch("close")}>
    <div class="bg-white dark:bg-[#383838] border border-gray-200 dark:border-[#444444] rounded-2xl p-4 md:p-6 w-full max-w-4xl relative flex flex-col items-center">

        <div class="w-full flex items-center justify-center min-h-[250px] max-h-[65vh] mb-4">
            {#if isGenerating}
                <div class="flex flex-col items-center gap-3 py-12 text-gray-600 dark:text-gray-300 font-sdk">
                    <Icon name="loading" class="w-8 h-8 text-[#FFE145] animate-spin" />
                    <span class="text-sm">{$t("profile.generating_image")}</span>
                </div>
            {:else if imageUrl}
                <a
                    href={imageUrl}
                    download={fileName || `goyfield_${operatorName || "operator"}_${new Date().toISOString().slice(0, 10)}.png`}
                    class="inline-block outline-none cursor-grab active:cursor-grabbing"
                    on:click={(e) => {
                        if (e.target.tagName !== "BUTTON") {
                            e.preventDefault();
                        }
                    }}
                >
                    <img
                        src={imageUrl}
                        alt={operatorName}
                        draggable="true"
                        class="max-w-full max-h-[60vh] object-contain rounded-lg"
                    />
                </a>
            {/if}
        </div>

        <div class="w-full flex flex-wrap items-center justify-between gap-2.5">
            <div class="flex flex-wrap items-center gap-2.5">
                {#if !isGenerating && imageUrl}
                    <button
                        type="button"
                        on:click={handleDownload}
                        class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs md:text-sm font-bold font-sdk transition-all duration-200 cursor-pointer bg-[#FFE145] hover:bg-[#ffe666] text-black active:scale-95"
                    >
                        <Icon name="import" class="w-4 h-4" />
                        <span>{$t("profile.download_png")}</span>
                    </button>

                    <button
                        type="button"
                        on:click={handleCopy}
                        class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs md:text-sm font-bold font-sdk transition-all duration-200 cursor-pointer bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-white/10 active:scale-95"
                    >
                        {#if copied}
                            <Icon name="success" class="w-4 h-4 text-[#FFE145]" />
                        {:else}
                            <Icon name="copy" class="w-4 h-4" />
                        {/if}
                        <span>{$t("common.copy")}</span>
                    </button>
                {/if}
            </div>

            <Button variant="roundSmall" onClick={() => dispatch("close")}>
                {$t("privacy.close")}
            </Button>
        </div>
    </div>
</Modal>
