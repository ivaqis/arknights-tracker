<script>
    import { isDarkMode } from "$lib/stores/theme";
    import { t } from "$lib/i18n"; // Импорт локализации

    function toggleTheme() {
        $isDarkMode = !$isDarkMode;
    }
</script>

<button 
    class="relative w-[161px] h-[44px] bg-[#303030] rounded-full p-1 cursor-pointer select-none group tap-highlight-transparent border border-gray-600  dark:border-[#444444] shadow-inner transition-colors"
    on:click={toggleTheme}
    aria-label="Переключить тему"
    type="button"
>
    <div class="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
        <div class="w-8 h-8 flex items-center justify-center text-white opacity-50">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
        </div>

        <div class="w-8 h-8 flex items-center justify-center text-white opacity-50">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
        </div>
    </div>

    <div 
        class="absolute top-1 bottom-1 w-[100px] bg-white rounded-full z-10 shadow-md flex items-center justify-center px-1 transition-transform duration-300 ease-in-out"
        style="transform: {$isDarkMode ? 'translateX(53px)' : 'translateX(0)'}"
    >
        <div class="flex items-center justify-between w-full h-full gap-0.7 {$isDarkMode ? 'flex-row-reverse' : 'flex-row'}">
            
            <div class="w-[30px] h-[30px] rounded-full bg-[#303030] flex items-center justify-center text-[#FDFD1F] flex-shrink-0 shadow-sm">
                {#if $isDarkMode}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                    </svg>
                {:else}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="5" />
                        <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                    </svg>
                {/if}
            </div>

            <span class="text-[#303030] font-bold font-sans text-sm tracking-wide flex-grow text-center leading-none pb-[1px]">
                {$isDarkMode ? $t("sidebar.theme_dark") : $t("sidebar.theme_light")}
            </span>

        </div>
    </div>
</button>