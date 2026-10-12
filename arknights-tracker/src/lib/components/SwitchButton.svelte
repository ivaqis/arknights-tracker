<script>
    import { createEventDispatcher } from "svelte";

    export let isActive = false;

    const dispatch = createEventDispatcher();

    function toggle(event) {
        isActive = !isActive;
        dispatch("click", event);
        dispatch("change", isActive);
    }
</script>

<button
    role="switch"
    aria-label="switch"
    aria-checked={isActive}
    class="relative inline-flex h-6 w-11 items-center shrink-0 rounded-full transition-colors focus:outline-none {
        isActive
            ? 'bg-[#F9B90C]'
            : 'bg-gray-300 hover:bg-[#C6C9CF] dark:bg-[#555] hover:dark:bg-[#5B5B5B]'
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