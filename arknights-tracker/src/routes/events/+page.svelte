<script lang="ts">
    import { t } from "$lib/i18n";
    import Timeline from "$lib/components/Timeline.svelte";
</script>

<div class="fixed inset-0 w-full h-full flex flex-col overflow-hidden bg-[#F9F9F9] dark:bg-[#2C2C2C] md:p-8 p-4 md:ml-64">
    
    <div class="flex items-center gap-4 mb-3 shrink-0">
        <h2
            class="font-sdk dark:text-[#FDFDFD] text-5xl tracking-wide text-[#21272C] flex items-center gap-3"
        >
            {$t("pages.events")}
        </h2>
    </div>

    <div class="relative flex-1 min-h-0 w-full rounded-2xl overflow-hidden">
        <Timeline />
    </div>
</div>