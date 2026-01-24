<script>
    import { getImagePath } from "$lib/utils/imageUtils";

    export let item = null; 
    export let id = null;
    export let variant = "operator-icon"; 
    export let alt = "";
    export let size = "100%"; // Может прийти число 20 или строка "100%"
    export let className = ""; 
    export let style = "";

    $: rawId = id || (item?.icon) || (item?.id) || (item?.name);
    $: src = getImagePath(rawId, variant);

    function handleError(e) {
        if (e.target.dataset.hasError) return;
        e.target.dataset.hasError = "true";
        
        // Для отладки можешь раскомментировать:
        // console.error(`Image failed: ${src}`);

        if (variant.includes('banner') || variant.includes('event')) {
             e.target.style.opacity = "0"; 
        } else {
             // Дефолтная заглушка
             e.target.src = "/images/avatars/default_6star.png";
        }
    }

    // Исправление для size: если число, добавляем 'px', иначе оставляем как есть
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