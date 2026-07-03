<script>
    import { t } from "$lib/i18n.js";

    export let stats = {};
    export let totalCharsCount = 0;

    $: summaryRows = [
        { 
            label: $t("profile.operators_count"), 
            value: `${stats.charCount || 0} / ${totalCharsCount}` 
        },
        { 
            label: $t("profile.exploration_level"), 
            value: stats.explorationLevel || 0 
        },
        { 
            label: $t("profile.weapons"), 
            value: stats.weaponCount || 0 
        },
        { 
            label: $t("profile.files"), 
            value: stats.fileCount || 0 
        },
        { 
            label: $t("profile.awake_day"), 
            value: stats.awakeDay || "-" 
        },
        { 
            label: $t("profile.sanity"), 
            value: `${stats.sanity || 0} / ${stats.maxSanity || 358}` 
        },
        { 
            label: $t("profile.protopass"), 
            value: `${stats.protoPass || 0} / ${stats.protoPassMax || 60}` 
        },
        { 
            label: $t("profile.weekly_routine"), 
            value: `${stats.weeklyRoutine || 0} / ${stats.weeklyRoutineMax || 10}` 
        },
        { 
            label: $t("profile.activity_points"), 
            value: `${stats.activityPoints || 0} / ${stats.activityPointsMax || 100}` 
        }
    ];
</script>

<div class="bg-white/5 dark:bg-[#383838]/5 dark:border-[#444444] rounded-xl p-5 shadow-xl border border-gray-100/50 min-w-0 flex flex-col backdrop-blur-sm">
    <h2 class="text-xl font-bold text-[#21272C] dark:text-[#FDFDFD] mb-2 font-sdk border-b border-gray-100 dark:border-[#444444] pb-3">
        {$t("profile.overview")}
    </h2>
    <div class="space-y-1 px-1">
        {#each summaryRows as row}
            <div class="flex justify-between items-center py-1.5 dark:border-[#444444]">
                <span class="text-gray-700 dark:text-[#E4E4E4] font-medium">{row.label}</span>
                <span class="font-bold text-[#21272C] dark:text-[#FDFDFD] font-nums">{row.value}</span>
            </div>
        {/each}
    </div>
</div>