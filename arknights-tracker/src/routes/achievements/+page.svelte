<script lang="ts">
    import { onMount } from 'svelte';
    import { t } from '$lib/i18n';
    import { currentLocale } from '$lib/stores/locale';
    import {
        achievements,
        achievementCategories,
        type AchievementData,
        type AchievementCategoryData
    } from '$lib/data/achievements';
    import {
        achievementStore,
        getCategoryProgress,
        getTotalProgress,
        isAchievementFullyCompleted
    } from '$lib/stores/achievementStore';
    import { changelogData } from '$lib/data/versions';
    import Icon from '$lib/components/Icon.svelte';
    import Select from '$lib/components/Select.svelte';
    import SwitchButton from '$lib/components/SwitchButton.svelte';
    import AchievementCard from '$lib/components/achievements/AchievementCard.svelte';

    const categoryIcons: Record<string, string> = {
        achv_type_quest: 'achQuest',
        achv_type_battle: 'achBattle',
        achv_type_adventure: 'achAdventure',
        achv_type_growth: 'achGrowth',
        achv_type_factory: 'achFactory',
        achv_type_social: 'achSocial',
        achv_type_event: 'achEvent',
        achv_type_hide: 'achHide'
    };

    const achievementLocaleModules: Record<string, () => Promise<any>> = import.meta.glob(
        '/src/lib/locales/*/achievements.json'
    );

    let achievementsLocaleData: Record<string, any> = {};

    const sortedCategories: AchievementCategoryData[] = Object.values(achievementCategories).sort(
        (a, b) => a.priority - b.priority
    );

    let selectedCategoryId: string = sortedCategories[0]?.id || 'achv_type_quest';
    let searchQuery: string = '';
    let onlyIncomplete: boolean = false;
    let selectedVersion: string = 'all';

    const latestVersion = [...changelogData].sort((a, b) =>
        b.version.localeCompare(a.version, undefined, { numeric: true })
    )[0]?.version || '1.0';

    $: versionOptions = [
        { value: 'all', label: $t('achievements.allVersions') },
        ...changelogData
            .map((v) => ({
                value: v.version,
                label: `${$t('systemNames.version')} ${v.version}`
            }))
            .sort((a, b) => (a.value === 'all' ? -1 : b.value.localeCompare(a.value, undefined, { numeric: true })))
    ];

    function getAchievementAddedVersion(id: string): string {
        const found = changelogData.find((v: any) => v.achievements?.includes(id));
        return found?.version || '1.0';
    }

    async function loadAchievementsLocale(localeCode: string) {
        let safeLang = (localeCode || 'ru').toLowerCase().replace('-', '');
        if (safeLang.startsWith('en')) safeLang = 'en';
        else if (safeLang.startsWith('ru')) safeLang = 'ru';

        const path = `/src/lib/locales/${safeLang}/achievements.json`;
        const fallbackPath = '/src/lib/locales/en/achievements.json';

        const loader = achievementLocaleModules[path] || achievementLocaleModules[fallbackPath];
        if (loader) {
            try {
                const mod = await loader();
                achievementsLocaleData = mod.default || mod;
            } catch (e) {
                console.error('Failed to load achievements locale', e);
            }
        }
    }

    $: if ($currentLocale) {
        loadAchievementsLocale($currentLocale);
    }

    function scrollToCategory(catId: string) {
        selectedCategoryId = catId;
        const el = document.getElementById(catId);
        if (!el) return;

        const targetY = el.getBoundingClientRect().top + window.pageYOffset - 16;
        const startY = window.pageYOffset;
        const diff = targetY - startY;
        const duration = 200;
        let start: number | null = null;

        function step(timestamp: number) {
            if (!start) start = timestamp;
            const elapsed = timestamp - start;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            window.scrollTo(0, startY + diff * ease);
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }
        requestAnimationFrame(step);
    }

    onMount(() => {
        loadAchievementsLocale($currentLocale || 'ru');

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        selectedCategoryId = entry.target.id;
                    }
                }
            },
            { rootMargin: '-5% 0px -75% 0px' }
        );

        const updateObserver = () => {
            for (const cat of sortedCategories) {
                const el = document.getElementById(cat.id);
                if (el) observer.observe(el);
            }
        };

        setTimeout(updateObserver, 150);

        return () => {
            observer.disconnect();
        };
    });

    $: totalStats = getTotalProgress(achievements, $achievementStore);

    $: filteredCategoriesWithGroups = (() => {
        const q = searchQuery.trim().toLowerCase();
        const results: {
            category: AchievementCategoryData;
            groups: { groupId: string; groupName: string; list: AchievementData[] }[];
        }[] = [];

        for (const cat of sortedCategories) {
            const catGroups: { groupId: string; groupName: string; list: AchievementData[] }[] = [];

            for (const gid of cat.groupIds) {
                const list: AchievementData[] = [];
                for (const ach of Object.values(achievements)) {
                    if (ach.groupId !== gid) continue;

                    if (onlyIncomplete && isAchievementFullyCompleted(ach, $achievementStore[ach.id])) {
                        continue;
                    }

                    const addedVer = getAchievementAddedVersion(ach.id);
                    if (selectedVersion !== 'all' && addedVer !== selectedVersion) {
                        continue;
                    }

                    if (q) {
                        const loc = achievementsLocaleData[ach.id];
                        const nameMatch = (loc?.name || ach.id).toLowerCase().includes(q);
                        const descMatch = Object.values(loc?.levels || {}).some((l: any) =>
                            (l?.desc || '').toLowerCase().includes(q) || (l?.completeDesc || '').toLowerCase().includes(q)
                        );
                        const plateMatch = (loc?.plating?.desc || '').toLowerCase().includes(q);

                        if (!nameMatch && !descMatch && !plateMatch) {
                            continue;
                        }
                    }

                    list.push(ach);
                }

                list.sort((a, b) => a.order - b.order);

                if (list.length > 0) {
                    const groupName = $t(`achGroups.${gid}`);
                    catGroups.push({ groupId: gid, groupName, list });
                }
            }

            if (catGroups.length > 0) {
                results.push({ category: cat, groups: catGroups });
            }
        }

        return results;
    })();
