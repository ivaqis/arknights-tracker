<script>
    export let categoryList = [];
    export let highlightedCategoryList = [];

    export let getLocaleFunc = (category) => category;

    // bindable
    export let selectedCategory;

    function selectCategory(category) {
        selectedCategory = category;
    }

    $: isSelected = (category) => selectedCategory === category;

    $: isHighlighted = (category) => highlightedCategoryList.includes(category);

    $: getClasses = (category) => {
        if (isSelected(category)) {
            return "bg-white dark:bg-[#444] shadow-sm text-[#21272C] dark:text-white";
        }

        if (isHighlighted(category)) {
            return "hover:bg-gray-200 dark:hover:bg-[#333] text-[#F9B90C]";
        }

        return "hover:bg-gray-200 dark:hover:bg-[#333] text-gray-500 dark:text-gray-400";
    };

</script>

<div class="flex items-center gap-1 p-1 w-fit bg-gray-100 dark:bg-[#2C2C2C] rounded-lg">

    {#each categoryList as category}

        <button
            class="flex items-center px-3 py-1.5 gap-1.5 rounded-md font-bold transition-all text-xs {getClasses(category)}"
            on:click={() => selectCategory(category)}
        >

            {getLocaleFunc(category)}

            {#if isHighlighted(category)}

                <div
                    class="w-1.5 h-1.5 rounded-full bg-[#F9B90C] {
                        isHighlighted(category)
                            ? 'shadow-[0_0_6px_rgba(249,185,12,0.6)]'
                            : ''
                    }"
                ></div>

            {/if}

        </button>

    {/each}

</div>