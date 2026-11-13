<script lang="ts">
    import { browser } from "$app/environment";
    import { goto } from "$app/navigation";
    import { t } from "$lib/i18n";
    import { currentLocale } from "$lib/stores/locale";
    import Icon from "$lib/components/Icon.svelte";
    import Image from "$lib/components/Image.svelte";
    import SwitchButton from "$lib/components/SwitchButton.svelte";
    import { closeItemModal, openItemModal, selectedItemId } from "$lib/stores/itemModal";
    import { closeBannerModal, openBannerModal, activeBannerModalData } from "$lib/stores/bannerModal";
    import { closeSearchModal, isSearchModalOpen } from "$lib/stores/searchModal";
    import { scrollHorizontalPeek } from "$lib/utils/autoScroll";
    import { getRarityColor } from "$lib/utils/colorUtils";
    import {
        CATEGORY_ICONS,
        CATEGORY_LABELS,
        ensureDescriptionsLoaded,
        getAchievementName,
        performSearch,
        type SearchCategory,
        type SearchResponse,
        type SearchResult
    } from "$lib/utils/searchEngine";
    import { onDestroy, tick } from "svelte";

    let searchQuery = "";
    let selectedCategory: SearchCategory = "all";
    let selectedIndex = -1;
    let inputEl: HTMLInputElement | null = null;
    let listEl: HTMLDivElement | null = null;
    let categoryContainer: HTMLElement | null = null;
    let recentItems: SearchResult[] = [];
    let isAdvancedSearch = false;
    let loadedLocale = "";
    let prevSearchModalOpen = false;

    const PAGE_SIZE = 20;
    let displayLimit = PAGE_SIZE;
    let prevQuery = "";
    let prevCategory: SearchCategory = "all";

    if (browser) {
        try {
            isAdvancedSearch = localStorage.getItem("goyfield_advanced_search") === "true";
        } catch {}
    }

    function handleAdvancedToggle(): void {
        if (browser) {
            try {
                localStorage.setItem("goyfield_advanced_search", String(isAdvancedSearch));
            } catch {}
        }
        if (isAdvancedSearch) {
            ensureDescriptionsLoaded($currentLocale).then(() => {
                loadedLocale = $currentLocale;
            });
        }
    }

    function handleLoadMore(): void {
        displayLimit += PAGE_SIZE;
    }

    const categories: SearchCategory[] = [
        "all",
        "operators",
        "weapons",
        "equipment",
        "items",
        "enemies",
        "recipes",
        "food",
        "achievements",
        "events",
        "banners"
    ];

    function loadRecentItems(): void {
        if (!browser) return;
        try {
            const raw = localStorage.getItem("goyfield_recent_searches");
            if (raw) {
                recentItems = JSON.parse(raw);
            }
        } catch {
            recentItems = [];
        }
    }

    function saveToRecent(item: SearchResult): void {
        if (!browser) return;
        try {
            const filtered = recentItems.filter(r => !(r.id === item.id && r.category === item.category));
            recentItems = [item, ...filtered].slice(0, 6);
            localStorage.setItem("goyfield_recent_searches", JSON.stringify(recentItems));
        } catch {}
    }

    function clearRecent(): void {
        if (!browser) return;
        recentItems = [];
        localStorage.removeItem("goyfield_recent_searches");
    }

    $: if (browser) {
        if ($isSearchModalOpen && !prevSearchModalOpen) {
            loadRecentItems();
            searchQuery = "";
            selectedIndex = -1;
            document.body.style.overflow = "hidden";
            tick().then(() => {
                inputEl?.focus();
            });
        } else if (!$isSearchModalOpen && prevSearchModalOpen) {
            document.body.style.overflow = "";
        }
        prevSearchModalOpen = $isSearchModalOpen;
    }

    onDestroy(() => {
        if (browser) {
            document.body.style.overflow = "";
        }
    });

    $: if (searchQuery !== prevQuery || selectedCategory !== prevCategory) {
        prevQuery = searchQuery;
        prevCategory = selectedCategory;
        displayLimit = PAGE_SIZE;
        selectedIndex = -1;
    }

    $: if (isAdvancedSearch && $currentLocale) {
        ensureDescriptionsLoaded($currentLocale).then(() => {
            loadedLocale = $currentLocale;
        });
    }

    $: searchResponse = (loadedLocale || true)
        ? performSearch(searchQuery, selectedCategory, $t, displayLimit, $currentLocale, isAdvancedSearch)
        : performSearch(searchQuery, selectedCategory, $t, displayLimit, $currentLocale, isAdvancedSearch);
    $: results = searchResponse.results;
    $: hasMore = searchResponse.hasMore;

    let wasChildModalOpen = false;
    $: {
        const isChildModalOpen = !!($selectedItemId || $activeBannerModalData);
        if (wasChildModalOpen && !isChildModalOpen && $isSearchModalOpen && browser) {
            tick().then(() => {
                inputEl?.focus();
            });
        }
        wasChildModalOpen = isChildModalOpen;
    }

    function handleKeydown(e: KeyboardEvent): void {
        if (!$isSearchModalOpen) return;
        if ($selectedItemId || $activeBannerModalData) return;

        if (e.key === "Escape") {
            e.preventDefault();
            closeSearchModal();
            return;
        }

        const currentList = searchQuery ? results : recentItems;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            if (currentList.length > 0) {
                selectedIndex = selectedIndex < 0 ? 0 : (selectedIndex + 1) % currentList.length;
                scrollToSelected();
            }
            return;
        }

        if (e.key === "ArrowUp") {
            e.preventDefault();
            if (currentList.length > 0) {
                selectedIndex = selectedIndex <= 0 ? currentList.length - 1 : selectedIndex - 1;
                scrollToSelected();
            }
            return;
        }

        if (e.key === "Enter") {
            e.preventDefault();
            const target = selectedIndex >= 0 ? currentList[selectedIndex] : currentList[0];
            if (target) {
                selectItem(target);
            }
        }
    }

    function scrollToSelected(): void {
        tick().then(() => {
            if (!listEl || selectedIndex < 0) return;
            const activeEl = listEl.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement | null;
            if (activeEl) {
                activeEl.scrollIntoView({ block: "nearest" });
            }
        });
    }

    function handleBackdropClick(): void {
        if ($selectedItemId) {
            closeItemModal();
            return;
        }
        if ($activeBannerModalData) {
            closeBannerModal();
            return;
        }
        closeSearchModal();
    }

    function selectItem(item: SearchResult): void {
        saveToRecent(item);

        if (item.bannerData) {
            openBannerModal(item.bannerData);
        } else if (item.isItemModal) {
            openItemModal(item.id);
        } else {
            closeSearchModal();
            if (browser) {
                document.body.style.overflow = "";
            }
            const targetUrl = item.category === "achievements" ? `/achievements?id=${item.id}` : item.url;
            if (item.category === "achievements" && browser) {
                window.dispatchEvent(new CustomEvent("focus-achievement", { detail: { id: item.id } }));
            }
            if (targetUrl) {
                goto(targetUrl, { noScroll: true });
            }
        }
    }

    function setCategory(cat: SearchCategory): void {
        selectedCategory = cat;
        selectedIndex = -1;
        scrollHorizontalPeek(categoryContainer, `[data-category-id="${cat}"]`);
        tick().then(() => {
            inputEl?.focus();
        });
    }

    let targetScrollLeft: number | null = null;
    let isScrollAnimating = false;

    function handleCategoryPointerDown(): void {
        targetScrollLeft = null;
        isScrollAnimating = false;
    }

    function handleCategoryScroll(): void {
        if (!isScrollAnimating) {
            targetScrollLeft = null;
        }
    }

    function handleCategoryWheel(e: WheelEvent): void {
        if (!categoryContainer || e.deltaY === 0) return;
        e.preventDefault();

        const current = categoryContainer.scrollLeft;
        if (targetScrollLeft === null || Math.abs(current - targetScrollLeft) > 200) {
            targetScrollLeft = current;
        }

        const maxScroll = categoryContainer.scrollWidth - categoryContainer.clientWidth;
        targetScrollLeft = Math.max(0, Math.min(targetScrollLeft + e.deltaY, maxScroll));

        if (!isScrollAnimating) {
            isScrollAnimating = true;
            requestAnimationFrame(smoothWheelScroll);
        }
    }

    function smoothWheelScroll(): void {
        if (!categoryContainer || targetScrollLeft === null || !isScrollAnimating) {
            isScrollAnimating = false;
            targetScrollLeft = null;
            return;
        }

        const distance = targetScrollLeft - categoryContainer.scrollLeft;

        if (Math.abs(distance) < 1.5) {
            categoryContainer.scrollLeft = targetScrollLeft;
            targetScrollLeft = null;
            isScrollAnimating = false;
            return;
        }

        const prev = categoryContainer.scrollLeft;
        categoryContainer.scrollLeft += distance * 0.25;

        if (categoryContainer.scrollLeft === prev || Math.abs(categoryContainer.scrollLeft - prev) < 0.2) {
            targetScrollLeft = null;
            isScrollAnimating = false;
            return;
        }

        requestAnimationFrame(smoothWheelScroll);
    }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if $isSearchModalOpen}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        class="fixed inset-0 md:ml-[var(--sb-w)] z-[100002] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-16 md:pt-24 px-3 md:px-4"
        on:click|self={handleBackdropClick}
    >
        <div
            class="w-full max-w-2xl bg-white dark:bg-[#252525] border border-gray-200 dark:border-[#3F3F3F] rounded-2xl shadow-2xl flex flex-col max-h-[82vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
            tabindex="-1"
        >
            <div class="p-3 md:p-4 border-b border-gray-200 dark:border-[#383838] flex items-center gap-3">
                <div class="text-gray-400 dark:text-gray-500 shrink-0">
                    <Icon name="search" class="w-5 h-5" />
                </div>
                <input
                    bind:this={inputEl}
                    bind:value={searchQuery}
                    type="text"
                    placeholder={$t("achievements.searchPlaceholder")}
                    class="w-full bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-base md:text-lg font-medium"
                />
                {#if searchQuery}
                    <button
                        type="button"
                        class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        on:click={() => {
                            searchQuery = "";
                            inputEl?.focus();
                        }}
                    >
                        ✕
                    </button>
                {/if}
            </div>

            <div
                bind:this={categoryContainer}
                on:wheel={handleCategoryWheel}
                on:pointerdown={handleCategoryPointerDown}
                on:scroll={handleCategoryScroll}
                class="px-2 pt-2 md:pb-1 pb-2 border-b border-gray-100 dark:border-[#323232] bg-gray-50/50 dark:bg-[#202020]/50 overflow-x-auto scrollbar-none flex gap-1.5 shrink-0"
            >
                {#each categories as cat}
                    <button
                        type="button"
                        data-category-id={cat}
                        class="px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 {selectedCategory === cat ? 'bg-[#FFE145] text-black shadow-sm' : 'bg-gray-100 dark:bg-[#303030] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#3a3a3a]'}"
                        on:click={() => setCategory(cat)}
                    >
                        <Icon name={CATEGORY_ICONS[cat]} class="w-3.5 h-3.5" />
                        <span>{$t(CATEGORY_LABELS[cat])}</span>
                    </button>
                {/each}
            </div>

            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
                bind:this={listEl}
                on:mouseleave={() => (selectedIndex = -1)}
                class="flex-1 overflow-y-auto py-2 md:py-3 pl-2 md:pl-3 pr-1 flex flex-col gap-1"
            >
                {#if searchQuery}
                    {#if results.length > 0}
                        {#each results as item, index}
                            <button
                                type="button"
                                data-index={index}
                                class="w-full text-left p-2.5 rounded-xl flex items-center justify-between gap-3 transition-colors {selectedIndex === index ? 'bg-[#FFE145]/15 dark:bg-[#FFE145]/10 border border-[#FFE145]/60 text-gray-900 dark:text-white shadow-sm' : 'hover:bg-gray-100/70 dark:hover:bg-[#2f2f2f] text-gray-800 dark:text-gray-200 border border-transparent'}"
                                on:click={() => selectItem(item)}
                                on:mouseenter={() => (selectedIndex = index)}
                            >
                                <div class="flex items-center gap-3 min-w-0">
                                    <div class="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#323232] border border-gray-200 dark:border-[#404040] flex items-center justify-center shrink-0 overflow-hidden">
                                        {#if item.iconId}
                                            <Image id={item.iconId} variant={item.imageVariant || "operator-icon"} width={40} height={40} className="w-full h-full object-cover" />
                                        {:else}
                                            <Icon name={CATEGORY_ICONS[item.category]} class="w-5 h-5 text-gray-400" />
                                        {/if}
                                    </div>

                                    <div class="min-w-0 flex flex-col justify-center">
                                        <div class="font-semibold text-sm truncate flex items-center gap-2">
                                            <span>{@html item.highlightedTitle || item.displayTitle}</span>
                                            {#if item.rarity}
                                                {@const color = getRarityColor(item.rarity)}
                                                <span
                                                    class="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 rounded border shrink-0"
                                                    style="color: {color}; border-color: {color}40; background-color: {color}15;"
                                                >
                                                    <span>{item.rarity}</span>
                                                    <Icon name="star" class="w-2.5 h-2.5 fill-current" />
                                                </span>
                                            {/if}
                                            {#if item.badge}
                                                <span class="text-[10px] font-bold px-1.5 rounded bg-gray-100 dark:bg-[#343434] text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-[#444] shrink-0">
                                                    {item.badge}
                                                </span>
                                            {/if}
                                        </div>
                                        {#if item.matchedSnippet}
                                            <div class="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                                                {@html item.matchedSnippet}
                                            </div>
                                        {/if}
                                    </div>
                                </div>

                                <div class="shrink-0 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                                    <span class="px-2 py-0.5 rounded bg-gray-100 dark:bg-[#323232] border border-gray-200 dark:border-[#404040]">
                                        {$t(item.categoryLabelKey)}
                                    </span>
                                </div>
                            </button>
                        {/each}

                        {#if hasMore}
                            <div class="pt-2 pb-1 flex justify-center">
                                <button
                                    type="button"
                                    class="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-[#323232] dark:hover:bg-[#3d3d3d] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#404040] transition-colors"
                                    on:click={handleLoadMore}
                                >
                                    {$t("loadMore")}
                                </button>
                            </div>
                        {/if}
                    {:else}
                        <div class="py-12 text-center text-gray-400 dark:text-gray-500 text-sm">
                            {$t("emptyState.noData")}
                        </div>
                    {/if}
                {:else if recentItems.length > 0}
                    <div class="px-2 py-1.5 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                        <span class="font-medium">{$t("page.banner.recent")}</span>
                        <button type="button" class="hover:underline" on:click={clearRecent}>
                            {$t("settings.account.clear")}
                        </button>
                    </div>

                    {#each recentItems as item, index}
                        {@const itemTitle = (item.titleKey ? $t(item.titleKey) : "") || (item.category === "achievements" ? getAchievementName($currentLocale, item.id) : "") || item.displayTitle || item.staticName || item.id}
                        <button
                            type="button"
                            data-index={index}
                            class="w-full text-left p-2.5 rounded-xl flex items-center justify-between gap-3 transition-colors {selectedIndex === index ? 'bg-[#FFE145]/15 dark:bg-[#FFE145]/10 border border-[#FFE145]/60 text-gray-900 dark:text-white shadow-sm' : 'hover:bg-gray-100/70 dark:hover:bg-[#2f2f2f] text-gray-800 dark:text-gray-200 border border-transparent'}"
                            on:click={() => selectItem(item)}
                            on:mouseenter={() => (selectedIndex = index)}
                        >
                            <div class="flex items-center gap-3 min-w-0">
                                <div class="w-9 h-9 rounded-lg bg-gray-100 dark:bg-[#323232] border border-gray-200 dark:border-[#404040] flex items-center justify-center shrink-0 overflow-hidden">
                                    {#if item.iconId}
                                        <Image id={item.iconId} variant={item.imageVariant || "operator-icon"} width={36} height={36} className="w-full h-full object-cover" />
                                    {:else}
                                        <Icon name={CATEGORY_ICONS[item.category]} class="w-4 h-4 text-gray-400" />
                                    {/if}
                                </div>
                                <div class="min-w-0 flex flex-col justify-center">
                                    <div class="font-semibold text-sm truncate flex items-center gap-2">
                                        <span>{itemTitle}</span>
                                        {#if item.rarity}
                                            {@const color = getRarityColor(item.rarity)}
                                            <span
                                                class="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 rounded border shrink-0"
                                                style="color: {color}; border-color: {color}40; background-color: {color}15;"
                                            >
                                                <span>{item.rarity}</span>
                                                <Icon name="star" class="w-2.5 h-2.5 fill-current" />
                                            </span>
                                        {/if}
                                        {#if item.badge}
                                            <span class="text-[10px] font-bold px-1.5 rounded bg-gray-100 dark:bg-[#343434] text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-[#444] shrink-0">
                                                {item.badge}
                                            </span>
                                        {/if}
                                    </div>
                                </div>
                            </div>

                            <span class="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-[#323232] border border-gray-200 dark:border-[#404040] text-gray-400 dark:text-gray-500">
                                {$t(item.categoryLabelKey)}
                            </span>
                        </button>
                    {/each}
                {:else}
                    <div class="py-10 flex flex-col items-center justify-center select-none pointer-events-none">
                        <Image
                            id="sns_sticker_03/sns_sticker_03_11"
                            variant="sticker"
                            size={110}
                            className="object-contain"
                        />
                    </div>
                {/if}
            </div>

            <div class="px-4 py-2 border-t border-gray-100 dark:border-[#323232] bg-gray-50 dark:bg-[#202020] text-xs text-gray-400 dark:text-gray-500 flex items-center justify-between gap-3">
                <div class="hidden md:flex items-center gap-1">
                    <span><kbd class="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-[#343434] font-mono text-[11px]">↑↓</kbd></span>
                    <span><kbd class="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-[#343434] font-mono text-[11px]">↵</kbd> {$t("import.select_token")}</span>
                </div>
                <div class="flex items-center gap-4 ml-auto">
                    <label class="flex items-center gap-2 cursor-pointer select-none text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
                        <span>{$t("advancedSearch")}</span>
                        <SwitchButton bind:isActive={isAdvancedSearch} on:change={handleAdvancedToggle} />
                    </label>
                    <span class="hidden md:inline-flex items-center gap-1.5">
                        <kbd class="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-[#343434] font-mono text-[11px]">ESC</kbd>
                        {$t("privacy.close")}
                    </span>
                </div>
            </div>
        </div>
    </div>
{/if}
