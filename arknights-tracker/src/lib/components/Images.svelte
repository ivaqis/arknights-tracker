<script>
    import { getImagePath } from "$lib/utils/imageUtils";

    import Icon from "$lib/components/Icons.svelte";

    export let item = null; 
    export let id = null;
    export let variant = ""; 
    export let alt = "";
    export let size = "100%";
    export let className = ""; 
    export let style = "";
    export let interactive = false;

    $: rawId = id || (item?.icon) || (item?.id) || (item?.name);
    $: src = getImagePath(rawId, variant);

    let hasError = false;
    let isVisible = false;

    function imageHandler(node, currentSrc) {
        function handleLoad() {
            isVisible = true;
            hasError = false;
        }

        function handleErr() {
            isVisible = true;
            hasError = true;
        }

        node.addEventListener('load', handleLoad);
        node.addEventListener('error', handleErr);

        if (node.complete && node.naturalWidth > 0) {
            handleLoad();
        }

        return {
            update(newSrc) {
                if (newSrc !== currentSrc) {
                    isVisible = false;
                    hasError = false;
                }
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
    <img
        {src}
        use:imageHandler={src}
        alt={alt || rawId}
        loading="lazy"
        decoding="async"
        draggable={interactive ? "true" : "false"}
        class="{className} object-cover antialiased transition-opacity duration-300 {interactive ? '' : 'pointer-events-none select-none'} {isVisible ? 'opacity-100' : 'opacity-0'}"
        style="{smoothImageStyles} {sizeStyle} {style}"
    />
{/if}