<script>
    import { DraggableList } from "$lib/classes/dragndrop/DraggableList.js";
    import { flip } from "svelte/animate";

    export let paramBox;

    export let getLocaleFunc = (param) => param?.toString() ?? "null";

    // bindable
    export let paramList = []; // if binded, it will be updated on change order of elements
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
        console.log(`start ${param}`);

        currentCursorPosX = event.clientX;
        currentCursorPosY = event.clientY;

        dragList.startDrag(param);
        forceDragListUpdate();

        document.body.classList.add("cursor-grabbing");
    }

    function endDrag() {
        console.log("end");

        dragList.endDrag();
        forceDragListUpdate();
    }

    function onParamEnter(param) {
        if (!dragList.draggedItemId) return;

        console.log(`enter ${param}`);

        let wasModified = dragList.onEnter(param);

        forceDragListUpdate();

        if (wasModified) {
            forceParamListUpdate();
        }
    }

    function onParamLeave(param) {
        if (!dragList.draggedItemId) return;

        console.log(`leave ${param}`);

        dragList.onLeave(param);

        forceDragListUpdate();
    }


    function handleWindowPointerUp() {
        if (!dragList.draggedItemId) return;

        endDrag();

        document.body.classList.remove("cursor-grabbing");
    }

    function handleWindowPointerMove(event) {
        if (!dragList.draggedItemId) return;

        currentCursorPosX = event.clientX;
        currentCursorPosY = event.clientY;
    }


    let paramTouchHovered = null;

    function handleWindowTouchMove(event) {
        if (!dragList.draggedItemId) return;


        const touch = event.touches[0];
        if (!touch) return;

        const elementUnderPointer = document.elementFromPoint(touch.clientX, touch.clientY);
        const paramItem = elementUnderPointer.closest("[data-param-id]");
        const newParam = paramItem?.dataset.paramId ?? null;

        if (newParam === paramTouchHovered) return;

        if (paramTouchHovered) {
            onParamLeave(paramTouchHovered);
        }

        if (newParam) {
            onParamEnter(newParam);
        }

        paramTouchHovered = newParam;
    }

    function handleWindowTouchEnd() {
        if (!dragList.draggedItemId) return;

        if (paramTouchHovered) {
            onParamLeave(paramTouchHovered);
            paramTouchHovered = null;
        }
    }

</script>

<svelte:window
    on:touchmove={handleWindowTouchMove}
    on:touchend={handleWindowTouchEnd}
    on:pointermove={handleWindowPointerMove}
    on:pointerup={handleWindowPointerUp}
/>

<div class="flex flex-wrap gap-2">

    {#each paramList as param (param)}

        <div
            animate:flip={{ duration: 100 }}
            class="cursor-grab touch-none"
            role="listitem"
            data-param-id={param}
            on:pointerenter={() => onParamEnter(param)}
            on:pointerleave={() => onParamLeave(param)}
            on:pointerdown|preventDefault={(e) => startDrag(e, param)}
        >

            <svelte:component
                this={paramBox}
                styleMode={isParamDragged(param) ? "dragged" : "default"}
                paramId={param}
            >

                {getLocaleFunc(param)}

            </svelte:component>

        </div>

    {/each}

</div>