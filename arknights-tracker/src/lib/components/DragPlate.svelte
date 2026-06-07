<script>
    let scale = 1;
    let x = 0;
    let y = 0;
    let isDragging = false;
    let startX = 0;
    let startY = 0;

    const minScale = 0.5;
    const maxScale = 3;
    const step = 0.25;

    function zoomIn() {
        scale = Math.min(maxScale, scale + step);
    }

    function zoomOut() {
        scale = Math.max(minScale, scale - step);
    }

    function reset() {
        scale = 1;
        x = 0;
        y = 0;
    }

    function onMouseDown(e) {
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
        const delta = e.deltaY > 0 ? -step : step;
        scale = Math.min(maxScale, Math.max(minScale, scale + delta));
    }
</script>

<div class="relative h-full w-full bg-gray-300 dark:bg-[#252525] rounded-3xl border border-gray-200 dark:border-[#444] transition-colors overflow-hidden select-none">

    <div
        role="button"
        tabindex="0"
        class="w-full h-full cursor-grab overflow-hidden relative"
        class:active:cursor-grabbing={isDragging}
        onmousedown={onMouseDown}
        onmousemove={onMouseMove}
        onmouseup={onMouseUp}
        onmouseleave={onMouseUp}
        onwheel={onWheel}
    >

        <div
            class="absolute top-1/2 left-1/2 transition-transform duration-[10ms] min-h-full min-w-full flex items-center justify-center"
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
            class="flex w-8 h-8 items-center justify-center pb-1 bg-white dark:bg-[#383838] rounded-xl border border-gray-200 dark:border-[#444]"
            onclick={zoomOut}
        >
            <span class="font-sdk text-xl text-[#21272C] dark:text-[#FDFDFD]">
                -
            </span>
        </button>

        <button
            class="flex w-8 h-8 items-center justify-center pb-1 bg-white dark:bg-[#383838] rounded-xl border border-gray-200 dark:border-[#444]"
            onclick={reset}
        >
            <span class="font-sdk text-xl text-[#21272C] dark:text-[#FDFDFD]">
                ↺
            </span>
        </button>

    </div>

</div>