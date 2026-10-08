<script lang="ts" generics="T extends string | number">
    import type { IGroupedSelector } from "$lib/classes/selectors/IGroupedSelector";
    import type { ParamBoxStyle } from "$lib/components/dataToolbarV2/paramBoxes/ParamBoxStyle";
    import type { TextParamBoxProps } from "$lib/components/dataToolbarV2/paramBoxes/TextParamBoxProps";
    import type { Component } from "svelte";

    export let selector: IGroupedSelector<T>;
    export let getLocaleFn: ((param: T) => string) | undefined = undefined;
    export let paramBox: Component<TextParamBoxProps<T>>;

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

<div class="flex flex-col gap-2.5">

    {#each $selector.groups as group, index}

        <div class="flex flex-wrap gap-2 {
            index < $selector.groups.length - 1
                ? 'pb-2.5 border-b border-gray-200/60 dark:border-[#444]/50'
                : ''
        }">

            {#each group as param (param)}

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

    {/each}

</div>