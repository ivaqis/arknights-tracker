<script>
    import { onMount } from "svelte";
    import { getImagePath } from "$lib/utils/imageUtils";
    import Icon from "$lib/components/Icons.svelte";

    export let item = null; 
    export let id = null;
    export let variant = "operator-icon"; 
    export let alt = "";
    export let size = "100%";
    export let className = ""; 
    export let style = "";

    $: rawId = id || (item?.icon) || (item?.id) || (item?.name);
    $: src = getImagePath(rawId, variant);

    let imgElement;
    let isLoaded = false;
    let hasError = false;
    let instantLoad = false;

    onMount(() => {
        if (imgElement && imgElement.complete) {
            isLoaded = true;
            instantLoad = true;
        }
    });

    function handleLoad() {
        isLoaded = true;
    }

    function handleError(e) {
        isLoaded = true;
        hasError = true;
    }

    $: sizeStyle = typeof size === 'number' ? `width: ${size}px; height: ${size}px;` : `width: ${size}; height: ${size};`;
    
    $: transitionClasses = instantLoad 
        ? "" 
        : "transition-opacity duration-500";
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
        bind:this={imgElement} 
        {src}
        alt={alt || rawId}
        loading="lazy"
        decoding="async"
        draggable="false"
        class="{className} object-cover {transitionClasses} {isLoaded ? 'opacity-100' : 'opacity-0'}"
        style="{sizeStyle} {style}"
        on:load={handleLoad}
        on:error={handleError}
    />
{/if}