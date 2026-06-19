<script>
    import { t } from "$lib/i18n";

    export let optionList = [];
    export let getLocaleFunc = (option) => $t(`sort.${option}`);

    // bindable
    export let selectedOption;

    function selectOption(option) {
        selectedOption = option;
    }

    $: isOptionSelected = (option) => option === selectedOption;
</script>

<div class="min-w-full py-1 flex flex-col bg-white dark:bg-[#383838] rounded-xl shadow-xl border border-gray-100 dark:border-[#444444] overflow-hidden">

    {#each optionList as option}

        <button
            class="px-4 py-2.5 text-left text-sm hover:bg-gray-50 hover:dark:bg-[#424242] transition-colors {
                isOptionSelected(option)
                    ? 'text-black font-bold bg-gray-50 dark:text-[#E0E0E0] dark:bg-[#424242]'
                    : 'text-gray-600 dark:text-[#B7B6B3]'
            }"
            on:click|stopPropagation={() => selectOption(option)}
        >

            {getLocaleFunc(option)}

        </button>

    {/each}

</div>