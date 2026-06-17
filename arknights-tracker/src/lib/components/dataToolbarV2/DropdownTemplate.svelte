<script>
    import ResetButton from "$lib/components/dataToolbarV2/ResetButton.svelte";

    export let showResetButton = false;

    export let onResetButton = () => {};
</script>

<div
    class="z-[100] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-2rem)] max-w-[350px] max-h-[85vh] sm:relative sm:w-[500px] sm:max-w-[calc(100vw-2rem)] sm:transform-none sm:left-0 dark:bg-[#383838] dark:border-[#444444] bg-[#F2F2F2] rounded-2xl shadow-2xl border border-gray-200 p-5 flex flex-col gap-3 outline-none overflow-y-auto"
    role="dialog"
    aria-modal="true"
    tabindex="-1"
    on:click|stopPropagation
    on:keydown|stopPropagation
>

    <div class="flex justify-between">

        <slot name="top" />

        {#if showResetButton}

            <div class="flex justify-end">

                <ResetButton
                    onClick={onResetButton}
                />

            </div>

        {/if}

    </div>

    <slot />

</div>