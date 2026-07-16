<script>
    import DragPlateSettingsModal from "$lib/components/dragPlate/DragPlateSettingsModal.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import { ctrlForZoom } from "$lib/stores/dragPlateSettings.js";

    let isSettingsOpen = false;

    function openSettings() {
        isSettingsOpen = true;
        console.log("Settings open");
    }

    let scale = 1;
    let x = 0;
    let y = 0;
    let isDragging = false;
    let startX = 0;
    let startY = 0;

    let initialDistance = 0;
    let initialScale = 1;
    let initialX = 0;
    let initialY = 0;
    let pinchCenterX = 0;
    let pinchCenterY = 0;

    const minScale = 0.25;
    const maxScale = 3;
    const step = 0.25;

    function zoomIn() {
        const oldScale = scale;
        scale = Math.min(maxScale, scale + step);
        const scaleChange = scale / oldScale;
        x = x * scaleChange;
        y = y * scaleChange;
    }

    function zoomOut() {
        const oldScale = scale;
        scale = Math.max(minScale, scale - step);
        const scaleChange = scale / oldScale;
        x = x * scaleChange;
        y = y * scaleChange;
    }

    function reset() {
        scale = 1;
        x = 0;
        y = 0;
    }

    function resetScale() {
        const oldScale = scale;
        scale = 1;
        const scaleChange = scale / oldScale;
        x = x * scaleChange;
        y = y * scaleChange;
    }

    function onMouseDown(e) {
        if (e.button === 1) {
            e.preventDefault();
        }
        isDragging = true;
        startX = e.clientX - x;
        startY = e.clientY - y;
    }

    function onMouseMove(e) {
        if (!isDragging) return;
        x = e.clientX - startX;
        y = e.clientY - startY;
    }

    function onMouseUp() {
        isDragging = false;
    }

    function onWheel(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        if ($ctrlForZoom) {
            if (e.ctrlKey || e.metaKey) {
                const rect = e.currentTarget.getBoundingClientRect();

                const mouseX = e.clientX - rect.left - rect.width / 2;
                const mouseY = e.clientY - rect.top - rect.height / 2;

                const oldScale = scale;

                const delta = -e.deltaY * 0.001;
                const newScale = Math.min(maxScale, Math.max(minScale, oldScale * Math.exp(delta)));

                if (Math.abs(newScale - oldScale) < 0.001) return;

                scale = newScale;
                const scaleChange = scale / oldScale;
                x = mouseX - scaleChange * (mouseX - x);
                y = mouseY - scaleChange * (mouseY - y);
                return;
            }

            if (e.shiftKey) {
                x -= e.deltaY || e.deltaX;
                return;
            }

            x -= e.deltaX;
            y -= e.deltaY;
            return;
        }

        const rect = e.currentTarget.getBoundingClientRect();

        const mouseX = e.clientX - rect.left - rect.width / 2;
        const mouseY = e.clientY - rect.top - rect.height / 2;

        const oldScale = scale;

        const delta = -e.deltaY * 0.001;
        const newScale = Math.min(maxScale, Math.max(minScale, oldScale * Math.exp(delta)));

        if (Math.abs(newScale - oldScale) < 0.001) return;

        scale = newScale;
        const scaleChange = scale / oldScale;
        x = mouseX - scaleChange * (mouseX - x);
        y = mouseY - scaleChange * (mouseY - y);
    }

    function getTouchDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function getTouchCenter(touches) {
        return {
            x: (touches[0].clientX + touches[1].clientX) / 2,
            y: (touches[0].clientY + touches[1].clientY) / 2
        };
    }

    function onTouchStart(e) {
        if (e.touches.length === 1) {
            isDragging = true;
            startX = e.touches[0].clientX - x;
            startY = e.touches[0].clientY - y;
        } else if (e.touches.length === 2) {
            isDragging = false;
            initialDistance = getTouchDistance(e.touches);
            initialScale = scale;
            initialX = x;
            initialY = y;
            const center = getTouchCenter(e.touches);
            pinchCenterX = center.x;
            pinchCenterY = center.y;
        }
    }

    function onTouchMove(e) {
        e.preventDefault();

        if (e.touches.length === 1 && isDragging) {
            x = e.touches[0].clientX - startX;
            y = e.touches[0].clientY - startY;
        } else if (e.touches.length === 2) {
            const currentDistance = getTouchDistance(e.touches);
            const center = getTouchCenter(e.touches);

            if (initialDistance > 0) {
                const newScale = Math.min(maxScale, Math.max(minScale, initialScale * (currentDistance / initialDistance)));

                const rect = e.currentTarget.getBoundingClientRect();
                const containerCenterX = rect.left + rect.width / 2;
                const containerCenterY = rect.top + rect.height / 2;

                const scaleChange = newScale / initialScale;

                const touchCenterRelativeX = pinchCenterX - containerCenterX;
                const touchCenterRelativeY = pinchCenterY - containerCenterY;

                x = touchCenterRelativeX - scaleChange * (touchCenterRelativeX - initialX);
                y = touchCenterRelativeY - scaleChange * (touchCenterRelativeY - initialY);

                scale = newScale;
            }
        }
    }

    function onTouchEnd(e) {
        if (e.touches.length === 0) {
            isDragging = false;
            initialDistance = 0;
        } else if (e.touches.length === 1) {
            isDragging = true;
            startX = e.touches[0].clientX - x;
            startY = e.touches[0].clientY - y;
            initialDistance = 0;
        }
    }

    function preventWheel(node) {
        function handleWheel(e) {
            e.preventDefault();
        }

        node.addEventListener('wheel', handleWheel, { passive: false });

        return {
            destroy() {
                node.removeEventListener('wheel', handleWheel);
            }
        };
    }

    $: if ($ctrlForZoom !== undefined) {
        isDragging = false;
    }