</script>

<svelte:head>
    <title>{$t('pages.achievements')} - Goyfield</title>
</svelte:head>

<div class="w-full min-h-screen text-gray-100 flex flex-col">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
        <div class="flex items-center gap-3">
            <h2 class="text-3xl md:text-5xl font-black tracking-wide text-white font-sdk">
                {$t('pages.achievements')}
            </h2>

            <span
                class="bg-[#2E2E2E] px-3.5 py-1 mt-1.5 text-xs md:text-sm font-bold text-gray-200 rounded-full border border-[#444444] shrink-0"
            >
                {totalStats.completed} {$t('achievements.of')} {totalStats.total}
            </span>
        </div>

        <div class="flex flex-wrap items-center gap-3.5 justify-start md:justify-end">
            <div class="flex items-center gap-2.5 shrink-0 select-none">
                <span class="text-xs md:text-sm text-gray-300 font-medium">
                    {$t('achievements.onlyIncomplete')}
                </span>
                <SwitchButton bind:isActive={onlyIncomplete} />
            </div>

            <div class="min-w-[130px] shrink-0">
                <Select
                    options={versionOptions}
                    bind:value={selectedVersion}
                    variant="black"
                    className="w-full"
                />
            </div>

            <div class="relative flex-grow sm:flex-grow-0 sm:w-[280px]">
                <div class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <Icon name="search" class="w-4 h-4" />
                </div>

                <input
                    type="text"
                    bind:value={searchQuery}
                    placeholder={$t('achievements.searchPlaceholder')}
                    class="w-full h-[38px] pl-9 pr-8 bg-[#343434] border border-[#444444] hover:bg-[#383838] focus:border-[#FFE145] rounded-full text-xs md:text-sm text-gray-100 placeholder-gray-400 outline-none transition-all"
                />

                {#if searchQuery}
                    <button
                        on:click={() => (searchQuery = '')}
                        aria-label="Clear search"
                        class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                        <Icon name="close" class="w-3.5 h-3.5" />
                    </button>
                {/if}
            </div>
        </div>
    </div>

    <div class="flex flex-col lg:flex-row items-start gap-6 w-full flex-1">
        <div class="w-full lg:w-[260px] xl:w-[280px] shrink-0 flex flex-col gap-2 lg:sticky lg:top-4 z-20">
            {#each sortedCategories as cat (cat.id)}
                {@const stats = getCategoryProgress(cat.groupIds, achievements, $achievementStore)}
                {@const isSelected = selectedCategoryId === cat.id}
                {@const iconName = categoryIcons[cat.id] || 'achievement'}

                <button
                    on:click={() => scrollToCategory(cat.id)}
                    class="relative w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-3 select-none {isSelected
                        ? 'bg-[#2D2D2D] border-[#FFE145]/40 text-white shadow-lg'
                        : 'bg-[#222222]/60 hover:bg-[#2A2A2A] border-transparent text-gray-400'}"
                >
                    {#if isSelected}
                        <div
                            class="absolute inset-0 pointer-events-none rounded-xl opacity-10 bg-[radial-gradient(#FFE145_1px,transparent_1px)] [background-size:8px_8px]"
                        ></div>
                    {/if}

                    <div class="flex items-center gap-3 min-w-0 relative z-10">
                        <div
                            class="w-7 h-7 flex items-center justify-center shrink-0 transition-colors {isSelected
                                ? 'text-[#FFE145]'
                                : 'text-gray-500'}"
                        >
                            <Icon name={iconName} class="w-6 h-6" />
                        </div>

                        <div class="flex flex-col min-w-0">
                            <span class="text-sm font-bold truncate {isSelected ? 'text-white' : 'text-gray-300'}">
                                {$t(`achCategories.${cat.id}`)}
                            </span>
                            <span class="text-xs text-gray-400 font-nums">
                                {stats.completed}/{stats.total} ({stats.percent}%)
                            </span>
                        </div>
                    </div>

                    <div class="relative z-10 shrink-0 flex items-center">
                        {#if stats.percent === 100 && stats.total > 0}
                            <div class="w-5 h-5 rounded-full bg-[#FFE145]/20 flex items-center justify-center text-[#FFE145]">
                                <Icon name="success" class="w-3.5 h-3.5" />
                            </div>
                        {/if}
                    </div>
                </button>
            {/each}
        </div>

        <div class="hidden lg:block w-[1px] bg-[#3E3E3E] self-stretch shrink-0"></div>

        <div class="flex-1 w-full min-w-0 flex flex-col gap-10">
            {#if filteredCategoriesWithGroups.length === 0}
                <div class="flex flex-col items-center justify-center py-20 mt-10 text-gray-500 gap-3">
                    <Icon name="noData" class="w-12 h-12 opacity-40" />
                    <p class="font-medium">
                        {$t('achievements.empty')}
                    </p>
                </div>
            {:else}
                {#each filteredCategoriesWithGroups as catSection (catSection.category.id)}
                    <section id={catSection.category.id} class="scroll-mt-6 flex flex-col gap-6">
                        <div class="flex items-center gap-3 border-b border-[#3E3E3E] pb-3">
                            <div class="w-8 h-8 flex items-center justify-center text-[#FFE145] shrink-0">
                                <Icon name={categoryIcons[catSection.category.id] || 'achievement'} class="w-7 h-7" />
                            </div>
                            <h3 class="text-xl md:text-2xl font-black text-white font-sdk tracking-wide">
                                {$t(`achCategories.${catSection.category.id}`)}
                            </h3>
                        </div>

                        <div class="flex flex-col gap-8">
                            {#each catSection.groups as group (group.groupId)}
                                <div class="flex flex-col gap-3.5">
                                    <h4 class="text-base md:text-lg font-bold text-gray-300 tracking-wide">
                                        {group.groupName}
                                    </h4>

                                    <div
                                        class="grid gap-4"
                                        style="grid-template-columns: repeat(auto-fill, minmax(min(100%, 445px), 1fr));"
                                    >
                                        {#each group.list as ach (ach.id)}
                                            <AchievementCard
                                                achievement={ach}
                                                localeData={achievementsLocaleData[ach.id]}
                                                latestVersion={latestVersion}
                                                addedVersion={getAchievementAddedVersion(ach.id)}
                                            />
                                        {/each}
                                    </div>
                                </div>
                            {/each}
                        </div>
                    </section>
                {/each}
            {/if}
        </div>
    </div>
</div>
