<script>
    export let asButton = false;

    export let onClick;
</script>

<svelte:element
    this={asButton ? 'button' : 'div'}
    role={asButton ? "button" : "presentation"}
    class="text-sm dark:text-[#E0E0E0] font-bold text-gray-800 {asButton ? 'hover:opacity-70 cursor-pointer' : ''}"
    on:click={asButton ? onClick : undefined}
>

    <slot />

</svelte:element>