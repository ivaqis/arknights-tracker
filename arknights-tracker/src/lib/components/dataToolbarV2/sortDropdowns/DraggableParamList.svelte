<script>
    import { DraggableList } from "$lib/classes/dragndrop/DraggableList.js";
    import { flip } from "svelte/animate";

    export let paramBox;

    export let getLocaleFunc = (param) => param?.toString() ?? "null";

    // bindable
    export let paramList = []; // if bound, it will be updated on change order of elements
    export let draggedParam = null;


    let dragList = new DraggableList(paramList);

    $: draggedParam = dragList.draggedItemId;

    $: if (paramList) {
        updateItemList(paramList);
    }

    function updateItemList(itemList) {
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

    $: isParamDragged = (param) => param === dragList.draggedItemId;

    function startDrag(event, param) {
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

    function onParamEnter(param) {
        if (!dragList.draggedItemId) return;

        let wasModified = dragList.onEnter(param);

        forceDragListUpdate();

        if (wasModified) {
            forceParamListUpdate();
        }
    }

    function onParamLeave(param) {
        if (!dragList.draggedItemId) return;

        dragList.onLeave(param);

        forceDragListUpdate();
    }


    let paramHovered = null;

    function handleWindowPointerUp() {
        if (!dragList.draggedItemId) return;

        if (paramHovered) {
            onParamLeave(paramHovered);
            paramHovered = null;
        }

        endDrag();

        document.body.classList.remove("cursor-grabbing");
    }

    function handleWindowPointerMove(event) {
        if (!dragList.draggedItemId) return;

        currentCursorPosX = event.clientX;
        currentCursorPosY = event.clientY;

        const elementUnderPointer = document.elementFromPoint(event.clientX, event.clientY);
        const paramItem = elementUnderPointer.closest("[data-param-id]");
        const newParam = paramItem?.dataset.paramId ?? null;

        if (newParam === paramHovered) return;

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