<script>
    import { afterNavigate, goto } from "$app/navigation";
    import { browser } from "$app/environment";
    import { t } from "$lib/i18n";
    import Icon from "$lib/components/Icon.svelte";

    let hasHistory = false;

    afterNavigate(({ from }) => {
        if (from) {
            hasHistory = true;
        }
    });

    function goBack() {
        if (browser) {
            if (hasHistory) {
                window.history.back();
            } else {
                goto("/");
            }
        }
    }
</script>

<div class="flex flex-col items-center justify-center min-h-[75vh] py-12 px-4 text-center animate-fadeIn">
    <div class="flex flex-col sm:flex-row items-center gap-6 md:gap-10 mb-8">
        <img 
            src="/images/empty.png" 
            alt="Not Found" 
            class="w-36 md:w-44 h-auto object-contain select-none pointer-events-none drop-shadow-lg" 
        />
        
        <div class="hidden sm:block w-[1px] h-20 bg-gray-600/50"></div>

        <div class="flex flex-col items-center sm:items-start text-center sm:text-left">
            <h1 class="text-6xl md:text-7xl font-black text-[#FACC15] leading-none tracking-tight drop-shadow">
                404
            </h1>
            <div class="w-full h-[1px] bg-gray-500/30 my-2.5 sm:hidden"></div>
            <p class="text-xl md:text-2xl font-bold text-gray-600 dark:text-gray-300 leading-normal tracking-wide mt-1">
                Not Found
            </p>
        </div>
    </div>

    <div class="flex flex-col sm:flex-row items-center gap-4 justify-center w-full max-w-md px-4">

        <a
            href="/"
            class="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm bg-[#FFC107] hover:bg-[#F9B90C] text-black transition-all shadow-md hover:shadow-lg no-underline cursor-pointer"
        >
            <span>{$t("home.go_back") || "Back"}</span>
        </a>
    </div>
</div>

