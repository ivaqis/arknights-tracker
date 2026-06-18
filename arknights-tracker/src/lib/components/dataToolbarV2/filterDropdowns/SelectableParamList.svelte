<script>
    export let paramList = [];

    export let getLocaleFunc = (param) => param;
    export let paramBox;

    // bindable
    export let selectedParamSet = new Set();

    $: if (!selectedParamSet) {
        selectedParamSet = new Set();
    }

    function forceSelectedParamsUpdate() {
        selectedParamSet = selectedParamSet;
    }

    function toggleParam(param) {
        let wasDeleted = selectedParamSet.delete(param);

        if (!wasDeleted) {
            selectedParamSet.add(param);
        }

        forceSelectedParamsUpdate();
    }

    $: isManualMode = selectedParamSet.size !== 0;

    $: isParamSelected = (param) => isManualMode && selectedParamSet.has(param);

    $: getBoxStyleMode = (param) => {
        if (!isManualMode) {
            return "default";
        }

        if (isParamSelected(param)) {
            return "active";
        }

        return "inactive"
    }
</script>

<div class="flex flex-wrap gap-2">

    {#each paramList as param (param)}

        <button
            class="rounded"
            on:click={() => toggleParam(param)}
        >

            <svelte:component
                this={paramBox}
                styleMode={getBoxStyleMode(param)}
                paramId={param}
                getLocaleFunc={getLocaleFunc}
            />

        </button>

    {/each}

</div>