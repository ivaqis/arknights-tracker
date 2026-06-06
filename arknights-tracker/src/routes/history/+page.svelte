<script>
    import { onMount, onDestroy } from "svelte";
    import { t } from "$lib/i18n";
    import { browser } from "$app/environment";
    import { banners } from "$lib/data/banners.js";
    import { characters } from "$lib/data/characters.js";
    import { weapons } from "$lib/data/weapons.js";

    import Images from "$lib/components/Images.svelte";
    import BannerModal from "$lib/components/BannerModal.svelte";
    import Select from "$lib/components/Select.svelte";

    let now = new Date();
    let timerInterval;
    let currentTab = "operators"; // 'operators' | 'weapons'
    let sortBy = "max_wait"; // 'max_wait' | 'release'
    let selectedBanner = null;

    function parseDate(dateStr) {
        if (!dateStr) return new Date();
        if (
            dateStr.includes("Z") ||
            (dateStr.includes("T") && dateStr.includes("+"))
        ) {
            return new Date(dateStr);
        }
        return new Date(dateStr.replace(" ", "T") + "-05:00");
    }

    const excludedBanners = ["new_player_01", "standard_01"];

    $: versions = (() => {
        const vMap = new Map();
        banners.forEach((b) => {
            if (
                b.version &&
                !excludedBanners.includes(b.id) &&
                !b.id.startsWith("weaponbox_constant_")
            ) {
                const t = parseDate(b.startTime).getTime();
                if (!vMap.has(b.version) || t < vMap.get(b.version)) {
                    vMap.set(b.version, t);
                }
            }
        });
        return Array.from(vMap.entries())
            .sort((a, b) => a[1] - b[1])
            .map(([version, time], index) => ({ version, time, index }));
    })();

    const op6 = Object.values(characters).filter((c) => c.rarity === 6);
    const weap6 = Object.values(weapons).filter((w) => w.rarity === 6);

    const sortOptions = [
        {
            value: "max_wait",
            label: $t("systemNames.sortByWait") || "By days without rerun",
        },
        {
            value: "release",
            label: $t("systemNames.sortByRelease") || "By release date",
        },
    ];

    $: processedItems = (() => {
        const sourceItems = currentTab === "operators" ? op6 : weap6;
        const validTypes = [
            "banner",
            "standard",
            "special",
            "joint",
            "new-player",
            "weapon",
        ];

        return sourceItems
            .map((item) => {
                const itemBanners = banners
                    .filter(
                        (b) =>
                            validTypes.includes(b.type) &&
                            b.featured6?.includes(item.id),
                    )
                    .filter(
                        (b) =>
                            !excludedBanners.includes(b.id) &&
                            !b.id.startsWith("weaponbox_constant_"),
                    )
                    .map((b) => ({
                        ...b,
                        startMs: parseDate(b.startTime).getTime(),
                        endMs: parseDate(b.endTime).getTime(),
                    }))
                    .sort((a, b) => a.startMs - b.startMs)
                    .map((b, idx, arr) => {
                        const startVIndex = Math.max(
                            0,
                            versions.findIndex((v) => v.version === b.version),
                        );
                        let endVIndex = startVIndex;
                        for (let j = versions.length - 1; j >= 0; j--) {
                            if (versions[j].time <= b.endMs - 86400000) {
                                endVIndex = Math.max(startVIndex, j);
                                break;
                            }
                        }
                        let gapDays = 0;
                        let gapVersions = 0;
                        if (idx < arr.length - 1) {
                            const nextB = arr[idx + 1];
                            gapDays = Math.round(
                                (nextB.startMs - b.endMs) / 86400000,
                            );
                            const nextStartVIndex = Math.max(
                                0,
                                versions.findIndex(
                                    (v) => v.version === nextB.version,
                                ),
                            );
                            gapVersions = Math.max(
                                0,
                                nextStartVIndex - endVIndex,
                            );
                        }
                        return {
                            ...b,
                            startVIndex,
                            endVIndex,
                            gapDays,
                            gapVersions,
                        };
                    });

                if (itemBanners.length === 0) return null;

                const lastBanner = itemBanners[itemBanners.length - 1];
                const isCurrentlyActive =
                    now.getTime() >= lastBanner.startMs &&
                    now.getTime() <= lastBanner.endMs;
                const latestVersion = versions[versions.length - 1]?.version;
                const isCurrentVersion = lastBanner.version === latestVersion;
                const diffMs = now.getTime() - lastBanner.endMs;
                const daysWaiting = Math.round(diffMs / 86400000);
                const daysLeft = isCurrentlyActive
                    ? Math.ceil((lastBanner.endMs - now.getTime()) / 86400000)
                    : 0;
                const daysOngoing = isCurrentlyActive
                    ? Math.floor(
                          (now.getTime() - lastBanner.startMs) / 86400000,
                      )
                    : 0;
                const lastVersionIndex = versions.findIndex(
                    (v) => v.version === lastBanner.version,
                );
                let versionsWaiting = 0;
                if (lastVersionIndex !== -1 && !isCurrentlyActive) {
                    versionsWaiting = Math.max(
                        0,
                        versions.length - 1 - lastVersionIndex,
                    );
                }

                return {
                    ...item,
                    banners: itemBanners,
                    firstStartMs: itemBanners[0].startMs,
                    daysWaiting,
                    versionsWaiting,
                    isCurrentlyActive,
                    daysLeft,
                    daysOngoing,
                    isCurrentVersion,
                };
            })
            .filter(Boolean);
    })();

    $: sortedItems = [...processedItems].sort((a, b) => {
        if (sortBy === "max_wait") {
            if (a.isCurrentlyActive && !b.isCurrentlyActive) return 1;
            if (!a.isCurrentlyActive && b.isCurrentlyActive) return -1;
            return b.daysWaiting - a.daysWaiting;
        } else {
            return a.firstStartMs - b.firstStartMs;
        }
    });

    const COLUMN_WIDTH = 130;
    const ROW_HEIGHT = 44;

    $: timelineEnd = (versions.length - 1) * COLUMN_WIDTH;
    $: totalWidth = timelineEnd + 400;
    $: timelineWidth = getX(now.getTime());

    function getX(input) {
        if (!input) return 0;

        let timeMs;
        if (typeof input === "string") {
            const v = versions.find((x) => x.version === input);
            timeMs = v ? v.time : 0;
        } else {
            timeMs = input;
        }

        if (!timeMs) return 0;

        let activeIdx = -1;
        for (let i = 0; i < versions.length; i++) {
            if (versions[i].time <= timeMs) {
                activeIdx = i;
            } else {
                break;
            }
        }

        if (activeIdx === -1) {
            return 0;
        }

        const v = versions[activeIdx];
        const nextV = versions[activeIdx + 1];
        const duration = nextV ? nextV.time - v.time : 42 * 86400000; // Default to 42 days in ms

        const progress = Math.min(1, Math.max(0, (timeMs - v.time) / duration));
        return (activeIdx + progress) * COLUMN_WIDTH;
    }

    let bodyContainer;

    onMount(() => {
        if (browser) {
            timerInterval = setInterval(() => (now = new Date()), 60000);
            setTimeout(() => {
                if (bodyContainer) bodyContainer.scrollLeft = totalWidth;
            }, 100);
        }
    });

    onDestroy(() => {
        if (timerInterval) clearInterval(timerInterval);
    });
