<script>
  import { t } from "$lib/i18n";
  import { onMount, onDestroy } from "svelte";
  import { currentLocale, currentUiLocale } from "$lib/stores/locale";
  import { goto } from "$app/navigation";
  import { banners } from "$lib/data/banners.js";
  import { promocodes } from "$lib/data/promocodes.js";
  import { rawEvents } from "$lib/data/timeline.js";
  import { currencies } from "$lib/data/items/currencies";
  import { progression } from "$lib/data/items/progression";
  import { fade } from "svelte/transition";

  import Icon from "$lib/components/Icon.svelte";
  import Image from "$lib/components/Image.svelte";
  import Button from "$lib/components/Button.svelte";
  import BannerModal from "$lib/components/modals/BannerModal.svelte";
  import SupportModal from "$lib/components/modals/SupportModal.svelte";
  import Tooltip from "$lib/components/Tooltip.svelte";

  let now = new Date();
  let timer;
  let currentServerId = "3";
  let showServerTime = false;
  let isSupportOpen = false;

  const allItems = [...currencies, ...progression];

  function parseWithServerOffset(dateStr) {
    if (!dateStr) return new Date(9999, 11, 31);
    if (
      dateStr.includes("Z") ||
      (dateStr.includes("T") && dateStr.includes("+"))
    ) {
      return new Date(dateStr);
    }
    const offset = currentServerId === "2" ? 8 : -5;
    const sign = offset >= 0 ? "+" : "-";
    const pad = (n) => String(Math.abs(n)).padStart(2, "0");
    const iso = dateStr.replace(" ", "T") + `${sign}${pad(offset)}:00`;
    return new Date(iso);
  }

  function formatTimeLeft(endTimeStr) {
    const end = parseWithServerOffset(endTimeStr);
    const diff = end - now;
    if (diff <= 0) return null;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) return $t("timer.left_d_h", { d: days, h: hours });
    if (hours > 0) return $t("timer.left_h_m", { h: hours, m: minutes });
    return $t("timer.left_m", { m: minutes });
  }

  function getRarityStyle(id) {
    const item = allItems.find((i) => i.id === id);
    const rarity = item?.rarity || 3;
    switch (rarity) {
      case 5:
      case 6:
        return "bg-amber-50 border-amber-300 text-amber-800 hover:border-amber-500 dark:bg-amber-900/40 dark:border-amber-700 dark:text-amber-200 dark:hover:border-amber-400";
      case 4:
        return "bg-purple-50 border-purple-300 text-purple-800 hover:border-purple-500 dark:bg-purple-900/40 dark:border-purple-700 dark:text-purple-200 dark:hover:border-purple-400";
      case 3:
        return "bg-blue-50 border-blue-300 text-blue-800 hover:border-blue-500 dark:bg-blue-900/40 dark:border-blue-700 dark:text-blue-200 dark:hover:border-blue-400";
      default:
        return "bg-gray-100 border-gray-300 text-gray-700 hover:border-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-400";
    }
  }

  $: activeBanners = banners
    .filter((b) => {
      if (b.type === "inGamePermanent") return false;
      const isAsia = currentServerId === "2";
      const startStr =
        isAsia && b.startTimeAsia ? b.startTimeAsia : b.startTime;
      const endStr = isAsia && b.endTimeAsia ? b.endTimeAsia : b.endTime;
      const start = parseWithServerOffset(startStr);
      const end = endStr
        ? parseWithServerOffset(endStr)
        : new Date(9999, 11, 31);
      return now >= start && now <= end && b.showOnMain === true;
    })
    .sort((a, b) => {
      const priority = { special: 1, weapon: 2 };
      return (priority[a.type] || 99) - (priority[b.type] || 99);
    });

  $: activeEvents = rawEvents
    .map((e) => {
      const isAsia = currentServerId === "2";
      const displayStartTime = isAsia && e.startTimeAsia ? e.startTimeAsia : e.startTime;
      const displayEndTime = isAsia && e.endTimeAsia ? e.endTimeAsia : e.endTime;
      return {
        ...e,
        displayStartTime,
        displayEndTime,
        startTimeMs: parseWithServerOffset(displayStartTime).getTime(),
        endTimeMs: displayEndTime ? parseWithServerOffset(displayEndTime).getTime() : Infinity,
      };
    })
    .filter((e) => now.getTime() >= e.startTimeMs && now.getTime() <= e.endTimeMs)
    .sort((a, b) => a.endTimeMs - b.endTimeMs);

  let currentBannerIndex = 0;
  let bannerInterval;

  function startBannerRotation() {
    if (activeBanners.length <= 1) return;
    stopBannerRotation();
    bannerInterval = setInterval(() => {
      currentBannerIndex = (currentBannerIndex + 1) % activeBanners.length;
    }, 5000);
  }

  function stopBannerRotation() {
    if (bannerInterval) clearInterval(bannerInterval);
  }

  function setBanner(index) {
    currentBannerIndex = index;
    stopBannerRotation();
    startBannerRotation();
  }

  let selectedBanner = null;

  $: currentBannerTimeLeft = (() => {
    const b = activeBanners[currentBannerIndex];
    if (!b || b.type === "inGamePermanent") return "";
    const isAsia = currentServerId === "2";
    const endStr = isAsia && b.endTimeAsia ? b.endTimeAsia : b.endTime;
    if (!endStr) return "";
    return formatTimeLeft(endStr) || "";
  })();

  $: activePromocodes = promocodes
    .map((p) => {
      const isAsia = currentServerId === "2";
      return {
        ...p,
        displayEndTime: isAsia && p.endTimeAsia ? p.endTimeAsia : p.endTime,
      };
    })
    .filter((p) => {
      if (p.displayEndTime === null || p.displayEndTime === "N/A") return true;
      const end = parseWithServerOffset(p.displayEndTime);
      return now <= end;
    });

  function getFormattedDate(dateStr) {
    const end = parseWithServerOffset(dateStr);
    const dateOptions = { month: "short", day: "numeric" };
    let loc = $currentUiLocale || "en";
    if (loc === "my") loc = "ms-MY";
    if (showServerTime) {
      const timeZone =
        currentServerId === "2" ? "Asia/Shanghai" : "America/New_York";
      return end.toLocaleString(loc, { ...dateOptions, timeZone });
    }
    return end.toLocaleString(loc, dateOptions);
  }

  function getPromoTimeLabel(dateStr) {
    const text = formatTimeLeft(dateStr);
    if (!text) return "";
    return `(${text})`;
  }

  function sortRewards(rewards) {
    return [...rewards].sort((a, b) => {
      const itemA = allItems.find((i) => i.id === a.id);
      const itemB = allItems.find((i) => i.id === b.id);
      const rarityA = itemA?.rarity || 0;
      const rarityB = itemB?.rarity || 0;
      if (rarityB !== rarityA) return rarityB - rarityA;
      return b.count - a.count;
    });
  }

  let copiedCode = null;
  async function copyCode(code) {
    try {
      await navigator.clipboard.writeText(code);
      copiedCode = code;
      setTimeout(() => (copiedCode = null), 2000);
    } catch (err) {
      console.error(err);
    }
  }

  onMount(() => {
    if (typeof localStorage !== "undefined") {
      const savedServer = localStorage.getItem("ark_server_id");
      if (savedServer) currentServerId = savedServer;
      const savedTimePref = localStorage.getItem("show_server_time");
      if (savedTimePref !== null) showServerTime = savedTimePref === "true";
    }

    timer = setInterval(() => {
      now = new Date();
    }, 1000 * 60);
    startBannerRotation();
  });

  onDestroy(() => {
    clearInterval(timer);
    clearInterval(bannerInterval);
  });

  function getEventBadge(event) {
    const origType = (event.originalType || "").toLowerCase();
    const glassStyle =
      "bg-black/40 backdrop-blur-md border border-white/10 shadow-sm";

    if (event.type === "mailEvent")
      return { icon: "mail", label: "Mail Event", bg: glassStyle };
    if (event.type === "protoPass")
      return { icon: "protoPass", label: "Proto Pass", bg: glassStyle };
    if (event.type === "web")
      return { icon: "link", label: "Web", bg: glassStyle };
    if (event.type === "signIn")
      return { icon: "signIn", label: "Sign-In", bg: glassStyle };
    if (event.type === "inGamePermanent")
      return { icon: "permanent", label: "Permanent Event", bg: glassStyle };

    if (
      event.type === "banner" ||
      event.type === "standard" ||
      event.type === "special" ||
      event.type === "new-player"
    ) {
      if (origType === "weapon")
        return { icon: "atkEvent", label: "Arsenal Issue", bg: glassStyle };
      return { icon: "headhunting", label: "Headhunting", bg: glassStyle };
    }

    return { icon: "event", label: "Limited Event", bg: glassStyle };
  }
  $: eventsWithBadges = activeEvents
    .map((e) => ({
      ...e,
      badge: getEventBadge(e),
      name: $t(e.title) !== e.title ? $t(e.title) : e.title,
    }))
    .sort((a, b) => {
      const isAPerm = a.type === "inGamePermanent";
      const isBPerm = b.type === "inGamePermanent";

      if (isAPerm && !isBPerm) return 1;
      if (!isAPerm && isBPerm) return -1;

      if (!isAPerm && !isBPerm) {
        return a.endTimeMs - b.endTimeMs;
      }

      return 0;
    });
