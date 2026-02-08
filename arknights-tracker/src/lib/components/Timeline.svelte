<!-- src/lib/components/Timeline.svelte -->
<script>
    import { onMount, onDestroy } from "svelte";
    import { t } from "$lib/i18n";
    import { browser } from "$app/environment";
    import { rawEvents } from "$lib/data/timeline.js";
    import { banners } from "$lib/data/banners.js";

    import Icon from "$lib/components/Icons.svelte";
    import BannerModal from "$lib/components/BannerModal.svelte";
    import Images from "$lib/components/Images.svelte";

    let currentServerId = "3";

    $: serverOffset = currentServerId === "2" ? 8 : -5;
    $: serverName = currentServerId === "2" ? "Asia (UTC+8)" : "Global (UTC-5)";

    function parseServerDate(dateStr) {
        if (!dateStr) return null;
        if (dateStr.includes("Z") || dateStr.includes("+"))
            return new Date(dateStr);

        const offset = serverOffset;
        const sign = offset >= 0 ? "+" : "-";
        const pad = (n) => String(Math.abs(n)).padStart(2, "0");
        const isoStr = dateStr.replace(" ", "T") + `${sign}${pad(offset)}:00`;
        return new Date(isoStr);
    }
    $: TIMEZONES = {
        local: { name: $t("timeline.local") || "Local", offset: "local" },
        server: { name: serverName, offset: serverOffset },
    };

    let selectedTimezone = "local";
    let showTimezoneMenu = false;

    $: allEvents = [serverOffset, ...rawEvents]
        .slice(1)
        .map((e) => ({
            ...e,
            originalType: e.type,
            type: e.type || "ingame",
            realStartTime: parseServerDate(e.startTime),
            realEndTime: e.endTime ? parseServerDate(e.endTime) : null,
        }))
        .concat(
            banners
                .filter((b) => b.endTime !== null)
                .map((b) => ({
                    ...b,
                    originalType: b.type,
                    type: "banner",
                    showOnMain: b.showOnMain,
                    realStartTime: parseServerDate(b.startTime), // И здесь
                    realEndTime: b.endTime ? parseServerDate(b.endTime) : null,
                })),
        )
        .sort((a, b) => {
            const timeA = a.realStartTime ? a.realStartTime.getTime() : 0;
            const timeB = b.realStartTime ? b.realStartTime.getTime() : 0;

            if (timeA !== timeB) return timeA - timeB;

            const mainA = !!a.showOnMain;
            const mainB = !!b.showOnMain;
            if (mainA !== mainB) return mainA ? 1 : -1;

            return (a.id || "").localeCompare(b.id || "");
        });

    let processedEvents = [];
    let separatorLines = [];

    $: {
        const maxGapMs = 2 * 60 * 60 * 1000;
        const groupedByLayer = {};
        const tempEvents = allEvents.map((e) => ({
            ...e,
            connectLeft: false,
            connectRight: false,
        }));

        tempEvents.forEach((e) => {
            const l = e.layer || 0;
            if (!groupedByLayer[l]) groupedByLayer[l] = [];
            groupedByLayer[l].push(e);
        });

        const lines = [];

        Object.values(groupedByLayer).forEach((layerEvents) => {
            layerEvents.sort((a, b) => a.realStartTime - b.realStartTime);

            for (let i = 0; i < layerEvents.length - 1; i++) {
                const current = layerEvents[i];
                const next = layerEvents[i + 1];

                const diff = next.realStartTime - current.realEndTime;

                if (diff >= 0 && diff <= maxGapMs) {
                    current.connectRight = true;
                    next.connectLeft = true;

                    const posX = getPositionX(current.realEndTime);

                    lines.push({
                        left: posX,
                        top:
                            current.layer * (ROW_HEIGHT + GAP_HEIGHT) +
                            HEADER_HEIGHT_PX +
                            EVENT_TOP_OFFSET,
                        height: ROW_HEIGHT,
                        color: "rgba(255, 255, 255, 0.6)", 
                    });
                }
            }
        });

        processedEvents = tempEvents;
        separatorLines = lines;
    }

    function handleClickOutside(event) {
        if (!showTimezoneMenu) return;
        const clickedBadge = event.target.closest("[data-timezone-badge]");
        const clickedMenu = event.target.closest("[data-timezone-menu]");
        if (!clickedBadge && !clickedMenu) {
            showTimezoneMenu = false;
        }
    }

    function getVariant(item) {
        if (!item) return "event-icon";
        if (
            item.featured6 ||
            item.type === "banner" ||
            item.type === "standard" ||
            item.type === "new-player" ||
            item.type === "special"
        ) {
            return "banner-icon";
        }
        return "event-icon";
    }

    function convertTime(dateInput, targetTzKey) {
        const date = new Date(dateInput);
        if (targetTzKey === "local") return date;
        const tzData = TIMEZONES[targetTzKey];
        if (!tzData) return date;
        const targetOffset = tzData.offset;
        const utc = date.getTime() + date.getTimezoneOffset() * 60000;
        return new Date(utc + 3600000 * targetOffset);
    }

    const DAY_WIDTH = 35;
    const ROW_HEIGHT = 50;
    const GAP_HEIGHT = 8;
    const HEADER_HEIGHT_PX = 80;
    const EVENT_TOP_OFFSET = 20;
    const TIMELINE_HEIGHT = "65vh";

    let now = new Date();
    let timerInterval;

    const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 4, 0);

    let days = [];
    let tempDate = new Date(startDate);
    while (tempDate <= endDate) {
        days.push(new Date(tempDate));
        tempDate.setDate(tempDate.getDate() + 1);
    }

    let months = [];
    days.forEach((day) => {
        const key = `${day.getFullYear()}-${day.getMonth()}`;
        const lastMonth = months[months.length - 1];
        if (!lastMonth || lastMonth.key !== key) {
            months.push({ key, date: day, daysCount: 1 });
        } else {
            lastMonth.daysCount++;
        }
    });

    const totalWidth = days.length * DAY_WIDTH;

    function getPositionX(dateInput) {
        const displayDate = convertTime(dateInput, selectedTimezone);
        const diffTime = displayDate.getTime() - startDate.getTime();
        return (diffTime / (1000 * 60 * 60 * 24)) * DAY_WIDTH;
    }

    function getWidth(startInput, endInput) {
        if (!startInput || !endInput) return DAY_WIDTH;
        const start = convertTime(startInput, selectedTimezone);
        const end = convertTime(endInput, selectedTimezone);
        const diff = end - start;
        return Math.max(
            (diff / (1000 * 60 * 60 * 24)) * DAY_WIDTH,
            DAY_WIDTH / 2,
        );
    }

    function getRemainingTime(endInput, t) {
        if (!endInput) return null;
        const diff = endInput - now;

        if (diff <= 0) return null;
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        if (d > 0) return t("timer.d_h", { d, h });
        return t("timer.h", { h });
    }

    function getTimeUntilStart(startInput, t) {
        if (!startInput) return null;
        const diff = startInput - now;

        if (diff <= 0) return null;
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        if (d > 0) return t("timer.in_d_h", { d, h });
        return t("timer.in_h", { h });
    }

    $: currentTimeX = getPositionX(now);
    $: currentTimeData = formatCurrentTime(now, selectedTimezone);

    function formatCurrentTime(date, timezoneKey) {
        const adjustedDate = convertTime(date, timezoneKey);
        const dd = String(adjustedDate.getDate()).padStart(2, "0");
        const dayKey = adjustedDate
            .toLocaleString("en-US", { weekday: "short" })
            .toLowerCase();
        const hh = String(adjustedDate.getHours()).padStart(2, "0");
        const mm = String(adjustedDate.getMinutes()).padStart(2, "0");
        const ss = String(adjustedDate.getSeconds()).padStart(2, "0");
        const time = `${hh}:${mm}:${ss}`;

        return { dd, dayKey, time };
    }

    let headerContainer;
    let bodyContainer;
    let scrollLeft = 0;

    function handleScroll() {
        if (headerContainer && bodyContainer) {
            headerContainer.scrollLeft = bodyContainer.scrollLeft;
            scrollLeft = bodyContainer.scrollLeft;
        }
    }

    onMount(() => {
        if (browser) {
            currentServerId = localStorage.getItem("ark_server_id") || "3";

            setTimeout(() => {
                if (bodyContainer) {
                    bodyContainer.scrollLeft = currentTimeX - 300;
                }
            }, 100);

            timerInterval = setInterval(() => {
                now = new Date();
            }, 1000);
            document.addEventListener("click", handleClickOutside);
        }
    });

    onDestroy(() => {
        if (browser && timerInterval) clearInterval(timerInterval);
        if (browser) document.removeEventListener("click", handleClickOutside);
    });

    let bannerForModal = null;
    function openEvent(event) {
        const fullBanner = event.id 
            ? banners.find(b => b.id === event.id) 
            : null;
        const baseData = fullBanner || event;
        bannerForModal = {
            ...baseData,
            name: getEventName(baseData),
            startTime: event.realStartTime ? event.realStartTime.toISOString() : baseData.startTime,
            endTime: event.realEndTime ? event.realEndTime.toISOString() : baseData.endTime,
        };
        
        console.log("Opening modal for:", bannerForModal);
    }

    function getEventName(event) {
        if (!event) return "Unknown Event";
        if (event.title && typeof event.title === "string") {
            const translated = $t(event.title);
            if (translated && translated !== event.title) {
                return translated;
            }
        }
        if (event.id) {
            const bannerKey = `banners.${event.id}`;
            const bannerTranslated = $t(bannerKey);

            if (bannerTranslated && bannerTranslated !== bannerKey) {
                return bannerTranslated;
            }
        }
        return event.name || event.title || event.id || "Unknown Event";
    }

    function getEventBadge(event) {
        const origType = (event.originalType || "").toLowerCase();
        if (event.type === "web") {
            return { icon: "link", label: "Web", bg: "bg-black/20" };
        }
        if (
            event.type === "banner" ||
            event.type === "standard" ||
            event.type === "special" ||
            event.type === "new-player"
        ) {
            if (origType === "weapon") {
                return {
                    icon: "atkEvent",
                    label: "Arsenal Issue",
                    bg: "bg-purple-900/40",
                };
            }
            return {
                icon: "headhunting",
                label: "Headhunting",
                bg: "bg-blue-900/40",
            };
        }
        return {
            icon: "event",
            label: "Limited Event",
            bg: "bg-orange-600/60",
        };
    }
