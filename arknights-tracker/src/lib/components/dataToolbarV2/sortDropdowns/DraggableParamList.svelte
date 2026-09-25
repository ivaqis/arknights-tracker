<script lang="ts" generics="TParam extends DraggableItem">
    import type { DraggableItem } from "$lib/classes/dragndrop/DraggableItem";
    import { DraggableList } from "$lib/classes/dragndrop/DraggableList";
    import type { IDraggableList } from "$lib/classes/dragndrop/IDraggableList";
    import type { TextParamBoxProps } from "$lib/components/dataToolbarV2/paramBoxes/TextParamBoxProps";
    import type { Component } from "svelte";
    import { flip } from "svelte/animate";

    export let paramBox: Component<TextParamBoxProps<TParam>>;

    export let getLocaleFunc: (param: TParam) => string;

    // bindable
    export let paramList: TParam[] = []; // if bound, it will be updated on change order of elements
    export let draggedParam: TParam | null = null;


    let dragList: IDraggableList<TParam> = new DraggableList(paramList);

    $: draggedParam = dragList.draggedItemId;

    $: if (paramList) {
        updateItemList(paramList);
    }

    function updateItemList(itemList: TParam[]) {
        dragList.itemList = itemList;
    }

    function forceDragListUpdate() {
        dragList = dragList;
    }

    function forceParamListUpdate() {
        paramList = dragList.itemList;
    }

    let currentCursorPosX = 0;
    let currentCursorPosY = 0;

    $: isParamDragged = (param: TParam) => param === dragList.draggedItemId;

    function startDrag(event: PointerEvent & { currentTarget: EventTarget & HTMLDivElement }, param: TParam) {
        currentCursorPosX = event.clientX;
        currentCursorPosY = event.clientY;

        dragList.startDrag(param);
        forceDragListUpdate();

        document.body.classList.add("cursor-grabbing");
    }

    function endDrag() {
        dragList.endDrag();
        forceDragListUpdate();
    }

    function onParamEnter(param: TParam) {
        if (!dragList.draggedItemId) return;

        let wasModified = dragList.onEnter(param);

        forceDragListUpdate();

        if (wasModified) {
            forceParamListUpdate();
        }
    }

    function onParamLeave(param: TParam) {
        if (!dragList.draggedItemId) return;

        dragList.onLeave(param);

        forceDragListUpdate();
    }


    let paramHovered: TParam | null = null;

    function handleWindowPointerUp() {
        if (!dragList.draggedItemId) return;

        if (paramHovered) {
            onParamLeave(paramHovered);
            paramHovered = null;
        }

        endDrag();

        document.body.classList.remove("cursor-grabbing");
    }

    function handleWindowPointerMove(event: PointerEvent & { currentTarget: EventTarget & Window }) {
        if (!dragList.draggedItemId)
            return;

        currentCursorPosX = event.clientX;
        currentCursorPosY = event.clientY;

        const elementUnderPointer = document.elementFromPoint(event.clientX, event.clientY);

        if (!elementUnderPointer)
            return;

        const paramItem = elementUnderPointer.closest<HTMLElement>("[data-param-id]");
        const newParam = (paramItem?.dataset.paramId ?? null) as TParam | null;

        if (newParam === paramHovered)
            return;

        if (paramHovered) {
            onParamLeave(paramHovered);
        }

        if (newParam) {
            onParamEnter(newParam);
        }

        paramHovered = newParam;
    }

</script>

<svelte:window
    on:pointermove={handleWindowPointerMove}
    on:pointerup={handleWindowPointerUp}
/>

<div class="flex flex-wrap gap-2">

    {#each paramList as param (param)}

        <div
            animate:flip={{ duration: 100 }}
            class="cursor-grab touch-none"
            class:cursor-grabbing={draggedParam}
            role="listitem"
            data-param-id={param}
            on:pointerdown|preventDefault={(e) => startDrag(e, param)}
        >

            <svelte:component
                this={paramBox}
                styleMode={isParamDragged(param) ? "dragged" : "default"}
                paramId={param}
                getLocaleFunc={getLocaleFunc}
            />

        </div>

    {/each}

</div>