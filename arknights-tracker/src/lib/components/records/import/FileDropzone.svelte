<script>
    import { createEventDispatcher } from "svelte";
    import { t } from "$lib/i18n";
    import Icon from "$lib/components/Icon.svelte";

    export let accept = ".endmin";
    export let selectedFileName = "";
    export let filesLabel = "";
    export let inputId = "file-input";

    const dispatch = createEventDispatcher();
    let isDragging = false;

    function handleFileSelect(e) {
        const file = e.target.files?.[0];
        if (file) {
            dispatch("select", file);
        }
    }

    function handleFileDrop(e) {
        isDragging = false;
        const file = e.dataTransfer?.files?.[0];
        if (file) {
            dispatch("select", file);
        }
    }
</script>

<div class="max-w-4xl mb-6 relative group">
    <label
        for={inputId}
        class="flex flex-col items-center justify-center w-full min-h-[160px] p-6 border-2 border-dashed rounded-lg cursor-pointer transition-all text-center
        {isDragging
            ? 'bg-white border-[#FFE145] dark:bg-[#424242] dark:border-[#FFE145]'
            : 'bg-gray-50 border-gray-300 dark:bg-[#343434] dark:border-[#444444] hover:bg-white hover:border-[#FFE145] hover:dark:border-[#FFE145]'}"
        on:dragover|preventDefault={() => (isDragging = true)}
        on:dragenter|preventDefault={() => (isDragging = true)}
        on:dragleave|preventDefault={() => (isDragging = false)}
        on:drop|preventDefault={handleFileDrop}
    >
        <div class="flex flex-col items-center justify-center pt-5 pb-6">
            <div class="text-[#FFE145] mb-3">
                <Icon name="import" class="w-12 h-12" />
            </div>
            <p class="mb-2 text-sm text-gray-500 dark:text-gray-400 font-semibold">
                {$t("import.endmin_drag_drop")}
            </p>
            <p class="text-xs text-gray-400 dark:text-gray-500">
                {selectedFileName || filesLabel}
            </p>
        </div>
        <input
            id={inputId}
            type="file"
            {accept}
            class="hidden"
            on:change={handleFileSelect}
        />
    </label>
</div>
