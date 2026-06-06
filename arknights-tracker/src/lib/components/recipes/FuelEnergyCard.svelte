<script>
    import { t } from "$lib/i18n";

    export let powerProvide = 0;
</script>

<div class="flex flex-col justify-start items-center pt-1">
    <div class="pl-3 pr-3 bg-[#1f1f1f] dark:bg-[#1f1f1f] rounded-[3px]">
        <span class="font-sdk text-sm text-[#FDFDFD] dark:text-[#FDFDFD]">
            {$t("formulaSidebar.items.power")}
        </span>
    </div>

    <div>
        <span class="font-sdk text-2xl text-[#21272C] dark:text-[#FDFDFD] tracking-wider">
            {powerProvide}
        </span>
    </div>
</div>