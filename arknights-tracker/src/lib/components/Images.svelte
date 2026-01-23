<script>
    import { getImagePath } from "$lib/utils/imageUtils";

    export let item = null; 
    export let id = null;
    export let variant = "operator-icon"; 
    export let alt = "";
    export let size = "100%";
    export let className = ""; 
    export let style = "";

    $: rawId = id || (item?.icon) || (item?.id) || (item?.name);
    $: src = getImagePath(rawId, variant);

    function handleError(e) {
        if (e.target.dataset.hasError) return;
        e.target.dataset.hasError = "true";
        
        // ПОЛЕЗНО ДЛЯ ОТЛАДКИ:
        console.error(`Image failed to load: ${src}`);

        if (variant.includes('banner') || variant.includes('event')) {
             // Делаем картинку прозрачной, если нет замены, чтобы не висел текст
             e.target.style.opacity = "0"; 
             // Либо поставь дефолтную заглушку:
             // e.target.src = "/images/events/icon/default_event.png";
        } else {
             e.target.src = "/images/avatars/default_6star.png";
        }
    }

    $: sizeStyle = typeof size === 'number' ? `width: ${size}px; height: ${size}px;` : `width: ${size}; height: ${size};`;
</script>

<img
    {src}
    alt={alt || rawId}
    loading="lazy"
    class="{className} object-cover transition-opacity duration-300"
    style="{sizeStyle} {style}"
    on:error={handleError}
/>