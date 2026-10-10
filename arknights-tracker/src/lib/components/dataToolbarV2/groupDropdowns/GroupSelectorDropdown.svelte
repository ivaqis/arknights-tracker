<script
    generics="T extends string | number"
    lang="ts"
>
    import DropdownTemplate from "$lib/components/dataToolbarV2/DropdownTemplate.svelte";
    import type { GroupSelectEvent } from "$lib/components/dataToolbarV2/groupDropdowns/GroupSelectEvent";
    import SwitchButton from "$lib/components/SwitchButton.svelte";
    import { t } from "$lib/i18n";

    export let optionList: readonly T[];
    export let getLocaleFn: (option: T) => string = String;

    // bindable
    export let selectedOption: T;
    export let isGroupSortActive: boolean | null = null;

    export let onOptionSelect: ((event: GroupSelectEvent<T>) => void) | undefined = undefined;
    export let onResetButtonClick: (() => void) | undefined = undefined;

    function selectOption(option: T) {
        const prev = selectedOption;

        selectedOption = option;

        onOptionSelect?.({
            previousOption: prev,
            newOption: option,
            isGroupSortActive: isGroupSortActive,
        });
    }

</script>

<DropdownTemplate
    onResetButton={onResetButtonClick}
    showResetButton={onResetButtonClick !== undefined}
>

    <div
        slot="top"
        class="flex items-center gap-3 pl-2"
        class:hidden={isGroupSortActive === null}
    >
        {#if isGroupSortActive !== null}

            <span class="text-sm font-bold dark:text-[#E0E0E0] text-gray-800">
                {$t("sort.sortGroups")}
            </span>

            <SwitchButton
                bind:isActive={isGroupSortActive}
            />

        {/if}
    </div>

    <div class="flex flex-col">

        {#each optionList as option}

            <button
                class="px-4 py-2.5 rounded text-left text-sm hover:bg-gray-50 hover:dark:bg-[#424242] transition-colors {
                    option === selectedOption
                        ? 'text-black font-bold bg-gray-50 dark:text-[#E0E0E0] dark:bg-[#424242]'
                        : 'text-gray-600 dark:text-[#B7B6B3]'
                }"
                on:click|stopPropagation={() => selectOption(option)}
            >
                {getLocaleFn(option)}
            </button>

        {/each}

    </div>

</DropdownTemplate>