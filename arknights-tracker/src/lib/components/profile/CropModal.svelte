<script>
    import { createEventDispatcher } from "svelte";
    import { t } from "$lib/i18n.js";
    import Icon from "$lib/components/Icon.svelte";
    import Modal from "$lib/components/modals/Modal.svelte";

    export let isOpen = false;
    export let imageSrc = "";
    export let loadedImg = null;

    const dispatch = createEventDispatcher();

    let zoom = 1;
    let offsetX = 0;
    let offsetY = 0;
    let dispWidth = 300;
    let dispHeight = 300;

    $: imageStyle = `width: ${dispWidth}px; height: ${dispHeight}px; left: 50%; top: 50%; transform: translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px)) scale(${zoom});`;
    $: {
        const w_c = dispWidth * zoom;
        const h_c = dispHeight * zoom;
        const maxOffsetX = Math.max(0, w_c / 2 - 75);
        const maxOffsetY = Math.max(0, h_c / 2 - 75);
        if (offsetX < -maxOffsetX) offsetX = -maxOffsetX;
        if (offsetX > maxOffsetX) offsetX = maxOffsetX;
        if (offsetY < -maxOffsetY) offsetY = -maxOffsetY;
        if (offsetY > maxOffsetY) offsetY = maxOffsetY;
    }

    export function reset(img) {
        loadedImg = img;
        zoom = 150 / 280;
        offsetX = 0;
        offsetY = 0;
        const ratio = img.width / img.height;
        if (ratio > 1) {
            dispHeight = 280;
            dispWidth = 280 * ratio;
        } else {
            dispWidth = 280;
            dispHeight = 280 / ratio;
        }
    }

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialOffsetX = 0;
    let initialOffsetY = 0;

    function handleMouseDown(e) {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        initialOffsetX = offsetX;
        initialOffsetY = offsetY;
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
    }
    function handleMouseMove(e) {
        if (!isDragging) return;
        offsetX = initialOffsetX + (e.clientX - startX);
        offsetY = initialOffsetY + (e.clientY - startY);
    }
    function handleMouseUp() {
        isDragging = false;
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
    }

    function handleTouchStart(e) {
        if (e.touches.length !== 1) return;
        isDragging = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        initialOffsetX = offsetX;
        initialOffsetY = offsetY;
        window.addEventListener("touchmove", handleTouchMove, { passive: false });
        window.addEventListener("touchend", handleTouchEnd);
    }
    function handleTouchMove(e) {
        if (!isDragging) return;
        e.preventDefault();
        offsetX = initialOffsetX + (e.touches[0].clientX - startX);
        offsetY = initialOffsetY + (e.touches[0].clientY - startY);
    }
    function handleTouchEnd() {
        isDragging = false;
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("touchend", handleTouchEnd);
    }

    function handleWheel(e) {
        e.preventDefault();
        const zoomStep = 0.05;
        let nextZoom = zoom - Math.sign(e.deltaY) * zoomStep;
        const minZoom = 150 / 280;
        const maxZoom = 4;
        if (nextZoom < minZoom) nextZoom = minZoom;
        if (nextZoom > maxZoom) nextZoom = maxZoom;
        zoom = nextZoom;
    }

    function handleSave() {
        if (!loadedImg) return;

        const canvas = document.createElement("canvas");
        canvas.width = 150;
        canvas.height = 150;
        const ctx = canvas.getContext("2d");

        const w_c = dispWidth * zoom;
        const h_c = dispHeight * zoom;

        const x_rel_box = w_c / 2 - 75 - offsetX;
        const y_rel_box = h_c / 2 - 75 - offsetY;

        const x_orig = x_rel_box * (loadedImg.width / w_c);
        const y_orig = y_rel_box * (loadedImg.height / h_c);
        const w_orig = 150 * (loadedImg.width / w_c);
        const h_orig = 150 * (loadedImg.height / h_c);

        ctx.drawImage(loadedImg, x_orig, y_orig, w_orig, h_orig, 0, 0, 150, 150);

        const webpBase64 = canvas.toDataURL("image/webp", 0.85);

        const sizeInBytes = Math.round((webpBase64.length * 3) / 4);
        if (sizeInBytes > 1024 * 1024) {
            dispatch("error", "Converted WebP exceeds 1MB limit."); // Добавить перевод
            return;
        }

        dispatch("save", webpBase64);
    }

    function close() {
        dispatch("close");
    }
</script>

<Modal {isOpen} on:close={close}>
    <div class="bg-white dark:bg-[#383838] border border-gray-200 dark:border-[#444444] rounded-2xl p-6 md:p-8 w-full max-w-sm shadow-2xl flex flex-col items-center relative">
        <button
            on:click={close}
            class="absolute top-4 right-4 text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
        >
            <Icon name="close" class="w-6 h-6" />
        </button>

        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6 font-sdk text-center w-full">
            {$t("profile.crop_avatar_title") || "Crop Avatar"}
        </h3>

        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div 
            class="relative w-[280px] h-[280px] overflow-hidden rounded-xl border border-gray-200 dark:border-white/10 bg-black cursor-move select-none"
            on:mousedown={handleMouseDown}
            on:touchstart={handleTouchStart}
            on:wheel|preventDefault={handleWheel}
        >
            <img 
                src={imageSrc} 
                alt="Crop preview" 
                class="absolute pointer-events-none origin-center max-w-none"
                style={imageStyle}
            />
            
            <div class="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div class="w-[150px] h-[150px] border border-[#FFE145]/70 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]"></div>
            </div>
        </div>
        
        <div class="w-full flex items-center gap-3 mt-4 px-2">
            <span class="text-xs text-gray-500 dark:text-gray-400 select-none">−</span>
            <input 
                type="range" 
                min={150 / 280} 
                max="4" 
                step="0.01" 
                bind:value={zoom}
                class="flex-1 accent-[#FFE145] h-1 bg-gray-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
            <span class="text-xs text-gray-500 dark:text-gray-400 select-none">+</span>
        </div>
        
        <div class="flex items-center gap-3 w-full mt-6">
            <button 
                on:click={close} 
                class="flex-1 justify-center py-2 px-6 rounded-full border-2 border-gray-300 dark:border-[#444444] text-gray-700 dark:text-[#E0E0E0] hover:border-gray-500/70 dark:hover:border-[#404040] hover:text-black dark:hover:text-white bg-white dark:bg-[#383838] transition-all duration-200 active:scale-95 text-center font-medium font-sdk text-sm"
            >
                {$t("settings.account.cancel") || "Cancel"}
            </button>
            <button 
                on:click={handleSave} 
                class="flex-1 justify-center py-2 px-6 rounded-full border-2 border-[#FFE145] bg-[#FFE145] hover:bg-[#ebd03e] hover:border-[#ebd03e] text-gray-900 transition-all duration-200 active:scale-95 text-center font-bold font-sdk text-sm"
            >
                {$t("settings.account.save") || "Save"}
            </button>
        </div>
    </div>
</Modal>