</script>

<DragPlateSettingsModal
    bind:isOpen={isSettingsOpen}
/>

<div
    class="relative h-full w-full bg-gray-300 dark:bg-[#252525] rounded-3xl border border-gray-200 dark:border-[#444] transition-colors overflow-hidden select-none touch-none"
    use:preventWheel
    onwheel={onWheel}
>

    <div
        role="button"
        tabindex="0"
        class="w-full h-full overflow-hidden relative"
        class:cursor-grab={!isDragging}
        class:cursor-grabbing={isDragging}
        onmousedown={onMouseDown}
        onmousemove={onMouseMove}
        onmouseup={onMouseUp}
        onmouseleave={onMouseUp}
        ontouchstart={onTouchStart}
        ontouchmove={onTouchMove}
        ontouchend={onTouchEnd}
    >

        <div
            class="absolute top-1/2 left-1/2 min-h-full min-w-full flex items-center justify-center"
            style="transform: translate(calc(-50% + {x}px), calc(-50% + {y}px)) scale({scale});"
        >

            <slot />

        </div>

    </div>

    <div class="absolute top-1/2 right-3 -translate-y-1/2 flex flex-col gap-2">

        <button
            class="flex w-8 h-8 items-center justify-center bg-white dark:bg-[#383838] rounded-xl border border-gray-200 dark:border-[#444]"
            onclick={zoomIn}
        >
            <span class="font-sdk text-xl text-[#21272C] dark:text-[#FDFDFD]">
                +
            </span>
        </button>

        <button
            class="flex w-8 h-8 items-center justify-center bg-white dark:bg-[#383838] rounded-xl border border-gray-200 dark:border-[#444]"
            onclick={zoomOut}
        >
            <span class="font-sdk text-lg text-[#21272C] dark:text-[#FDFDFD]">
                −
            </span>
        </button>

        <button
            class="flex w-8 h-8 items-center justify-center bg-white dark:bg-[#383838] rounded-xl border border-gray-200 dark:border-[#444]"
            onclick={reset}
        >
            <span class="font-sdk text-xl text-[#21272C] dark:text-[#FDFDFD]">
                <Icon
                    name="refresh"
                    class="h-5 w-5 text-[#21272C] dark:text-[#FDFDFD]"
                />
            </span>
        </button>

    </div>

    <div class="absolute bottom-3 left-3 flex flex-row gap-2 ">

        <button
            class="flex h-8 w-8 items-center justify-center bg-white dark:bg-[#383838] rounded-xl border border-gray-200 dark:border-[#444]"
            onclick={openSettings}
        >
            <Icon
                name="settings"
                class="h-5 w-5 text-[#21272C] dark:text-[#FDFDFD]"
            />
        </button>

        <button
            class="flex h-8 w-16 items-center justify-center bg-white dark:bg-[#383838] rounded-xl border border-gray-200 dark:border-[#444]"
            onclick={resetScale}
        >
            <span class="font-mono text-xl text-[#21272C] dark:text-[#FDFDFD]">
                {(scale * 100).toFixed(0)}%
            </span>
        </button>

    </div>

</div>