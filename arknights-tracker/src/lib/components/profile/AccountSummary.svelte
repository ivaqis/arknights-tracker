<script>
    import { t } from "$lib/i18n.js";

    export let stats = {};
    export let totalCharsCount = 0;
    export let profileBackground = false;

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

<div class="{profileBackground ? 'bg-white dark:bg-[#383838] border border-white/10' : 'bg-white/5 border dark:bg-[#383838]/5 dark:border-[#444444]/20 border-white/20'} rounded-xl p-5 shadow-sm min-w-0 flex flex-col backdrop-blur-sm">
    <h2 class="text-xl font-bold text-[#21272C] dark:text-[#FDFDFD] mb-2 font-sdk border-b {profileBackground ? 'border-gray-100 dark:border-[#444444]' : 'border-gray-100/30 dark:border-[#444444]/30'} pb-3">
        {$t("profile.overview")}
    </h2>
    <div class="space-y-1 px-1">
        {#each summaryRows as row}
            <div class="flex justify-between items-center py-1.5 dark:border-[#444444]">
                <span class="text-gray-800 dark:text-[#E4E4E4] font-medium">{row.label}</span>
                <span class="font-bold text-[#21272C] dark:text-[#FDFDFD] font-nums">{row.value}</span>
            </div>
        {/each}
    </div>
</div>