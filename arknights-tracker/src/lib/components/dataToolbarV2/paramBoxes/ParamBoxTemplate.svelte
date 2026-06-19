<script>
    export let styleMode = "default"; // "default" | "active" | "inactive" | "dragged"

    function getClasses(styleMode) {
        switch (styleMode) {
            case "active":
                return "bg-[#F9B90C]/20 border-[#F9B90C] text-gray-900 dark:text-[#E0E0E0] dark:bg-[#FFB200]/50 dark:border-[#FFB200]";
            case "inactive":
                return "bg-white dark:bg-[#383838] border-gray-200 text-gray-400 opacity-60 dark:border-[#444444] dark:text-[#787878] hover:opacity-100 hover:bg-gray-50 hover:dark:bg-[#424242]";
            case "dragged":
                return "bg-gray-300 border-[#f9b90c] text-black dark:text-[#E0E0E0] dark:bg-[#424242] opacity-50";
            case "default":
            default:
                return "bg-gray-300 border-gray-400 text-black dark:text-[#E0E0E0] dark:bg-[#424242] dark:border-[#444444] hover:bg-gray-200 hover:dark:bg-[#4a4a4a]";
        }
    }
</script>

<div class="h-[32px] px-2 rounded flex items-center gap-1 border transition-all {getClasses(styleMode)}">

    <slot/>

</div>