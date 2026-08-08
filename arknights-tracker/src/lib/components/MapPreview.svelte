<script>
    import Icon from "$lib/components/Icon.svelte";
    import Modal from "$lib/components/modals/Modal.svelte";

    export let url = "";
    export let title = "";
    export let variant = "default";
    export let className = "";
    export let onZoom = null;

    let showZoomModal = false;

    function extractShortCode(rawUrl) {
        if (!rawUrl) return null;
        try {
            const parsed = new URL(rawUrl);
            const x = parsed.searchParams.get("x");
            if (x) return x;
            const parts = parsed.pathname.split("/").filter(Boolean);
            if (parts.length > 0) return parts[parts.length - 1];
        } catch (e) {}
        const xMatch = rawUrl.match(/[?&]x=([^&]+)/);
        if (xMatch) return xMatch[1];
        const parts = rawUrl.split("/").filter(Boolean);
        if (parts.length > 0) {
            const last = parts[parts.length - 1];
            if (last.includes("?")) return last.split("?")[0];
            return last;
        }
        return null;
    }

    $: code = extractShortCode(url);

    function handleZoom() {
        if (onZoom) {
            onZoom(code);
        } else {
            showZoomModal = true;
        }
    }
</script>

{#if code}
    {#if variant === "mini"}
        <div
            class="relative rounded-xl overflow-hidden aspect-[16/9] w-full md:w-48 shrink-0 shadow-sm border border-gray-200 dark:border-[#555] block bg-black/20 {className}"
        >
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                class="w-full h-full block group"
            >
                <img
                    src="https://cdn.opendfieldmap.org/_dev/endfield/atlos/seo/og/r2/{code}.jpg"
                    alt={title || "Open Endfield Map"}
                    class="w-full h-full object-cover"
                    loading="lazy"
                    referrerpolicy="no-referrer"
                />
                <div class="absolute inset-0 transition-colors flex items-end p-2 pointer-events-none">
                    <span class="text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-sm shadow group-hover:text-[#FFD800] transition-colors">
                        Open Endfield Map <Icon name="sendToLink" class="w-3 h-3 inline-block align-middle ml-0.5 text-current group-hover:text-[#FFD800]" />
                    </span>
                </div>
            </a>

            <button
                type="button"
                class="absolute top-2 right-2 z-10 flex items-center justify-center w-7 h-7 rounded-lg bg-black/50 hover:bg-black/80 text-white transition-all backdrop-blur-sm shadow cursor-pointer pointer-events-auto"
                on:click|preventDefault|stopPropagation={handleZoom}
            >
                <Icon name="zoom-in" class="w-4 h-4 text-white" />
            </button>
        </div>
    {:else}
        <div
            class="relative rounded-2xl overflow-hidden aspect-[1200/630] w-full block shadow-md border border-gray-100 dark:border-[#444] {className}"
        >
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                class="w-full h-full block group"
            >
                <img
                    src="https://cdn.opendfieldmap.org/_dev/endfield/atlos/seo/og/r2/{code}.jpg"
                    alt={title || "Open Endfield Map"}
                    class="w-full h-full object-cover"
                    loading="lazy"
                    referrerpolicy="no-referrer"
                />

                <div class="absolute inset-0 pointer-events-none"></div>

                <div
                    class="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white pointer-events-none"
                >
                    <div class="flex items-start gap-2.5">
                        <div class="w-[3px] bg-white rounded self-stretch"></div>
                        <span
                            class="text-md font-bold tracking-wide drop-shadow-md max-w-[250px] group-hover:text-[#FFD800] transition-colors"
                        >
                            {title ? `${title} - ` : ""}Open Endfield Map<Icon
                                name="sendToLink"
                                class="w-4 h-4 inline-block align-middle ml-1.5 text-current group-hover:text-[#FFD800]"
                            />
                        </span>
                    </div>
                </div>
            </a>

            <button
                type="button"
                class="absolute top-4 right-4 z-10 flex items-center justify-center w-11 h-11 rounded-xl bg-black/45 hover:bg-black/65 text-white transition-all duration-300 backdrop-blur-sm shadow-md cursor-pointer pointer-events-auto"
                on:click|preventDefault|stopPropagation={handleZoom}
            >
                <Icon name="zoom-in" class="w-7 h-7 text-white" />
            </button>
        </div>
    {/if}

    <Modal isOpen={showZoomModal} on:close={() => (showZoomModal = false)}>
        <div
            class="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center group pointer-events-auto"
        >
            <img
                src="https://cdn.opendfieldmap.org/_dev/endfield/atlos/seo/og/r2/{code}.jpg"
                alt="Map full screen"
                class="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/10 select-none"
                referrerpolicy="no-referrer"
            />

            <button
                type="button"
                class="absolute -top-12 right-0 md:-right-12 flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                on:click={() => (showZoomModal = false)}
            >
                <Icon name="close" class="w-6 h-6 text-white" />
            </button>
        </div>
    </Modal>
{/if}
