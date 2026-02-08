<!-- src/routes/events/+page.svelte -->
<script lang="ts">
    import { t } from "$lib/i18n";
    import Timeline from "$lib/components/Timeline.svelte";
</script>

<div class="max-w-[100%] max-h-[100%] justify-start min-h-screen">
    <div class="flex items-center gap-4 mb-8">
        <h2
            class="font-sdk dark:text-[#FDFDFD] text-5xl tracking-wide text-[#21272C] flex items-center gap-3"
        >
            {$t("pages.events")}
        </h2>
    </div>

    <div class="w-full mb-8">
        <Timeline />
    </div>
</div>
