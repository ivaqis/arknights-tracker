<script>
    import { t } from "$lib/i18n";

    export let onClick;

</script>

<button
    class="text-xs font-bold text-gray-500 mb-2 dark:text-gray-400 border border-gray-300 dark:border-[#444444] rounded-full px-4 py-1.5 hover:text-[#F9B90C] hover:border-[#F9B90C] hover:bg-white hover:dark:bg-[#FFB200]/80 hover:dark:border-[#FFB200] hover:dark:text-[#E0E0E0] transition-all uppercase tracking-wider"
    on:click={onClick}
>
    {$t("sort.reset")}
</button>