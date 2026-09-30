<script lang="ts">
    import { t } from '$lib/i18n';
    import type { AchievementData } from '$lib/data/achievements';
    import {
        achievementStore,
        toggleAchievementLevel,
        toggleAchievementPlate,
        isAchievementFullyCompleted
    } from '$lib/stores/achievementStore';
    import Icon from '$lib/components/Icon.svelte';
    import Image from '$lib/components/Image.svelte';
    import Checkbox from '$lib/components/Checkbox.svelte';

    export let achievement: AchievementData;
    export let localeData: any = null;
    export let latestVersion: string = '';
    export let addedVersion: string = '1.0';

    interface SwitcherItem {
        id: string;
        type: 'level' | 'plated';
        level: number;
        title: string;
    }

    $: tracked = $achievementStore[achievement.id] || { level: 0, plated: false };
    $: isCompleted = isAchievementFullyCompleted(achievement, tracked);
    $: isNew = latestVersion ? addedVersion === latestVersion : false;

    $: sortedLevels = Object.keys(achievement.levelInfos || {})
        .map(Number)
        .sort((a, b) => a - b);
    $: maxLevel = sortedLevels.length > 0 ? Math.max(...sortedLevels) : achievement.initLevel;
    $: minLevel = sortedLevels.length > 0 ? Math.min(...sortedLevels) : achievement.initLevel;

    $: switcherItems = (() => {
        const items: SwitcherItem[] = [];
        const levels = sortedLevels.length > 0 ? sortedLevels : [achievement.initLevel];
        for (const lvl of levels) {
            let title = $t('achLevels.source');
            if (achievement.upgradable && lvl === 2) title = $t('achLevels.reforging2');
            else if (achievement.upgradable && lvl === 3) title = $t('achLevels.reforging3');
            items.push({
                id: `level_${lvl}`,
                type: 'level',
                level: lvl,
                title
            });
        }
        if (achievement.plateable) {
            items.push({
                id: 'plated',
                type: 'plated',
                level: maxLevel,
                title: $t('achLevels.trimming')
            });
        }
        return items;
    })();

    let manualSelection: SwitcherItem | null = null;

    $: defaultSelection = (() => {
        if (achievement.plateable && tracked.plated) {
            return switcherItems.find((i) => i.type === 'plated') || switcherItems[switcherItems.length - 1];
        }
        if (tracked.level && tracked.level >= minLevel) {
            return (
                switcherItems.find((i) => i.type === 'level' && i.level === tracked.level) ||
                switcherItems[0]
            );
        }
        return switcherItems[0];
    })();

    $: currentItem = manualSelection || defaultSelection;

    $: activeImageLevel = (() => {
        if (currentItem?.type === 'plated') {
            const num = maxLevel < 10 ? `0${maxLevel}` : `${maxLevel}`;
            return `${achievement.id}_lv${num}_plating`;
        }
        const lvl = currentItem?.level || achievement.initLevel;
        const num = lvl < 10 ? `0${lvl}` : `${lvl}`;
        return `${achievement.id}_lv${num}`;
    })();

    $: currentCompleteDesc = (() => {
        if (!localeData?.levels) return '';
        if (currentItem?.type === 'plated') {
            return localeData?.plating?.desc || localeData?.levels?.[maxLevel]?.completeDesc || '';
        }
        const lvl = currentItem?.level || minLevel;
        if (localeData?.levels?.[lvl]?.completeDesc) {
            return localeData.levels[lvl].completeDesc;
        }
        if (localeData?.levels?.[maxLevel]?.completeDesc) {
            return localeData.levels[maxLevel].completeDesc;
        }
        return '';
    })();


    function selectItem(item: SwitcherItem) {
        manualSelection = item;
    }

    function handleToggleLevel(level: number) {
        manualSelection = null;
        toggleAchievementLevel(achievement.id, level, maxLevel, achievement.plateable);
    }

    function handleTogglePlate() {
        manualSelection = null;
        toggleAchievementPlate(achievement.id, maxLevel);
    }

    function getLevelTagInfo(level: number) {
        if (!achievement.upgradable || level === minLevel) {
            return { label: $t('achLevels.source'), icon: 'achInfos' };
        }
        if (level === 2) {
            return { label: $t('achLevels.reforging2'), icon: 'achUpgrade' };
        }
        if (level === 3) {
            return { label: $t('achLevels.reforging3'), icon: 'achUpgrade' };
        }
        return { label: `Reforging ${level}`, icon: 'achUpgrade' };
    }
</script>

<div
    class="relative border border-[#444444] rounded-xl p-4 md:p-5 flex flex-col justify-between overflow-hidden transition-colors duration-200 bg-transparent"
