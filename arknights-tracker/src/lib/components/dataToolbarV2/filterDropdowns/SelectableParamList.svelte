<script>
    export let paramList = [];
    export let maxSelectedParams = -1;

    export let getLocaleFunc;
    export let paramBox;

    // bindable
    export let selectedParamSet = new Set();

    $: if (!selectedParamSet) {
        selectedParamSet = new Set();
    }

    let currentSet;
    $: if (currentSet !== selectedParamSet) {
        currentSet = selectedParamSet;

        if (maxSelectedParams > 0) {
            syncQueue();
        }
    }

    let queue = [];
    $: if (maxSelectedParams > 0) {
        syncQueue();
    } else {
        queue = undefined;
    }

    function syncQueue() {
        queue = [];

        for (let param of selectedParamSet) {
            addParamToQueue(param);
        }
    }

    function deleteParamFromQueue(param) {
        if (!queue) return;

        queue.splice(queue.indexOf(param), 1);
    }

    function deleteFirstParamFromQueue() {
        if (!queue) return null;

        if (queue.length <= maxSelectedParams) return null;

        return queue.shift();
    }

    function addParamToQueue(param) {
        if (!queue) return null;

        queue.push(param);

        return deleteFirstParamFromQueue();
    }

    function forceSelectedParamsUpdate() {
        selectedParamSet = selectedParamSet;
    }

    function toggleParam(param) {
        let wasDeleted = selectedParamSet.delete(param);

        if (!wasDeleted) {
            selectedParamSet.add(param);

            let deletedParam = addParamToQueue(param);

            if (deletedParam) {
                selectedParamSet.delete(deletedParam);
            }
        } else {
            deleteParamFromQueue(param);
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