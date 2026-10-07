<script lang="ts" generics="T extends string | number">
    import type { ISelector } from "$lib/classes/selectors/ISelector";
    import type { ParamBoxStyle } from "$lib/components/dataToolbarV2/paramBoxes/ParamBoxStyle";
    import type { TextParamBoxProps } from "$lib/components/dataToolbarV2/paramBoxes/TextParamBoxProps";
    import type { Component } from "svelte";

    export let selector: ISelector<T>;
    export let getLocaleFn: ((param: T) => string) | undefined = undefined;
    export let paramBox: Component<TextParamBoxProps<NoInfer<T>>>;

    let getBoxStyleMode: (param: T) => ParamBoxStyle;

    $: getBoxStyleMode = param => {
        if ($selector.isEmpty) {
            return "default";
        }

        if ($selector.isSelected(param)) {
            return "active";
        }

        return "inactive";
    };

</script>

<div class="flex flex-wrap gap-2">

    {#each $selector.paramList as param (param)}

        <button 
            class="rounded"
            on:click={() => selector.select(param)}
        >

            {#if getLocaleFn}
                <svelte:component
                    this={paramBox}
                    styleMode={getBoxStyleMode(param)}
                    paramId={param}
                    getLocaleFunc={getLocaleFn}
                />
            {:else}
                <svelte:component
                    this={paramBox}
                    styleMode={getBoxStyleMode(param)}
                    paramId={param}
                />
            {/if}
            
        </button>
        
    {/each}

</div>