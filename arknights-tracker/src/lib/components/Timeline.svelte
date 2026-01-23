<!-- src/lib/components/Timeline.svelte -->
<!-- Перевести слово Web-->
<script>
    import { onMount, onDestroy } from "svelte";
    import { t } from "$lib/i18n";
    import { browser } from "$app/environment";
    import { rawEvents } from "$lib/data/timeline.js";
    import { banners } from "$lib/data/banners.js";
    import Icon from "$lib/components/Icons.svelte";
    import BannerModal from "$lib/components/BannerModal.svelte";
    import Images from "$lib/components/Images.svelte";

    const TIMEZONES = {
        local: { name: "Local", offset: 0 },
        utc7: { name: "UTC-7", offset: -7 },
        utc8: { name: "UTC+8", offset: 8 },
    };

    let selectedTimezone = "local";

    let showTimezoneMenu = false;

    // Объединяем события и баннеры
    const allEvents = [
        ...rawEvents.map((e) => ({ ...e, type: e.type || "ingame" })),
        ...banners
            .filter((b) => b.endTime !== null) // Убираем баннеры без даты окончания
            .map((b) => ({ ...b, type: "banner" })),
    ];

    // Сортируем по дате начала
    allEvents.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    // Используем вместо rawEvents
    allEvents.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    const displayEvents = allEvents;

    function handleClickOutside(event) {
        if (!showTimezoneMenu) return;

        // Проверяем, что клик был НЕ по бейджу и НЕ по меню
        const clickedBadge = event.target.closest("[data-timezone-badge]");
        const clickedMenu = event.target.closest("[data-timezone-menu]");

        if (!clickedBadge && !clickedMenu) {
            showTimezoneMenu = false;
        }
    }

    /**
     * Determines which image folder to use based on the item type.
     * Must be top-level in <script> to be used in HTML.
     */
    function getVariant(item) {
        if (!item) return "event-icon";

        // Check if it's a banner based on specific fields or types
        // 'banner' type is added in the allEvents map logic
        if (
            item.featured6 ||
            item.type === "banner" ||
            item.type === "standard" ||
            item.type === "new-player" ||
            item.type === "special"
        ) {
            return "banner-icon";
        }

        // Default for events (web, ingame, etc.)
        return "event-icon";
    }

    onMount(() => {
        if (browser) {
            if (bodyContainer) {
                bodyContainer.scrollLeft = currentTimeX - 300;
            }
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

    // Конвертация времени
    function convertTime(dateStr, targetTz) {
        const date = new Date(dateStr);
        if (targetTz === "local") return date;

        const offset = TIMEZONES[targetTz].offset;
        const utc = date.getTime() + date.getTimezoneOffset() * 60000;
        return new Date(utc + 3600000 * offset);
    }

    // --- КОНФИГУРАЦИЯ ---
    const DAY_WIDTH = 60;
    const ROW_HEIGHT = 50;
    const GAP_HEIGHT = 15;
    const HEADER_HEIGHT_PX = 90; // Отступ для событий, чтобы не наезжали на хедер

    // --- ЛОГИКА ---
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

    function getPositionX(dateStr) {
        const date = convertTime(dateStr, selectedTimezone);
        const diffTime = date - startDate;
        return (diffTime / (1000 * 60 * 60 * 24)) * DAY_WIDTH;
    }

    function getWidth(startStr, endStr) {
        const start = convertTime(startStr, selectedTimezone);
        const end = convertTime(endStr, selectedTimezone);
        const diff = end - start;
        return Math.max(
            (diff / (1000 * 60 * 60 * 24)) * DAY_WIDTH,
            DAY_WIDTH / 2,
        );
    }

    // Сколько времени осталось до конца ивента
    function getRemainingTime(endStr, t) {
        const end = convertTime(endStr, selectedTimezone);
        const diff = end - now;
        if (diff <= 0) return null;

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        // Используем t('ключ', {переменные})
        if (d > 0) return t("timer.d_h", { d, h });
        return t("timer.h", { h });
    }

    function getTimeUntilStart(startStr, t) {
        const start = convertTime(startStr, selectedTimezone);
        const diff = start - now;
        if (diff <= 0) return null;

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (d > 0) return t("timer.in_d_h", { d, h });
        return t("timer.in_h", { h });
    }

    $: currentTimeX = getPositionX(now);
    $: currentTimeData = formatCurrentTime(now, selectedTimezone);

    function formatCurrentTime(date, timezone) {
        const adjustedDate = convertTime(date.toISOString(), timezone);

        // День (01-31)
        const dd = String(adjustedDate.getDate()).padStart(2, "0");

        // Ключ дня недели (mon, tue...) для i18n
        const dayKey = adjustedDate
            .toLocaleString("en-US", { weekday: "short" })
            .toLowerCase();

        // Время (HH:MM:SS)
        const hh = String(adjustedDate.getHours()).padStart(2, "0");
        const mm = String(adjustedDate.getMinutes()).padStart(2, "0");
        const ss = String(adjustedDate.getSeconds()).padStart(2, "0");
        const time = `${hh}:${mm}:${ss}`;

        return { dd, dayKey, time };
    }

    // --- СИНХРОНИЗАЦИЯ СКРОЛЛА ---
    let headerContainer;
    let bodyContainer;
    let scrollLeft = 0;

    function handleScroll() {
        if (headerContainer && bodyContainer) {
            headerContainer.scrollLeft = bodyContainer.scrollLeft;
            scrollLeft = bodyContainer.scrollLeft; // <- новая строка
        }
    }

    onMount(() => {
        if (browser) {
            if (bodyContainer) {
                bodyContainer.scrollLeft = currentTimeX - 300;
            }
            timerInterval = setInterval(() => {
                now = new Date();
            }, 1000);
        }
    });

    onDestroy(() => {
        if (browser && timerInterval) clearInterval(timerInterval);
    });

    let bannerForModal = null;
    function openEvent(event) {
        bannerForModal = {
            ...event,
            name: getEventName(event), // Используем безопасную функцию
        };
    }

    function getEventName(event) {
        if (!event) return "Unknown Event";

        // Если есть готовое имя - используем его
        if (event.name) return event.name;

        // Если есть title и это ключ перевода (начинается с "events." или "banners.")
        if (event.title && typeof event.title === "string") {
            try {
                const translated = $t(event.title);
                // Если перевод найден и он отличается от ключа
                if (translated && translated !== event.title) {
                    return translated;
                }
                // Иначе возвращаем сам ключ
                return event.title;
            } catch (error) {
                console.warn("Translation error for:", event.title, error);
                return event.title;
            }
        }

        // Fallback на id
        return event.id || "Unknown Event";
    }
</script>

<div class="w-full flex flex-col h-[85vh] relative">
    <!-- МЕНЮ ТАЙМЗОНЫ (ПОВЕРХ ВСЕГО) -->
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
    <!-- 1. ХЕДЕР (Z-40: ПЕРЕКРЫВАЕТ ЛИНИИ) -->
    <!-- top-2 left-0 right-0: фиксируем, но без px-2, чтобы ширина совпадала с телом -->
    <div class="absolute top-2 left-0 right-0 z-40 pointer-events-none">
        <!-- Черная капсула -->
        <div
            class="bg-[#21272C] text-white rounded-2xl shadow-lg border border-gray-700 overflow-hidden pointer-events-auto"
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
                                    class="sticky left-0 px-4 whitespace-nowrap font-bold text-sm z-10 block bg-[#21272C]"
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
                                on:click|stopPropagation={() =>
                                    (showTimezoneMenu = !showTimezoneMenu)}
                                class="bg-[#FACC15] text-white text-[10px] bg-opacity-[18%] font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-md border border-yellow-600 hover:bg-yellow-400 hover:scale-105 transition-all duration-200"
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
                            <!-- ДАТЫ НА ЛИНИИ -->
                            <div
                                class="relative flex-shrink-0"
                                style="width: {DAY_WIDTH}px;"
                            >
                                <!-- absolute left-0: прижимаем к началу ячейки (к линии) -->
                                <!-- -translate-x-1/2: сдвигаем влево на 50%, чтобы центр цифры был на линии -->
                                <span
                                    class="absolute left-0 top-1/2 -translate-y-1/2 transform -translate-x-1/2 bg-[#21272C] px-1"
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
    <!-- Убрали лишние padding. border-transparent нужен для компенсации borders хедера, если они есть -->
    <div
        bind:this={bodyContainer}
        on:scroll={handleScroll}
        class="overflow-x-auto custom-scrollbar flex-grow relative"
    >
        <div class="relative h-full" style="width: {totalWidth}px;">
            <!-- СЕТКА (Z-0: САМЫЙ НИЗ) -->
            <!-- top-0: Начинается с верха, уходит ПОД хедер -->
            <div class="absolute inset-0 top-0 pointer-events-none z-0 flex">
                {#each days as day}
                    <!-- border-l (слева) - совпадает с позицией цифры дня -->
                    <div
                        class="border-l mt-5 border-gray-300/40 h-full flex-shrink-0"
                        style="width: {DAY_WIDTH}px;"
                    ></div>
                {/each}
            </div>

            <!-- ЖЕЛТАЯ ЛИНИЯ (Z-30: НИЖЕ ХЕДЕРА, НО ВЫШЕ СЕТКИ) -->
            <div
                class="absolute top-0 bottom-0 w-[4px] bg-[#FACC15] z-30 mt-5 pointer-events-none transition-all duration-1000 ease-linear transform -translate-x-1/2"
                style="left: {currentTimeX}px;"
            ></div>

            <!-- СОБЫТИЯ (Z-20: НИЖЕ ЛИНИИ) -->
            <div
                class="relative px-0"
                style="padding-top: {HEADER_HEIGHT_PX}px;"
            >
                {#each displayEvents as event}
                    <div
                        class="absolute transition-all group"
                        style="
                            left: {getPositionX(event.startTime)}px;
                            width: {getWidth(event.startTime, event.endTime)}px;
                            top: {event.layer * (ROW_HEIGHT + GAP_HEIGHT) +
                            HEADER_HEIGHT_PX}px; 
                            height: {ROW_HEIGHT}px;
                            z-index: 20;
                        "
                    >
                        <button
                            on:click={() => openEvent(event)}
                            class="relative w-full h-full flex items-center overflow-hidden rounded shadow-sm hover:ring-2 ring-offset-1 ring-offset-transparent transition-all text-left"
                            style="
        background-color: {event.color};
        border-right: 4px solid {event.color};
    "
                        >
                            <div
                                class="absolute top-0 right-0 bottom-0 w-[250px] z-0 transition-transform group-hover:scale-105"
                            >
                                <Images
                                    item={event}
                                    variant={getVariant(event)}
                                    className="w-full h-full"
                                    style="
                object-position: right {event.iconPosition || 50}%;
                -webkit-mask-image: linear-gradient(to right, transparent 0%, black 50%);
                mask-image: linear-gradient(to right, transparent 0%, black 50%);
            "
                                />
                            </div>

                            <div
                                class="absolute inset-0 z-10"
                                style="background: linear-gradient(90deg, {event.color} 35%, {event.color}D9 50%, transparent 100%);"
                            ></div>

                            <div
                                class="relative z-20 flex items-center gap-3 px-3 w-full h-full"
                            >
                                {#if event.type === "web"}
                                    <div
                                        class="flex items-center gap-1.5 bg-black/20 rounded px-2 py-1 text-white shrink-0"
                                    >
                                        <Icon name="link" class="w-4 h-4" />
                                        <span
                                            class="text-xs font-bold uppercase"
                                            >Web</span
                                        >
                                    </div>
                                {/if}

                                <div class="h-6 w-[2px] bg-white/60"></div>

                                <div
                                    class="flex flex-col justify-center min-w-0"
                                >
                                    <span
                                        class="text-white font-bold text-sm leading-tight truncate drop-shadow-md"
                                    >
                                        {getEventName(event)}
                                    </span>
                                    <span
                                        class="text-white/80 text-[10px] uppercase font-bold tracking-wider"
                                    >
                                        {new Date(event.startTime).getDate()}
                                        {$t(
                                            `months_gen.${new Date(event.startTime).toLocaleString("en-US", { month: "long" }).toLowerCase()}`,
                                        )}
                                    </span>
                                </div>
                            </div>
                        </button>

                        <!-- Бейдж для активных событий (осталось времени) -->
                        {#if now >= convertTime(event.startTime, selectedTimezone) && getRemainingTime(event.endTime, $t)}
                            <div
                                class="absolute left-full top-1/2 -translate-y-1/2 ml-3 whitespace-nowrap z-30 flex items-center"
                            >
                                <span
                                    class="text-xs font-bold text-green-600 bg-white/80 px-2 py-1 rounded shadow-sm backdrop-blur-sm border border-green-200"
                                >
                                    {getRemainingTime(event.endTime, $t)}
                                </span>
                                <div
                                    class="absolute -left-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"
                                ></div>
                            </div>
                        {/if}

                        <!-- Бейдж для будущих событий (начнется через) -->
                        {#if now < convertTime(event.startTime, selectedTimezone) && getTimeUntilStart(event.startTime, $t)}
                            <div
                                class="absolute right-full top-1/2 -translate-y-1/2 mr-3 whitespace-nowrap z-30 flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto"
                            >
                                <span
                                    class="text-xs font-bold text-blue-600 bg-white/80 px-2 py-1 rounded shadow-sm backdrop-blur-sm border border-blue-200"
                                >
                                    {getTimeUntilStart(event.startTime, $t)}
                                </span>
                                <div
                                    class="absolute -right-1 w-2 h-2 bg-blue-500 rounded-full"
                                ></div>
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
