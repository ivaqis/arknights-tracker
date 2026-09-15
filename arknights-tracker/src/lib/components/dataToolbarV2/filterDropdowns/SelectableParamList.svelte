<script lang="ts" generics="TParam extends ParamId">
    import type { ParamBoxStyle } from "$lib/components/dataToolbarV2/paramBoxes/ParamBoxStyle";
    import type { ParamId } from "$lib/components/dataToolbarV2/paramBoxes/ParamId";
    import type { TextParamBoxProps } from "$lib/components/dataToolbarV2/paramBoxes/TextParamBoxProps";
    import type { Component } from "svelte";

    export let paramList: TParam[] = [];
    export let maxSelectedParams: number = -1;

    export let getLocaleFunc: ((param: TParam) => string) = (param) => String(param);
    export let paramBox: Component<TextParamBoxProps<TParam>>;

    // bindable
    export let selectedParamSet: Set<TParam> = new Set();

    $: if (!selectedParamSet) {
        selectedParamSet = new Set();
    }

    let currentSet: Set<TParam>;

    $: if (currentSet !== selectedParamSet) {
        currentSet = selectedParamSet;

        if (maxSelectedParams > 0) {
            syncQueue();
        }
    }

    let queue: TParam[] | undefined = [];
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

    function deleteParamFromQueue(param: TParam) {
        if (!queue)
            return;

        queue.splice(queue.indexOf(param), 1);
    }

    function deleteFirstParamFromQueue(): TParam | null {
        if (!queue)
            return null;

        if (queue.length <= maxSelectedParams)
            return null;

        return queue.shift() ?? null;
    }

    function addParamToQueue(param: TParam): TParam | null {
        if (!queue)
            return null;

        queue.push(param);

        return deleteFirstParamFromQueue();
    }

    function forceSelectedParamsUpdate() {
        selectedParamSet = selectedParamSet;
    }

    function toggleParam(param: TParam) {
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

    let isParamSelected: (param: TParam) => boolean;
    let getBoxStyleMode: (param: TParam) => ParamBoxStyle;

    $: isParamSelected = (param: TParam) => isManualMode && selectedParamSet.has(param);

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