>
    {#if isCompleted}
        <div
            class="absolute right-0 bottom-0 pointer-events-none text-[#373729] dark:text-[#373729] z-0 select-none overflow-hidden"
        >
            <Icon name="achRightlist" class="w-36 h-32 md:w-48 md:h-40 opacity-70 translate-x-3 translate-y-3" />
        </div>
    {/if}

    <div class="relative z-10 flex flex-col md:flex-row gap-4 md:gap-5 items-start">
        <div class="flex flex-col items-center shrink-0 w-24 md:w-28">
            <div class="w-24 h-24 md:w-28 md:h-28 flex items-center justify-center relative">
                <Image
                    id={activeImageLevel}
                    variant="achievement"
                    interactive={true}
                    className="w-full h-full object-contain"
                    alt={localeData?.name || achievement.id}
                />
            </div>

            {#if switcherItems.length > 1}
                <div class="flex items-center gap-2 mt-2 px-2.5 py-1 bg-black/50 rounded-full">
                    {#each switcherItems as item}
                        {@const isSelected = currentItem?.id === item.id}
                        {@const isTracked = item.type === 'plated' ? tracked.plated : tracked.level >= item.level}
                        <button
                            type="button"
                            on:click={() => selectItem(item)}
                            title={item.title}
                            class="w-2.5 h-2.5 rounded-full focus:outline-none transition-colors duration-150 {isSelected
                                ? 'bg-[#FFE145]'
                                : isTracked
                                ? 'bg-[#FFE145]/50 hover:bg-[#FFE145]/80'
                                : 'bg-[#555555] hover:bg-[#777777]'}"
                        >
                        </button>
                    {/each}
                </div>
            {/if}

        </div>

        <div class="flex-1 min-w-0 w-full">
            <div class="flex items-start justify-between gap-2">
                <div class="flex flex-wrap items-center gap-2">
                    <h4 class="text-white text-base md:text-lg font-bold leading-tight">
                        {localeData?.name || achievement.id}
                    </h4>

                    {#if achievement.upgradable}
                        <span class="badge-reforgable text-[11px] font-bold px-2 py-0.5 rounded tracking-wide">
                            Reforgable
                        </span>
                    {:else if achievement.plateable}
                        <span class="badge-trimmable text-[11px] font-bold px-2 py-0.5 rounded tracking-wide">
                            Trimmable
                        </span>
                    {/if}
                </div>

                {#if isNew}
                    <div class="flex items-stretch h-[16px] pointer-events-none shrink-0">
                        <div class="w-[3px] mr-[1.5px] bg-[#FFC107]/85 -skew-x-[24deg]"></div>
                        <div class="w-[3px] mr-[1.5px] bg-[#FFC107]/85 -skew-x-[24deg]"></div>
                        <div
                            class="relative bg-[#FFC107]/85 pl-1 pr-1.5 -skew-x-[24deg] flex items-center justify-center"
                        >
                            <span
                                class="relative z-10 text-[#111111] font-black text-[9px] -skew-x-[-24deg] tracking-widest leading-none uppercase"
                            >
                                NEW
                            </span>
                        </div>
                    </div>
                {/if}
            </div>

            {#if currentCompleteDesc}
                <p class="text-gray-400 text-xs md:text-sm mt-1.5 mb-3 leading-relaxed">
                    {currentCompleteDesc}
                </p>
            {/if}

            <div class="flex flex-col gap-2 mt-2">
                {#each sortedLevels as lvl}
                    {@const isLevelDone = tracked.level >= lvl}
                    {@const tag = getLevelTagInfo(lvl)}
                    <div class="flex items-center justify-between gap-3 py-1">
                        <div class="flex items-center gap-2.5 flex-1 min-w-0">
                            <div
                                class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-normal shrink-0 transition-colors {isLevelDone
                                    ? 'bg-[#BBBBBB] text-[#3F3F3F]'
                                    : 'bg-[#3F3F3F] text-[#BBBBBB]'}"
                            >
                                <Icon name={tag.icon} class="w-3.5 h-3.5" />
                                <span>{tag.label}</span>
                            </div>

                            <span class="text-xs md:text-sm text-gray-200 leading-snug break-words flex-1">
                                {localeData?.levels?.[lvl]?.desc || ''}
                            </span>
                        </div>

                        <Checkbox
                            checked={isLevelDone}
                            variant="yellow"
                            on:change={() => handleToggleLevel(lvl)}
                        />
                    </div>
                {/each}

                {#if achievement.plateable || (achievement.plateConditions && achievement.plateConditions.length > 0)}
                    {@const isPlateDone = Boolean(tracked.plated)}
                    <div class="flex items-center justify-between gap-3 py-1">
                        <div class="flex items-center gap-2.5 flex-1 min-w-0">
                            <div
                                class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-normal shrink-0 transition-colors {isPlateDone
                                    ? 'bg-[#BBBBBB] text-[#3F3F3F]'
                                    : 'bg-[#3F3F3F] text-[#BBBBBB]'}"
                            >
                                <Icon name="achPlate" class="w-3.5 h-3.5" />
                                <span>{$t('achLevels.trimming')}</span>
                            </div>

                            <span class="text-xs md:text-sm text-gray-200 leading-snug break-words flex-1">
                                {localeData?.plating?.desc || ''}
                            </span>
                        </div>

                        <Checkbox
                            checked={isPlateDone}
                            variant="yellow"
                            on:change={handleTogglePlate}
                        />
                    </div>
                {/if}
            </div>
        </div>
    </div>

    <div class="relative z-10 flex justify-end mt-3 pt-2">
        <a
            href="/changelog?version={addedVersion}"
            class="text-[11px] md:text-xs text-gray-500 hover:text-gray-300 transition-colors no-underline"
        >
            Added in version {addedVersion}
        </a>
    </div>
</div>

<style>
    .badge-reforgable {
        background: linear-gradient(135deg, #ECC440 0%, #FFF59D 35%, #C2911D 70%, #F5CE56 100%);
        color: #241703;
        border: 1px solid rgba(255, 235, 130, 0.6);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    }

    .badge-trimmable {
        background: linear-gradient(120deg, #79a5d8 0%, #3B92E8 35%, #59397C 52%, #D8A538 78%, #d09022 100%);
        color: #FFFFFF;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.75);
        border: 1px solid rgba(110, 185, 255, 0.45);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
    }
</style>