</script>

<div class="relative flex flex-col w-full text-[#21272C] dark:text-[#FDFDFD]">
    <div class="flex items-center gap-4 mb-1 shrink-0">
        <h2
            class="font-sdk dark:text-[#FDFDFD] text-5xl tracking-wide text-[#21272C] flex items-center gap-3 mb-3"
        >
            {$t("pages.bannerHistory") || "Banners History"}
        </h2>
    </div>

    <div
        class="flex flex-col xl:flex-row xl:items-end justify-between border-b border-gray-200 dark:border-[#444444] w-full mb-6 relative z-50 gap-4"
    >
        <div
            class="flex items-end gap-0 overflow-x-auto custom-tab-scroll flex-1 min-w-0"
        >
            {#each [{ id: "operators", label: "systemNames.operators" }, { id: "weapons", label: "systemNames.weapons" }] as tab}
                <button
                    class="px-6 py-3 text-md font-bold transition-all relative border-b-2 whitespace-nowrap shrink-0 {currentTab ===
                    tab.id
                        ? 'text-[#21272C] border-[#FFE145] dark:text-[#FDFDFD]'
                        : 'text-gray-400 hover:text-gray-600 border-transparent hover:bg-gray-50 hover:dark:bg-[#424242] dark:text-[#B7B6B3]'}"
                    on:click={() => (currentTab = tab.id)}
                >
                    {$t(tab.label) !== tab.label
                        ? $t(tab.label)
                        : tab.id === "operators"
                          ? "Оперативники"
                          : "Оружие"}
                </button>
            {/each}
        </div>

        <div class="w-full xl:w-[300px] max-w-[300px] shrink-0 pb-2">
            <Select
                options={sortOptions}
                bind:value={sortBy}
                placeholder="Сортировка"
                variant="black"
            />
        </div>
    </div>

    <div
        bind:this={bodyContainer}
        class="pl-5 min-h-[700px] flex-1 overflow-auto custom-scrollbar relative w-full outline-none bg-transparent"
    >
        <div
            class=""
            style="width: {totalWidth}px; min-height: 100%; position: relative;"
        >
            <div class="absolute inset-0 z-0 pointer-events-none">
                {#each versions as v}
                    <div
                        class="absolute top-0 bottom-0 border-l border-gray-300 dark:border-[#444444]"
                        style="left: {getX(v.version)}px;"
                    >
                        <span
                            class="absolute text-[11px] font-bold text-gray-500 dark:text-gray-400 leading-none bg-base dark:bg-[#2C2C2C] px-1 py-0.5"
                            style="transform: translateX(-50%); left: 0; top: 0px;"
                        >
                            {v.version}
                        </span>
                    </div>
                {/each}
            </div>

            <div class="relative w-full pb-8 pt-7 pl-4">
                {#each sortedItems as item}
                    {@const lastBanner = item.banners[item.banners.length - 1]}
                    {@const isLastExpanded =
                        currentTab === "weapons" &&
                        lastBanner.endVIndex > lastBanner.startVIndex}
                    <div
                        class="relative flex items-center group"
                        style="height: {ROW_HEIGHT}px;"
                    >
                        <div
                            class="absolute h-[32px] opacity-40 dark:opacity-30 rounded-full"
                            style="left: {getX(item.banners[0].startMs) -
                                16}px; width: {timelineEnd -
                                getX(item.banners[0].startMs) +
                                30}px; background-color: {item.banners[0]
                                .color || '#555555'};"
                        ></div>

                        {#each item.banners as banner, i}
                            {@const isExpanded =
                                currentTab === "weapons" &&
                                banner.endVIndex > banner.startVIndex}
                            {@const pillWidth = isExpanded
                                ? getX(banner.endMs) - getX(banner.startMs) + 32
                                : null}
                            {@const showPill =
                                i === 0 ||
                                i < item.banners.length - 1 ||
                                isExpanded}

                            {#if showPill}
                                <button
                                    on:click={() => (selectedBanner = banner)}
                                    class="absolute z-20 flex items-center bg-[#21272C] dark:bg-[#1E1E1E] rounded-full h-8 shadow-md outline outline-gray-400 dark:outline-[#444] pr-3 hover:outline-white dark:hover:outline-white transition-all overflow-hidden"
                                    style="left: {getX(
                                        banner.startMs,
                                    )}px; transform: translateX(-16px); {pillWidth
                                        ? `width: ${pillWidth}px;`
                                        : ''}"
                                >
                                    <div
                                        class="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-t from-[#591C00] to-[#CA774C] shrink-0"
                                    >
                                        <Images
                                            id={item.id}
                                            variant={currentTab === "weapons"
                                                ? "weapon-icon"
                                                : "operator-preview"}
                                            className="scale-[1.35] w-full h-full object-cover"
                                        />
                                    </div>

                                    {#if i < item.banners.length - 1}
                                        <div
                                            class="ml-2 flex flex-col justify-center text-white dark:text-gray-200 leading-none text-left gap-0.5"
                                        >
                                            <span
                                                class="text-[10px] font-bold whitespace-nowrap"
                                            >
                                                {banner.version}
                                            </span>
                                            <span
                                                class="text-[8px] opacity-75 font-semibold whitespace-nowrap"
                                            >
                                                {banner.gapDays}{$t(
                                                    "systemNames.d",
                                                ) || "d"}
                                            </span>
                                        </div>
                                    {:else if isLastExpanded && i === item.banners.length - 1}
                                        <div
                                            class="ml-2 flex flex-col justify-center text-white dark:text-gray-200 leading-none text-left gap-0.5"
                                        >
                                            <span
                                                class="text-[10px] font-bold whitespace-nowrap"
                                            >
                                                {banner.version}
                                            </span>
                                            <span
                                                class="text-[8px] opacity-75 font-semibold whitespace-nowrap pr-2"
                                            >
                                                {#if item.isCurrentlyActive}
                                                    <span class="text-green-400"
                                                        >{$t("status.active") ||
                                                            "Active"}</span
                                                    >
                                                    ({$t(
                                                        "timer.ongoing_active",
                                                        { n: item.daysOngoing },
                                                    )})
                                                {:else}
                                                    {$t("systemNames.versions")}
                                                    {item.versionsWaiting} • {$t(
                                                        "timer.days_ago",
                                                        { n: item.daysWaiting },
                                                    )}
                                                {/if}
                                            </span>
                                        </div>
                                    {:else}
                                        <span
                                            class="ml-2 text-[10px] font-bold text-white dark:text-gray-200 whitespace-nowrap"
                                        >
                                            {banner.version}
                                        </span>
                                    {/if}
                                </button>
                            {:else}
                                <button
                                    on:click={() => (selectedBanner = banner)}
                                    class="absolute z-20 flex items-center bg-[#21272C] dark:bg-[#1E1E1E] rounded-full h-8 w-8 shadow-md outline outline-gray-400 dark:outline-[#444] hover:outline-white dark:hover:outline-white transition-all overflow-hidden"
                                    style="left: {getX(
                                        banner.startMs,
                                    )}px; transform: translateX(-16px);"
                                >
                                    <Images
                                        id={item.id}
                                        variant={currentTab === "weapons"
                                            ? "weapon-icon"
                                            : "operator-preview"}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            {/if}
                        {/each}

                        <div
                            class="absolute z-20 flex items-center"
                            style="left: {isLastExpanded
                                ? getX(lastBanner.endMs)
                                : timelineEnd}px; transform: translateX(-16px);"
                        >
                            {#if !isLastExpanded}
                                <button
                                    class="flex items-center bg-[#21272C] dark:bg-[#1E1E1E] rounded-full h-8 pr-3 outline outline-gray-400 min-w-[90px] dark:outline-[#444] shadow-md transition-all {item.isCurrentlyActive ||
                                    item.isCurrentVersion
                                        ? 'cursor-pointer hover:outline-white dark:hover:outline-white'
                                        : 'cursor-default'}"
                                    on:click={() => {
                                        if (
                                            item.isCurrentlyActive ||
                                            item.isCurrentVersion
                                        ) {
                                            selectedBanner =
                                                item.banners[
                                                    item.banners.length - 1
                                                ];
                                        }
                                    }}
                                >
                                    <div
                                        class="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-t from-[#591C00] to-[#CA774C] shrink-0"
                                    >
                                        <Images
                                            id={item.id}
                                            variant={currentTab === "weapons"
                                                ? "weapon-icon"
                                                : "operator-preview"}
                                            className="scale-[1.35] w-full h-full object-cover"
                                        />
                                    </div>
                                    <div
                                        class="ml-2 flex flex-col justify-center text-white dark:text-gray-200 leading-none text-left gap-0.5"
                                    >
                                        {#if item.isCurrentlyActive}
                                            <span
                                                class="text-[10px] font-bold text-green-400 whitespace-nowrap"
                                                >{$t("status.active") ||
                                                    "Активен"}</span
                                            >
                                            <span
                                                class="text-[9px] font-bold whitespace-nowrap"
                                                >{$t("timer.ongoing_active", {
                                                    n: item.daysOngoing,
                                                })}</span
                                            >
                                        {:else}
                                            <span
                                                class="text-[9px] font-bold whitespace-nowrap"
                                                >{$t("systemNames.versions")}
                                                {item.versionsWaiting}</span
                                            >
                                            <span
                                                class="text-[9px] font-bold whitespace-nowrap"
                                                >{$t("timer.days_ago", {
                                                    n: item.daysWaiting,
                                                })}</span
                                            >
                                        {/if}
                                    </div>
                                </button>
                            {/if}

                            <span class="text-sm font-bold whitespace-nowrap text-[#21272C] dark:text-[#FDFDFD] {isLastExpanded
                                    ? 'ml-12'
                                    : 'ml-3'}">
                                {currentTab === "operators"
                                    ? $t(`characters.${item.id}`) !==
                                      `characters.${item.id}`
                                        ? $t(`characters.${item.id}`)
                                        : item.name
                                    : $t(`weaponsList.${item.id}`) !==
                                        `weaponsList.${item.id}`
                                      ? $t(`weaponsList.${item.id}`)
                                      : item.name}
                            </span>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    </div>
</div>

<BannerModal banner={selectedBanner} on:close={() => (selectedBanner = null)} />
