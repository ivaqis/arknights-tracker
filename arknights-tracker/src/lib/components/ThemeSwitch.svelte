<script>
    import { isDarkMode } from "$lib/stores/theme";
    import { t } from "$lib/i18n";

    import Icon from "./Icons.svelte";

    function toggleTheme() {
        $isDarkMode = !$isDarkMode;
    }
</script>

<button 
    class="relative w-[161px] h-[44px] bg-[#303030] rounded-full p-1 cursor-pointer select-none group tap-highlight-transparent border border-gray-600  dark:border-[#444444] shadow-inner transition-colors"
    on:click={toggleTheme}
    aria-label="Change theme"
    type="button"
>
    <div class="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
        <div class="w-8 h-8 flex items-center justify-center text-white opacity-50">
            <Icon name="sun" class="w-5 h-5" />
        </div>

        <div class="w-8 h-8 flex items-center justify-center text-white opacity-50">
             <Icon name="moon" class="w-5 h-5" />
        </div>
    </div>

    <div 
        class="absolute top-1 bottom-1 w-[100px] bg-white rounded-full z-10 shadow-md flex items-center justify-center px-1 transition-transform duration-300 ease-in-out"
        style="transform: {$isDarkMode ? 'translateX(53px)' : 'translateX(0)'}"
    >
        <div class="flex items-center justify-between w-full h-full gap-0.7 {$isDarkMode ? 'flex-row-reverse' : 'flex-row'}">
            
            <div class="w-[30px] h-[30px] rounded-full bg-[#303030] flex items-center justify-center text-[#FDFD1F] flex-shrink-0 shadow-sm">
                {#if $isDarkMode}
                    <Icon name="moon" class="w-5 h-5" />
                {:else}
                    <Icon name="sun" class="w-5 h-5" />
                {/if}
            </div>
            <span class="text-[#303030] font-bold font-sans text-sm tracking-wide flex-grow text-center leading-none pb-[1px]">
                {$isDarkMode ? $t("sidebar.theme_dark") : $t("sidebar.theme_light")}
            </span>
        </div>
    </div>
</button>