</script>

<div
  class="min-h-screen w-full relative flex flex-col items-center py-10 px-4 sm:px-8 font-sans text-[#21272C] dark:text-[#FDFDFD]"
>
  <div
    class="mb-6 transition-opacity hover:opacity-80 flex justify-center w-full"
  >
    <Icon name="siteLogo2" className="h-16 w-auto" />
  </div>

  <div
    class="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-4 items-start"
  >
    <div class="flex flex-col gap-6 lg:col-span-2 w-full">
      <div class="flex flex-col gap-3">
        <div class="flex items-center justify-between px-1">
          <h2
            class="text-sm font-bold text-[#21272C] dark:text-[#FDFDFD] flex items-center gap-2"
          >
            <span class="w-2 h-2 bg-[#FACC15] rounded-full"></span>
            {$t("home.current_banners")}
          </h2>
          <div class="flex gap-1.5">
            {#each activeBanners as _, i}
              <button
                aria-label="Switch to banner {i + 1}"
                on:click={() => setBanner(i)}
                class="w-6 h-1 rounded-full transition-all duration-300 {currentBannerIndex ===
                i
                  ? 'bg-[#21272C] dark:bg-[#FDFDFD]'
                  : 'bg-gray-300 dark:bg-[#444]'}"
              ></button>
            {/each}
          </div>
        </div>

        <div
          role="button"
          tabindex="0"
          class="relative w-full aspect-[21/9] bg-gray-200 dark:bg-[#1E1E1E] rounded-xl overflow-hidden shadow-sm group cursor-pointer border border-white/50 dark:border-[#444444] outline-none focus:ring-4 focus:ring-[#FACC15] select-none"
          on:click={() => (selectedBanner = activeBanners[currentBannerIndex])}
          on:keydown={(e) =>
            (e.key === "Enter" || e.key === " ") &&
            (selectedBanner = activeBanners[currentBannerIndex])}
          on:mouseenter={stopBannerRotation}
          on:mouseleave={startBannerRotation}
        >
          {#if activeBanners.length > 0}
            {#key currentBannerIndex}
              <div
                class="absolute inset-0"
                in:fade={{ duration: 200 }}
                out:fade={{ duration: 200 }}
              >
                <Image
                  id={activeBanners[currentBannerIndex].icon}
                  interactive={true}
                  variant="banner-icon"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div
                  class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 pointer-events-none"
                ></div>
                {#if currentBannerTimeLeft}
                  <div
                    class="absolute bottom-3 left-3 z-20 pointer-events-none"
                  >
                    <div
                      class="inline-flex items-center gap-2 px-2.5 py-1 bg-black/40 backdrop-blur-md border border-white/20 rounded-full shadow-md"
                    >
                      <span
                        class="w-1.5 h-1.5 rounded-full bg-[#FACC15] animate-pulse"
                      ></span>
                      <span
                        class="text-[11px] font-bold text-white font-nums leading-none"
                        >{currentBannerTimeLeft}</span
                      >
                    </div>
                  </div>
                {/if}
              </div>
            {/key}
            <button
              type="button"
              class="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black/30 hover:bg-[#FACC15] text-white hover:text-[#21272C] backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 hover:scale-110"
              on:click|stopPropagation={() => {
                currentBannerIndex =
                  (currentBannerIndex - 1 + activeBanners.length) %
                  activeBanners.length;
              }}
            >
              <Icon name="chevronLeft" className="w-6 h-6" />
            </button>
            <button
              type="button"
              class="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black/30 hover:bg-[#FACC15] text-white hover:text-[#21272C] backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 hover:scale-110"
              on:click|stopPropagation={() => {
                currentBannerIndex =
                  (currentBannerIndex + 1) % activeBanners.length;
              }}
            >
              <Icon name="chevronRight" className="w-6 h-6" />
            </button>
          {:else}
            <div
              class="absolute inset-0 flex items-center justify-center text-gray-400 font-bold text-xs"
            >
              {$t("home.noActiveBanners")}
            </div>
          {/if}
        </div>
      </div>

      <div
        class="bg-white dark:bg-[#383838] rounded-xl gap-1 p-4 shadow-sm border border-gray-100 dark:border-[#444444] flex flex-col min-h-[250px]"
      >
        <div class="flex items-center justify-between mb-2">
          <h3
            class="text-sm font-bold text-[#21272C] dark:text-[#FDFDFD] flex items-center gap-2"
          >
            <span class="w-2 h-2 bg-green-400 rounded-full"></span>
            {$t("home.activeEvents") || "Текущие события"}
          </h3>
          <button
            on:click={() => goto("/events")}
            class="text-[11px] font-bold text-gray-500 hover:text-[#FACC15] dark:text-gray-400 dark:hover:text-[#FACC15] transition-colors flex items-center gap-1 group mr-2"
          >
            {$t("home.goToTimeline") || "Перейти в ленту событий"}
            →
          </button>
        </div>

        <div
          class="flex flex-col gap-1.5 overflow-y-auto max-h-[400px] pr-1 py-1 custom-scrollbar"
        >
          {#if activeEvents.length === 0}
            <div
              class="flex flex-col items-center justify-center py-12 text-gray-400 text-sm italic"
            >
              {$t("home.noActiveEvents")}
            </div>
          {:else}
            {#each eventsWithBadges as event, i (event.id + "_" + i)}
              <div
                role="button"
                tabindex="0"
                class="hover:dark:border-white/20 hover:border-1 relative flex items-center p-0 mx-0.5 rounded-lg border-2 border-gray-100 dark:border-[#444] cursor-pointer group outline-none focus:ring-2 focus:ring-[#FACC15] transition-all select-none overflow-hidden shadow-sm hover:shadow-md h-15 shrink-0"
                style="background-color: {event.color || '#383838'};"
                on:click={() => (selectedBanner = event)}
                on:keydown={(e) =>
                  (e.key === "Enter" || e.key === " ") &&
                  (selectedBanner = event)}
              >
                <div class="absolute top-0 right-0 bottom-0 w-[200px] z-0">
                  <Image
                    id={event.icon || event.id}
                    variant="event-icon"
                    className="w-full h-full  object-cover"
                    style="
                      object-position: right {event.iconPosition || 50}%;
                      -webkit-mask-image: linear-gradient(to right, transparent 0%, black 50%);
                      mask-image: linear-gradient(to right, transparent 0%, black 50%);
                    "
                  />
                </div>

                <div
                  class="absolute inset-0 z-10 rounded-lg"
                  style="background: linear-gradient(90deg, {event.color ||
                    '#383838'} 35%, {event.color ||
                    '#383838'}D9 55%, transparent 100%);"
                ></div>

                <div
                  class="absolute inset-0 z-10 bg-gradient-to-r from-black/60 via-black/20 to-transparent pointer-events-none"
                ></div>

                <div
                  class="relative z-20 flex-1 min-w-0 px-4 py-2 pointer-events-none flex flex-col justify-center gap-1"
                >
                  <div class="flex">
                    {#if event.badge}
                      <div
                        class="flex items-center gap-1.5 rounded px-1.5 py-0.5 text-white w-fit"
                      >
                        <Icon
                          name={event.badge.icon}
                          class="w-3.5 h-3.5 opacity-90"
                        />
                      </div>
                    {/if}

                    <div
                      class="font-bold text-[13px] text-white truncate w-full drop-shadow-md"
                    >
                      {$t(event.title) || event.title}
                    </div>
                  </div>
                  {#if event.displayEndTime && event.type !== "inGamePermanent"}
                    {@const diff = parseWithServerOffset(event.displayEndTime) - now}
                    {@const daysLeft = Math.floor(diff / (1000 * 60 * 60 * 24))}
                    {@const isEndingSoon = daysLeft <= 3 && daysLeft >= 0}

                    <div
                      class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/40 backdrop-blur-md border {isEndingSoon
                        ? 'border-orange-500/50'
                        : 'border-white/20'} rounded-full shadow-md w-fit"
                    >
                      <span
                        class="w-1.5 h-1.5 rounded-full {isEndingSoon
                          ? 'bg-orange-500 shadow-[0_0_4px_#fb923c]'
                          : 'bg-green-400 shadow-[0_0_4px_#4ade80]'} animate-pulse"
                      ></span>
                      <span
                        class="text-[10px] font-bold {isEndingSoon
                          ? 'text-orange-300'
                          : 'text-white'} font-nums leading-none"
                      >
                        {formatTimeLeft(event.displayEndTime)}
                      </span>
                    </div>
                  {/if}
                </div>
              </div>
            {/each}
          {/if}
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-6 lg:col-span-1 w-full">
      <div
        class="bg-white/80 dark:bg-[#383838]/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-100 dark:border-[#444444] overflow-hidden flex flex-col h-[400px] w-full"
      >
        <div
          class="flex items-center gap-2 bg-white border-b border-gray-200 dark:border-[#444444] dark:bg-[#424242] py-3 px-4 text-xs font-bold text-gray-700 dark:text-[#FDFDFD]"
        >
          <div class="w-1/3">{$t("home.promocodes")}</div>
          <div class="flex-1 opacity-0 md:opacity-100">
            {$t("home.rewards")}
          </div>
          <div
            class="w-auto text-right whitespace-nowrap opacity-0 md:opacity-100"
          >
            {$t("home.duration")}
          </div>
        </div>

        <div class="overflow-y-auto custom-scrollbar flex-1 p-2">
          {#if activePromocodes.length === 0}
            <div
              class="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-[#7A7A7A]"
            >
              <div class="mb-3 opacity-60">
                <Icon name="noData" class="w-10 h-10" />
              </div>
              <div class="text-sm font-medium">{$t("home.noActiveCodes")}</div>
            </div>
          {:else}
            {#each activePromocodes as promo}
              <div
                class="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 py-3 px-3 border-b border-gray-50 dark:border-[#444444]/30 last:border-0 hover:bg-gray-50 hover:dark:bg-[#343434] transition-colors rounded-lg group"
              >
                <div class="w-full md:w-auto md:max-w-[50%] shrink-0">
                  <div class="flex items-center gap-1.5">
                    <div class="min-w-0 shrink-1">
                      {#if promo.url}
                        <a
                          href={promo.url}
                          target="_blank"
                          class="block font-mono font-bold text-sm text-[#21272C] dark:text-white hover:text-[#FACC15] transition-colors whitespace-nowrap underline decoration-gray-300 underline-offset-2 hover:decoration-[#FACC15]"
                          >{promo.code}</a
                        >
                      {:else}
                        <span
                          class="block font-mono font-bold text-sm text-[#21272C] dark:text-[#FDFDFD] whitespace-nowrap select-all"
                          >{promo.code}</span
                        >
                      {/if}
                    </div>
                    <button
                      on:click={() => copyCode(promo.code)}
                      class="flex items-center justify-center p-1.5 rounded-md hover:bg-gray-200 hover:dark:bg-[#373737] text-gray-400 hover:text-[#21272C] hover:dark:text-[#B7B6B3] transition-colors shrink-0"
                    >
                      {#if copiedCode === promo.code}
                        <Icon name="success" class="w-3.5 h-3.5 text-yellow-400" />
                      {:else}
                        <Icon name="copy" class="w-3.5 h-3.5" />
                      {/if}
                    </button>
                    {#if promo.condition}
                      <Tooltip text={$t(promo.condition)}>
                        <div
                          class="text-[#FACC15] hover:text-yellow-600 transition-colors flex items-center justify-center p-1 shrink-0"
                        >
                          <Icon name="info" class="w-3.5 h-3.5" />
                        </div>
                      </Tooltip>
                    {/if}
                  </div>
                </div>

                <div
                  class="flex-1 flex flex-wrap gap-1.5 items-center min-w-0 py-1 md:py-0"
                >
                  {#each sortRewards(promo.rewards) as reward}
                    <Tooltip text={$t(`items.${reward.id}`)}>
                      <div
                        class="flex items-center rounded-full px-2 py-0.5 border text-[11px] transition-colors {getRarityStyle(
                          reward.id,
                        )}"
                      >
                        <span class="font-bold mr-1">{reward.count}</span>
                        <Image
                          id={reward.id}
                          variant="item"
                          size={16}
                          className="object-contain"
                        />
                      </div>
                    </Tooltip>
                  {/each}
                </div>

                <div
                  class="w-full md:w-auto text-left md:text-right shrink-0 md:pl-2 flex flex-row md:flex-col items-center md:items-end justify-start md:justify-center gap-2 md:gap-0 mt-1 md:mt-0"
                >
                  {#if promo.displayEndTime === null}
                    <Tooltip text={$t("timer.permanent")}>
                      <div
                        class="flex items-center justify-center p-1 text-gray-400 hover:text-[#FACC15] transition-colors"
                      >
                        <Icon name="permanent" class="w-3.5 h-3.5" />
                      </div>
                    </Tooltip>
                  {:else if promo.displayEndTime === "N/A"}
                    <Tooltip text={$t("global.noData")}>
                      <div
                        class="text-[10px] font-bold text-gray-400 hover:text-[#FACC15] transition-colors cursor-default p-1"
                      >
                        N/A
                      </div>
                    </Tooltip>
                  {:else}
                    <span
                      class="text-[11px] font-bold text-gray-600 dark:text-[#E0E0E0] whitespace-nowrap leading-tight"
                      >{getFormattedDate(promo.displayEndTime)}
                    </span>
                    <span
                      class="text-[9px] font-medium text-gray-400 dark:text-[#9CA3AF] whitespace-nowrap leading-tight"
                      >{getPromoTimeLabel(promo.displayEndTime)}
                    </span>
                  {/if}
                </div>
              </div>
            {/each}
          {/if}
        </div>
      </div>
      <div class="grid gap-3">
        <a
          href="https://discord.gg/nqfuaRbWWn"
          target="_blank"
          rel="noreferrer"
          class="w-full min-h-[60px] flex items-center justify-between p-4 bg-[#5865F2] hover:bg-[#4752C4] hover:border-white hover:border text-white rounded-xl shadow-sm transition-colors group"
        >
          <div class="flex items-center gap-3">
            <Icon name="discord" class="w-6 h-6" />
            <span class="font-bold text-sm">{$t("home.discordJoin")}</span>
          </div>
          <Icon
            name="sendToLink"
            class="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity"
          />
        </a>

        <a
          href="https://goyfield-developers.github.io/"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center justify-between p-3 bg-white dark:bg-[#383838] rounded-xl border border-gray-100 dark:border-[#444444] shadow-sm hover:border-[#FACC15] dark:hover:border-[#FACC15] transition-all group"
        >
          <div class="flex items-center gap-3">
            <div
              class="rounded-lg overflow-hidden shrink-0 flex items-center justify-center"
            >
              <img
                src="/logo-goyfield-dev.png"
                class="w-10 h-10 object-contain"
                alt="Dev Docs"
              />
            </div>
            <div class="flex flex-col min-w-0">
              <span
                class="font-bold text-sm text-[#21272C] dark:text-[#FDFDFD] group-hover:text-[#FACC15] transition-colors truncate"
              >
                {$t("home.docsTitle")}
              </span>
              <span class="text-xs text-gray-400 truncate">
                {$t("home.docsAuthor")}
              </span>
            </div>
          </div>
          <Icon
            name="sendToLink"
            class="w-4 h-4 text-gray-400 group-hover:text-[#FACC15] transition-colors shrink-0"
          />
        </a>

        <button
          on:click={() => (isSupportOpen = true)}
          class="w-full flex items-center justify-between p-3 bg-white dark:bg-[#383838] border border-gray-100 dark:border-[#444444] hover:border-amber-400 dark:hover:border-amber-500 rounded-xl shadow-sm transition-colors group"
        >
          <div class="flex items-center gap-2">
            <Image
              id="origeometry"
              variant="item"
              size={32}
              className="object-contain"
            />
            <span
              class="font-bold text-sm text-[#21272C] dark:text-[#FDFDFD] group-hover:text-[#FACC15]"
              >{$t("footer.supportProject")}</span
            >
          </div>
        </button>

        <div class="flex mt-2">
          <div
            class="w-[2px] shrink-0 bg-gray-200 dark:bg-[#B7B6B3] rounded-full"
          ></div>
          <div
            class="text-[11px] text-gray-400 dark:text-[#B7B6B3] text-justify leading-relaxed pl-3"
          >
            {$t("home.disclaimer")}
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="w-full flex justify-center mb-8 mt-4">
    <Button
      onClick={() => goto("/records")}
      variant="yellow"
      className="px-10 py-3 text-sm shadow-xl font-nums w-auto min-w-[200px] max-w-[400px] whitespace-nowrap justify-center"
    >
      <div slot="icon">
        <Icon name="arrowRight" style="width: 24px; height: 24px;" />
      </div>
      {$t("home.go_to_tracker")}
    </Button>
  </div>
</div>

<BannerModal banner={selectedBanner} on:close={() => (selectedBanner = null)} />

<SupportModal isOpen={isSupportOpen} on:close={() => (isSupportOpen = false)} />
