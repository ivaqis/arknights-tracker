<script context="module">
    const loadedCache = new Set();
</script>

<script>
    import { getImagePath } from "$lib/utils/imageUtils";

    import Icon from "$lib/components/Icon.svelte";

    export let item = null; 
    export let id = null;
    export let variant = ""; 
    export let alt = "";
    export let size = "100%";
    export let className = ""; 
    export let style = "";
    export let interactive = false;
    export let priority = false;
    export let loading = "lazy";
    export let fetchpriority = "auto";

    $: rawId = id || (item?.icon) || (item?.id) || (item?.name);
    $: initialSrc = getImagePath(rawId, variant);

    const FALLBACK_EXTS = ['.webp', '.png', '.jpg', '.jpeg', '.gif'];

    function getCandidates(url) {
        if (!url || url.startsWith("data:") || url.startsWith("http://") || url.startsWith("https://")) {
            return [url];
        }
        const lastDot = url.lastIndexOf('.');
        if (lastDot === -1) return [url];

        const base = url.substring(0, lastDot);
        const currentExt = url.substring(lastDot).toLowerCase();

        const list = [url];
        for (const ext of FALLBACK_EXTS) {
            if (ext !== currentExt) {
                list.push(base + ext);
            }
        }
        return list;
    }

    let candidates = [];
    let candidateIndex = 0;
    let currentSrc = "";
    let hasError = false;
    let isVisible = false;
    let isInstant = false;

    $: {
        candidates = getCandidates(initialSrc);
        candidateIndex = 0;
        currentSrc = candidates[0] || "";
        hasError = false;
        isInstant = loadedCache.has(currentSrc);
        isVisible = isInstant;
    }

    function imageHandler(node) {
        function handleLoad() {
            if (currentSrc) loadedCache.add(currentSrc);
            isVisible = true;
            hasError = false;
        }

        function handleErr() {
            if (candidateIndex < candidates.length - 1) {
                candidateIndex += 1;
                currentSrc = candidates[candidateIndex];
                node.src = currentSrc;
            } else {
                isVisible = true;
                hasError = true;
            }
        }

        function checkComplete() {
            if (node.complete) {
                if (node.naturalWidth > 0) {
                    handleLoad();
                } else if (node.naturalWidth === 0 && node.src) {
                    handleErr();
                }
            }
        }

        node.addEventListener('load', handleLoad);
        node.addEventListener('error', handleErr);

        checkComplete();

        return {
            update() {
                checkComplete();
            },
            destroy() {
                node.removeEventListener('load', handleLoad);
                node.removeEventListener('error', handleErr);
            }
        };
    }

    $: sizeStyle = typeof size === 'number' ? `width: ${size}px; height: ${size}px;` : `width: ${size}; height: ${size};`;
    $: isSmallIcon = variant.includes('icon') && !variant.includes('banner');
    $: smoothImageStyles = isSmallIcon 
        ? "image-rendering: auto;" 
        : "image-rendering: -webkit-optimize-contrast; transform: translateZ(0); backface-visibility: hidden;";
    $: hasObjectFit = (className || "").split(' ').some(c => c.startsWith('object-'));
</script>

{#if hasError}
    <div 
        class="{className} flex items-center justify-center bg-gray-100 dark:bg-[#3d3d3d] text-gray-400 dark:text-[#7A7A7A]"
        style="{sizeStyle} {style}"
    >
        {#if !variant.includes('banner') && !variant.includes('event')}
             <Icon name="noData" className="w-1/2 h-1/2 opacity-50" />
        {/if}
    </div>
{:else}
    {#if !isVisible}
        <div 
            class="flex items-center justify-center bg-gray-100/10 dark:bg-[#3d3d3d]/10 pointer-events-none z-10"
            style="position: absolute; inset: 0; {sizeStyle}"
        >
            <Icon name="loading" class="w-6 h-6 max-w-[18px] max-h-[18px] text-[#A0A0A0] animate-spin" />
        </div>
    {/if}
    <img
        src={currentSrc}
        use:imageHandler={currentSrc}
        alt={alt || rawId}
        loading={priority ? "eager" : loading}
        fetchpriority={priority ? "high" : fetchpriority}
        decoding="async"
        referrerpolicy="no-referrer"
        draggable={interactive ? "true" : "false"}
        class="{className} {hasObjectFit ? '' : 'object-cover'} antialiased {isInstant ? '' : 'transition-opacity duration-300'} {interactive ? '' : 'pointer-events-none select-none'} {isVisible ? 'opacity-100' : 'opacity-0'}"
        style="{smoothImageStyles} {sizeStyle} {style}"
    />
{/if}