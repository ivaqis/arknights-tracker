<script>
    export let item;
    export let category;
    export let size = 64;
    
    const BASE_PATH = '/images/items/';
    $: imagePath = `${BASE_PATH}${category}/${item.icon || item.id + '.png'}`;
</script>

<img 
    src={imagePath}
    alt={item.name}
    width={size}
    height={size}
    style="
        image-rendering: pixelated;
        object-fit: contain;
    "
/>