</script>

<div class="w-full flex flex-col relative" style="height: {TIMELINE_HEIGHT};">
    {#if showTimezoneMenu}
        <div
            data-timezone-menu
            class="absolute bg-[#21272C] rounded-lg shadow-xl border border-gray-600 py-1 w-[120px] z-[100]"
            style="
        left: {currentTimeX - scrollLeft}px; 
        top: 60px;
        transform: translateX(-50%);
    "
        >
            {#each Object.entries(TIMEZONES) as [key, tz]}
                <button
                    on:click={() => {
                        selectedTimezone = key;
                        showTimezoneMenu = false;
                    }}
                    class="w-full px-2 py-1.5 text-left text-xs transition-colors {selectedTimezone ===
                    key
                        ? 'bg-[#FACC15] text-[#21272C] font-bold'
                        : 'text-gray-300 hover:bg-gray-700'}"
                >
                    {tz.name}
                    {#if selectedTimezone === key}
                        <span class="float-right text-[10px]">✓</span>
                    {/if}
                </button>
            {/each}
        </div>
    {/if}
    <!-- 1. ХЕДЕР -->
    <div class="absolute top-2 left-0 right-0 z-40 pointer-events-none">
        <div
            class="bg-[#21272C] dark:bg-[#1E1E1E] dark:border-[#3F3F3F] text-white rounded-2xl shadow-lg border border-gray-700 overflow-hidden pointer-events-auto"
        >
            <div
                bind:this={headerContainer}
                class="overflow-hidden flex flex-col relative"
            >
                <div class="relative" style="width: {totalWidth}px">
                    <!-- МЕСЯЦЫ -->
                    <div class="flex h-10 border-b border-gray-600/30">
                        {#each months as month}
                            <div
                                class="flex items-center border-l border-gray-600/50 first:border-0 relative"
                                style="width: {month.daysCount * DAY_WIDTH}px;"
                            >
                                <span
                                    class="sticky left-0 dark:bg-[#1E1E1E] px-4 whitespace-nowrap font-bold text-sm z-10 block bg-[#21272C]"
                                >
                                    {$t(
                                        `mouths.${month.date.toLocaleString("en-US", { month: "long" }).toLowerCase()}`,
                                    )}
                                </span>
                            </div>
                        {/each}
                    </div>
                    <!-- БЕЙДЖ НА ЛИНИИ МЕСЯЦЕВ -->
                    <div
                        class="absolute top-0 left-0 h-10 z-20 flex items-center pointer-events-none"
                    >
                        <div
                            class="relative pointer-events-auto"
                            style="transform: translateX({currentTimeX}px) translateX(-50%); transition: transform 1000ms linear;"
                        >
                            <button
                                data-timezone-badge
                                class="bg-[#FACC15] text-white hover:text-gray-800 text-[10px] bg-opacity-[18%] font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-md border border-yellow-600 hover:bg-yellow-400"
                            >
                                &lt; {currentTimeData.dd}
                                {$t(`weekdays.${currentTimeData.dayKey}`)}
                                {currentTimeData.time} &gt;
                            </button>
                        </div>
                    </div>

                    <!-- ДНИ -->
                    <div class="flex h-8 text-gray-400 text-xs">
                        {#each days as day}
                            <div
                                class="relative flex-shrink-0"
                                style="width: {DAY_WIDTH}px;"
                            >
                                <span
                                    class="absolute left-0 top-1/2 -translate-y-1/2 transform -translate-x-1/2 bg-[#21272C] dark:bg-[#1E1E1E] px-1"
                                >
                                    {day.getDate()}
                                </span>
                            </div>
                        {/each}
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 2. ТЕЛО (СЕТКА + ЛИНИЯ + СОБЫТИЯ) -->
    <div
        bind:this={bodyContainer}
        on:scroll={handleScroll}
        class="overflow-x-auto custom-scrollbar flex-grow relative"
    >
        <div class="relative h-full" style="width: {totalWidth}px;">
            <div class="absolute inset-0 top-0 pointer-events-none z-0 flex">
                {#each days as day}
                    <div
                        class="border-l mt-5 border-gray-300/40 dark:border-[#3F3F3F] h-full flex-shrink-0"
                        style="width: {DAY_WIDTH}px;"
                    ></div>
                {/each}
            </div>

            <div
                class="absolute top-0 bottom-0 w-[4px] bg-[#FACC15] z-30 mt-5 pointer-events-none transition-all duration-1000 ease-linear transform -translate-x-1/2"
                style="left: {currentTimeX}px;"
            ></div>

            <div
                class="relative px-0"
                style="padding-top: {HEADER_HEIGHT_PX}px;"
            >
                {#each separatorLines as line}
                    <div
                        class="absolute z-30 pointer-events-none"
                        style="
                            left: {line.left}px;
                            top: {line.top}px;
                            height: {line.height}px;
                            width: 3px; /* Толщина разделителя */
                            background-color: {line.color};
                            transform: translateX(-50%); /* Центрируем по оси X */
                            box-shadow: 0 0 4px rgba(0,0,0,0.3); /* Тень для объема */
                        "
                    ></div>
                {/each}

                {#each processedEvents as event}
                    {@const badge = getEventBadge(event)}

                    <div
                        class="absolute transition-all group"
                        style="
                            left: {getPositionX(event.realStartTime)}px;
                            width: {getWidth(event.realStartTime, event.realEndTime)}px;
                            top: {event.layer * (ROW_HEIGHT + GAP_HEIGHT) + HEADER_HEIGHT_PX + EVENT_TOP_OFFSET}px; 
                            height: {ROW_HEIGHT}px;
                            z-index: 20;
                        "
                    >
                        <button
                            on:click={() => openEvent(event)}
                            class="relative block w-full h-full text-left focus:outline-none"
                        >
                            <div
                                class="absolute inset-0 overflow-hidden shadow-sm hover:ring-1 ring-offset-1 ring-offset-transparent transition-all
                                {event.connectLeft ? 'rounded-l-none border-l-0' : 'rounded-l'} 
                                {event.connectRight ? 'rounded-r-none border-r-0' : 'rounded-r'}"
                                style="
                                    background-color: {event.color};
                                    /* Если есть соединение справа, убираем правую границу, иначе рисуем */
                                    border-right: {event.connectRight ? 'none' : `4px solid ${event.color}`};
                                "
                            >
                                <div class="absolute top-0 right-0 bottom-0 w-[250px] z-0 transition-transform group-hover:scale-105">
                                    <Images
                                        item={event}
                                        variant={getVariant(event)}
                                        className="w-full h-full"
                                        style={`
                                            object-position: right ${event.iconPosition || 50}%;
                                            -webkit-mask-image: linear-gradient(to right, transparent 0%, black 50%);
                                            mask-image: linear-gradient(to right, transparent 0%, black 50%);
                                        `}
                                    />
                                </div>
                                
                                <div
                                    class="absolute inset-0 z-10"
                                    style="background: linear-gradient(90deg, {event.color} 35%, {event.color}D9 50%, transparent 100%);"
                                ></div>
                            </div>

                            <div class="relative z-20 h-full w-full pointer-events-none">
                                <div class="sticky left-0 inline-flex items-center gap-3 px-3 h-full max-w-full pointer-events-auto">
                                    {#if badge}
                                        <div class="flex items-center gap-1.5 rounded px-2 py-0.5 text-white shrink-0 shadow-sm border border-white/10 {badge.bg}">
                                            <Icon name={badge.icon} class="w-3.5 h-3.5" />
                                            <span class="text-[10px] font-bold uppercase tracking-wide opacity-90">
                                                {badge.label}
                                            </span>
                                        </div>
                                    {/if}

                                    <div class="h-6 w-[2px] bg-white/60 shrink-0 opacity-50"></div>

                                    <div class="flex flex-col justify-center min-w-0">
                                        <span class="text-white font-bold text-sm leading-tight truncate drop-shadow-md">
                                            {getEventName(event)}
                                        </span>
                                        <span class="text-white/80 text-[10px] uppercase font-bold tracking-wider">
                                            {event.realStartTime.getDate()}
                                            {$t(`months_gen.${event.realStartTime.toLocaleString("en-US", { month: "long" }).toLowerCase()}`)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </button>
                        
                        {#if now >= event.realStartTime && getRemainingTime(event.realEndTime, $t)}
                           <div class="absolute left-full top-1/2 -translate-y-1/2 ml-3 whitespace-nowrap z-30 flex items-center">
                                <span class="text-xs font-bold text-green-600 dark:bg-white/85 bg-white/80 px-2 py-1 rounded shadow-sm backdrop-blur-sm border border-green-200">
                                    {getRemainingTime(event.realEndTime, $t)}
                                </span>
                           </div>
                        {/if}
                        {#if now < event.realStartTime && getTimeUntilStart(event.realStartTime, $t)}
                           <div class="absolute right-full top-1/2 -translate-y-1/2 mr-3 whitespace-nowrap z-30 flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
                                <span class="text-xs font-bold text-blue-600 bg-white/80 px-2 py-1 rounded shadow-sm backdrop-blur-sm border border-blue-200">
                                    {getTimeUntilStart(event.realStartTime, $t)}
                                </span>
                           </div>
                        {/if}
                    </div>
                {/each}
            </div>
        </div>
    </div>
</div>

<BannerModal banner={bannerForModal} on:close={() => (bannerForModal = null)} />

<style>
    .custom-scrollbar::-webkit-scrollbar {
        height: 14px;
        background-color: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: #d1d5db;
        border-radius: 10px;
        border: 3px solid transparent;
        background-clip: content-box;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background-color: #9ca3af;
    }
</style>
