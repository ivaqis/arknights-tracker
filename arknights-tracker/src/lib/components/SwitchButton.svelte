<script>
    export let isActive = false;

    function toggle() {
        isActive = !isActive;
    }
</script>

<button
    role="switch"
    aria-label="switch"
    aria-checked={isActive}
    class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none {
        isActive
            ? 'bg-[#F9B90C]'
            : 'bg-gray-200 dark:bg-[#555]'
    }"
    on:click={toggle}
>

    <span
        class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm {
            isActive
                ? 'translate-x-6'
                : 'translate-x-1'
        }"
    ></span>

</button>