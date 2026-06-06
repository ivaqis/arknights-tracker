<script>
    import "../app.css";
    import { onMount, onDestroy } from "svelte";
    import { pullData } from "$lib/stores/pulls";
    import { accountStore } from "$lib/stores/accounts";
    import { syncStatus, user, initAuth, checkSync, justSynced } from "$lib/stores/cloudStore";
    import { t } from "$lib/i18n";
    import { fly } from "svelte/transition";
    import { page } from "$app/stores";
    import { fade } from "svelte/transition";
    import { isDarkMode } from "$lib/stores/theme";
    import { browser } from "$app/environment";
    import { currentLocale } from "$lib/stores/locale";
    import { isI18nReady } from "$lib/i18n";
    import { notifications, addNotification, removeNotification } from "$lib/stores";
    import { cubicOut } from "svelte/easing";

    import CookieConsent from "$lib/components/CookieConsent.svelte";
    import LanguageSelect from "$lib/components/LanguageSelect.svelte";
    import Icon from "$lib/components/Icons.svelte";
    import ThemeSwitch from "$lib/components/ThemeSwitch.svelte";
    import SyncModal from "$lib/components/SyncModal.svelte";
    import PrivacyModal from "$lib/components/PrivacyModal.svelte";
    import Button from "$lib/components/Button.svelte";

    let isDonateModalOpen = false;
    let isMobileMenuOpen = false;
    let isPrivacyModalOpen = false;
    let isCollapsed = browser
        ? localStorage.getItem("sidebarCollapsed") === "true"
        : false;
    let ready = false;

    let prevStatus = null;

    $: if ($justSynced) {
        addNotification("success", $t("settings.cloud.sync_toast"));
        justSynced.set(false);
    }

    $: if (browser) {
        if (isMobileMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
    }

    onMount(() => {
        if (browser) {
            isI18nReady.subscribe((isReady) => {
                if (isReady) {
                    document.body.style.opacity = "1";
                }
            });

            setTimeout(() => {
                ready = true;
                const splash = document.getElementById("app-splash-screen");
                if (splash) {
                    splash.style.opacity = "0";
                    setTimeout(() => {
                        splash.remove();
                    }, 500);
                }
            }, 100);

            initAuth();

            if (sessionStorage.getItem("show_sync_toast")) {
                sessionStorage.removeItem("show_sync_toast");
                justSynced.set(true);
            }
        }
    });

    $: if ($page.url.pathname) {
        isMobileMenuOpen = false;
    }
    $: isCurrent = (path) => $page.url.pathname.startsWith(path);
    $: visuallyCollapsed = isCollapsed && !isMobileMenuOpen;

    function handleKeydown(e) {
        if (e.key === "Escape") {
            isMobileMenuOpen = false;
        }
    }

    function setSidebarState(collapsed) {
        isCollapsed = collapsed;
        if (browser) {
            localStorage.setItem("sidebarCollapsed", String(collapsed));
            document.documentElement.style.setProperty(
                "--sb-w",
                collapsed ? "5rem" : "16rem",
            );
            if (collapsed) {
                document.documentElement.classList.add("sidebar-closed");
            } else {
                document.documentElement.classList.remove("sidebar-closed");
            }
        }
    }

    function toggleCollapse() {
        setSidebarState(!isCollapsed);
    }

    function toggleThemeSmall() {
        $isDarkMode = !$isDarkMode;
    }

    $: if (browser) {
        if ($isDarkMode) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }
</script>

<svelte:head>
    <title>{$t("seo.title")}</title>
    <meta name="description" content={$t("seo.description")} />
    <meta name="keywords" content={$t("seo.keywords")} />
    <meta property="og:title" content={$t("seo.title")} />
    <meta property="og:description" content={$t("seo.description")} />
    <meta
        property="og:image"
        content="https://goyfield.moe/images/og-image.jpg"
    />
    <link rel="manifest" href="/site.webmanifest" />
    <link rel="shortcut icon" href="/favicon.ico" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <meta name="apple-mobile-web-app-title" content="Goyfield.moe" />
    <link
        rel="icon"
        type="image/png"
        sizes="192x192"
        href="/android-chrome-192x192.png"
    />

    <link
        rel="icon"
        type="image/png"
        sizes="512x512"
        href="/android-chrome-512x512.png"
    />
    <script>
        let w = "16rem";
        let isCol = false;
        try {
            if (localStorage.getItem("sidebarCollapsed") === "true") {
                w = "5rem";
                isCol = true;
            }
        } catch (e) {}
        document.documentElement.style.setProperty("--sb-w", w);
        if (isCol) document.documentElement.classList.add("sidebar-closed");
        else document.documentElement.classList.remove("sidebar-closed");
    </script>
</svelte:head>
{#if $isI18nReady}
    {#if $user}
        <SyncModal />
    {/if}

    <div class="flex min-h-screen bg-base">
        {#if isMobileMenuOpen}
            <button
                class="fixed inset-0 bg-black/60 z-[9999] md:hidden backdrop-blur-sm cursor-pointer w-full h-full border-none p-0 m-0 outline-none block"
                aria-label="Close menu"
                on:click={() => (isMobileMenuOpen = false)}
            ></button>
        {/if}

        <div class="md:hidden fixed top-4 right-4 z-[10001]">
            <button
                aria-label="Toggle menu"
                on:click|stopPropagation={() =>
                    (isMobileMenuOpen = !isMobileMenuOpen)}
                class="p-2 bg-base text-primary border border-line rounded-lg shadow-md"
            >
                <Icon name="toggleManu" class="w-6 h-6" />
            </button>
        </div>

        <aside
            class="
            fixed top-0 bottom-0 left-0 h-full
            bg-white dark:bg-[#343434] dark:border-[#3F3F3F] border-r border-gray-100
            flex flex-col justify-between
            py-8
            z-[10000] shadow-2xl md:shadow-none
            
            {ready ? 'transition-all duration-300 ease-in-out' : ''}

            {isMobileMenuOpen
                ? 'translate-x-0 w-64'
                : '-translate-x-full md:translate-x-0'}
            
            md:w-[var(--sb-w)]
        "
        >
            <div
                class="mb-5 flex items-center min-h-[40px] px-4 {visuallyCollapsed
                    ? 'justify-center'
                    : 'justify-between'}"
            >
                {#if !visuallyCollapsed}
                    <div class="pr-1">
                        <h1
                            class="font-black text-2xl tracking-tighter text-gray-900 dark:text-white leading-none"
                        >
                            <a
                                href="/"
                                class="block hover:opacity-80 transition-opacity"
                            >
                                <Icon name="siteLogo" class="w-full h-auto" />
                            </a>
                        </h1>
                    </div>
                {/if}

                <button
                    on:click={toggleCollapse}
                    class="hidden md:flex items-center justify-center w-8 h-8 rounded text-gray-400 dark:text-gray-500 group flex-shrink-0 hover:dark:text-[#FFE145] hover:text-[#FFE145] duration-200"
                    aria-label={isCollapsed
                        ? "Expand Sidebar"
                        : "Collapse Sidebar"}
                >
                    {#if isCollapsed}
                        <Icon name="toggleManu" class="w-6 h-6" />
                    {:else}
                        <Icon name="doubleArrowsLeft" class="w-6 h-6" />
                    {/if}
                </button>
            </div>
            <div class="flex-1 overflow-y-auto overflow-x-hidden">
                <nav class="flex flex-col gap-2 px-3">
                    {#each [
                        { path: "/", label: "sidebar.home", icon: "mainPage" },
                        { path: "/records", label: "sidebar.records", icon: "records" },
                        { path: "/events", label: "sidebar.events", icon: "timeline" },
                        { path: "/history", label: "pages.bannerHistory", icon: "history" },
                        { type: "divider" },
                        { path: "/changelog", label: "pages.changelog", icon: "changelog" },
                        { path: "/operators", label: "sidebar.operators", icon: "operators" },
                        { path: "/weapons", label: "pages.weapons", icon: "weapons" },
                        { path: "/essences", label: "pages.essences", icon: "essence" },
                        { path: "/enemies", label: "pages.enemies", icon: "hongshan" },
                        { path: "/equipment", label: "pages.equipment", icon: "edc" },
                        { path: "/recipes", label: "pages.recipes", icon: "recepies" },
                        { type: "divider" },
                        { path: "/settings", label: "sidebar.settings", icon: "settings" }
                    ] as item}
                        {#if item.type === "divider"}
                            <div
                                class="h-px bg-gray-200 dark:bg-[#444444] my-1 mx-2"
                            ></div>
                        {:else}
                            <a
                                href={item.path}
                                class="
                                flex items-center gap-3 py-3 rounded-lg group relative min-h-[48px]
                                {ready ? 'transition-all' : ''} 
                                
                                {visuallyCollapsed
                                    ? 'px-0 justify-center'
                                    : 'px-3'}

                                {isCurrent(item.path) &&
                                (item.path === '/'
                                    ? $page.url.pathname === '/'
                                    : true)
                                    ? 'bg-gray-200 dark:bg-[#424242] text-gray-900 dark:text-[#FDFDFD]'
                                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#373737]'}
                            "
                                title={visuallyCollapsed ? $t(item.label) : ""}
                            >
                                <div
                                    class="w-6 h-6 flex-shrink-0 flex justify-center items-center pointer-events-none {isCurrent(
                                        item.path,
                                    ) &&
                                    (item.path === '/'
                                        ? $page.url.pathname === '/'
                                        : true)
                                        ? 'text-gray-900 dark:text-white'
                                        : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200'}"
                                >
                                    <Icon
                                        name={item.icon}
                                        class="w-full h-full"
                                    />
                                </div>

                                {#if !visuallyCollapsed}
                                    <span
                                        class="
                                        text-lg leading-tight pr-2
                                        {isCurrent(item.path) &&
                                        (item.path === '/'
                                            ? $page.url.pathname === '/'
                                            : true)
                                            ? 'font-bold'
                                            : 'font-medium'}
                                    "
                                    >
                                        {$t(item.label)}
                                    </span>
                                {/if}

                                {#if isCurrent(item.path) && (item.path === "/" ? $page.url.pathname === "/" : true)}
                                    <div
                                        class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#FFE145] rounded-r"
                                    ></div>
                                {/if}
                            </a>
                        {/if}
                    {/each}
                </nav>
            </div>

            <div
                class="w-full mt-auto mb-1 flex flex-col items-center gap-6 px-4"
            >
                {#if !visuallyCollapsed}
                    <div class="w-full flex justify-center flex-col pt-2 gap-4">
                        <div class="w-full flex justify-center">
                            <ThemeSwitch />
                        </div>
                        <div class="w-full">
                            <LanguageSelect />
                        </div>
                    </div>
                {:else}
                    <button
                        on:click={toggleThemeSmall}
                        class="w-10 h-10 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#444] hover:text-[#FFE145] dark:hover:text-[#FFE145] transition-colors"
                        title={$isDarkMode
                            ? $t("sidebar.theme_light")
                            : $t("sidebar.theme_dark")}
                    >
                        {#if $isDarkMode}
                            <Icon name="moon" class="w-6 h-6" />
                        {:else}
                            <Icon name="sun" class="w-6 h-6" />
                        {/if}
                    </button>

                    <button
                        on:click={() => setSidebarState(false)}
                        class="w-10 h-10 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#444] hover:text-black dark:hover:text-white transition-colors"
                        title="Change Language"
                    >
                        <Icon name="globe" style="width:22px; height:22px;" />
                    </button>
                {/if}
            </div>
        </aside>

        {#if $notifications && $notifications.length > 0}
            <div class="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none select-none">
                {#each $notifications as notification (notification.id)}
                    <div
                        in:fly={{ x: 40, duration: 450, easing: cubicOut }}
                        out:fade={{ duration: 200 }}
                        class="pointer-events-auto flex items-center justify-between gap-3 bg-white dark:bg-[#2C2C2C] border shadow-[0_8px_30px_rgba(0,0,0,0.12)] rounded-xl px-4 py-3 transition-all
                            {notification.type === 'success' ? 'border-green-200/80 dark:border-green-900/30' : ''}
                            {notification.type === 'error' ? 'border-red-200/80 dark:border-red-900/30' : ''}
                            {notification.type === 'warning' ? 'border-amber-200/80 dark:border-amber-900/30' : ''}
                            {notification.type === 'info' ? 'border-blue-200/80 dark:border-blue-900/30' : ''}"
                    >
                        <div class="flex items-center gap-3 min-w-0">
                            {#if notification.type === 'success'}
                                <div class="flex-shrink-0 bg-green-50 dark:bg-green-950/40 p-1.5 rounded-full flex items-center justify-center">
                                    <Icon name="success" class="w-[15px] h-[15px] text-green-500" />
                                </div>
                            {:else if notification.type === 'error'}
                                <div class="flex-shrink-0 bg-red-50 dark:bg-red-950/40 p-1.5 rounded-full flex items-center justify-center">
                                    <Icon name="error" class="w-[15px] h-[15px] text-red-500" />
                                </div>
                            {:else if notification.type === 'warning'}
                                <div class="flex-shrink-0 bg-amber-50 dark:bg-amber-950/40 p-1.5 rounded-full flex items-center justify-center">
                                    <Icon name="warning" class="w-[15px] h-[15px] text-amber-500" />
                                </div>
                            {:else}
                                <div class="flex-shrink-0 bg-blue-50 dark:bg-blue-950/40 p-1.5 rounded-full flex items-center justify-center">
                                    <Icon name="info" class="w-[15px] h-[15px] text-blue-500" />
                                </div>
                            {/if}

                            <div class="flex flex-col min-w-0">
                                <span class="text-sm font-bold text-gray-800 dark:text-[#E4E4E4] leading-tight break-words">
                                    {notification.message}
                                    {#if notification.subtitle}
                                        <span class="ml-1.5 px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-md
                                            {notification.type === 'error' ? 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border border-red-200/40 dark:border-red-900/20' : ''}
                                            {notification.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400 border border-green-200/40 dark:border-green-900/20' : ''}
                                            {notification.type === 'warning' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200/40 dark:border-amber-900/20' : ''}
                                            {notification.type === 'info' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200/40 dark:border-blue-900/20' : ''}">
                                            {notification.subtitle}
                                        </span>
                                    {/if}
                                </span>
                            </div>
                        </div>

                        <button
                            on:click={() => removeNotification(notification.id)}
                            class="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors p-1 hover:bg-gray-100 dark:hover:bg-[#3E3E3E] rounded-md outline-none"
                            aria-label={$t("close") || "Close"}
                        >
                            <Icon name="close" class="w-3.5 h-3.5" />
                            <span class="hidden">{$t("close") || "Close"}</span>
                        </button>
                    </div>
                {/each}
            </div>
        {/if}

        <main
            class="
            w-full md:w-[calc(100%-var(--sb-w))] p-4 md:p-8 relative z-0
            ml-0
            {ready ? 'transition-all duration-300 ease-in-out' : ''}
            
            md:ml-[var(--sb-w)]
            flex flex-col min-h-screen
        "
        >
            <div class="flex-1">
                {#key $currentLocale}
                    <slot />
                {/key}
            </div>

            {#if $page.url.pathname !== "/"}
                <footer class="mt-20 w-full max-w-[1600px] z-10 pb-4">
                    <div
                        class="flex gap-3 mb-8 max-w-[550px] xl:max-w-[1600px]"
                    >
                        <div
                            class="w-[2px] shrink-0 bg-gray-400 dark:bg-gray-300 rounded-full"
                        ></div>
                        <p
                            class="text-sm text-gray-400 dark:text-[#B7B6B3] leading-snug"
                        >
                            {$t("home.disclaimer")}
                        </p>
                    </div>

                    <div
                        class="flex flex-col xl:flex-row xl:items-start gap-6 xl:gap-10"
                    >
                        <div class="flex flex-col gap-3 min-w-[180px]">
                            <span
                                class="text-gray-400 dark:text-[#B7B6B3] text-[15px] font-medium"
                            >
                                {$t("footer.devResources")}
                            </span>
                            <div class="flex items-center gap-4 mt-1">
                                <a
                                    href="https://discord.gg/nqfuaRbWWn "
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="text-[#21272C]/90 hover:opacity-70 dark:text-white/80 transition-opacity"
                                    title="Discord"
                                >
                                    <Icon
                                        name="discrodBig"
                                        class="h-[22px] w-auto"
                                    />
                                </a>
                                <a
                                    href="https://github.com/ivaqis/arknights-tracker"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="text-[#21272C]/90 hover:opacity-70 dark:text-white/80 transition-opacity"
                                    title="GitHub"
                                >
                                    <Icon
                                        name="gitHubBig"
                                        class="h-[22px] w-auto"
                                    />
                                </a>
                            </div>
                        </div>

                        <div
                            class="hidden xl:block w-px min-h-[60px] bg-gray-300 dark:bg-[#444444]"
                        ></div>

                        <div class="flex flex-col gap-3 min-w-[200px]">
                            <span
                                class="text-gray-400 dark:text-[#B7B6B3] text-[15px] font-medium"
                            >
                                {$t("footer.officialResources")}
                            </span>
                            <div class="flex items-center gap-4 mt-1">
                                <a
                                    href="https://x.com/AKEndfield"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="text-[#21272C]/90 hover:opacity-70 dark:text-white/80 transition-opacity"
                                    title="X (Twitter)"
                                >
                                    <Icon
                                        name="twitter"
                                        class="h-[22px] w-auto"
                                    />
                                </a>
                                <a
                                    href="https://www.skport.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="text-[#21272C]/90 hover:opacity-70 dark:text-white/80 transition-opacity"
                                    title="Skport"
                                >
                                    <Icon
                                        name="skport"
                                        class="h-[22px] w-auto"
                                    />
                                </a>
                                <a
                                    href="https://discord.gg/akendfield"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="text-[#21272C]/90 hover:opacity-70 dark:text-white/80 transition-opacity"
                                    title="Official Discord"
                                >
                                    <Icon
                                        name="discord"
                                        class="h-[22px] w-auto"
                                    />
                                </a>
                                <a
                                    href="https://www.youtube.com/@arknightsendfieldEN"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="text-[#21272C]/90 hover:opacity-70 dark:text-white/80 transition-opacity"
                                    title="Official YouTube"
                                >
                                    <Icon
                                        name="youtube"
                                        class="h-[22px] w-auto"
                                    />
                                </a>
                            </div>
                        </div>

                        <div
                            class="hidden xl:block w-px min-h-[60px] bg-gray-300 dark:bg-[#444444]"
                        ></div>

                        <div class="flex flex-col gap-3 min-w-[200px]">
                            <button
                                on:click={() => (isPrivacyModalOpen = true)}
                                class="text-left text-[15px] text-gray-400 dark:text-[#B7B6B3] hover:text-black dark:hover:text-white transition-colors"
                            >
                                {$t("footer.privacyPolicy")}
                            </button>
                            <button
                                on:click={() => (isDonateModalOpen = true)}
                                class="text-left text-[15px] text-[#F9B90C] hover:text-[#d9a009] dark:hover:text-[#ffe28a] transition-colors flex items-center gap-1"
                            >
                                <Icon name="favorite" class="w-4 h-4" />
                                {$t("footer.supportProject")}
                            </button>
                        </div>

                        <div
                            class="hidden xl:block w-px min-h-[60px] bg-gray-300 dark:bg-[#444444]"
                        ></div>

                        <div class="flex flex-col gap-3 min-w-[200px]">
                            <a
                                href="https://goyfield-developers.github.io/"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="flex items-center gap-1 text-left text-[15px] text-gray-400 dark:text-[#B7B6B3] hover:text-black dark:hover:text-white transition-colors"
                            >
                                {$t("home.docsTitle")}
                                <Icon name="sendToLink" class="w-4 h-4" />
                            </a>
                            <a
                                href="https://opendfieldmap.org/"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="flex items-center gap-1 text-left text-[15px] text-gray-400 dark:text-[#B7B6B3] hover:text-black dark:hover:text-white transition-colors"
                            >
                                {$t("footer.interactiveMap")}
                                <Icon name="sendToLink" class="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </footer>
            {/if}

            <CookieConsent />
            <PrivacyModal
                isOpen={isPrivacyModalOpen}
                on:close={() => (isPrivacyModalOpen = false)}
            />

            {#if isDonateModalOpen}
                <div
                    class="fixed inset-0 md:ml-[var(--sb-w)] z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity"
                    on:click={() => (isDonateModalOpen = false)}
                    on:keydown={(e) =>
                        e.key === "Escape" && (isDonateModalOpen = false)}
                    role="button"
                    tabindex="0"
                >
                    <div
                        class="bg-white dark:bg-[#383838] dark:border-[#444444] rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl relative"
                        on:click|stopPropagation
                        on:keydown|stopPropagation
                        role="dialog"
                        aria-modal="true"
                        tabindex="-1"
                    >
                        <button
                            class="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
                            on:click={() => (isDonateModalOpen = false)}
                        >
                            <Icon name="close" class="w-6 h-6" />
                        </button>

                        <h2
                            class="font-sdk dark:text-[#FDFDFD] text-2xl font-bold text-[#21272C] mb-2 text-center"
                        >
                            {$t("settings.donate.title")}
                        </h2>

                        <p
                            class="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center leading-relaxed"
                        >
                            {$t("settings.donate.description")}
                        </p>

                        <div class="flex flex-col gap-3">
                            <a
                                href="https://boosty.to/ivawa/donate"
                                target="_blank"
                                rel="noreferrer"
                                class="no-underline block"
                            >
                                <Button
                                    variant="black2"
                                    className="w-full justify-center"
                                >
                                    <div slot="icon">
                                        <Icon name="boosty" class="w-5 h-5" />
                                    </div>
                                    Boosty
                                </Button>
                            </a>
                            <a
                                href="https://t.me/tribute/app?startapp=dFlw"
                                target="_blank"
                                rel="noreferrer"
                                class="no-underline block"
                            >
                                <Button
                                    variant="black2"
                                    className="w-full justify-center"
                                >
                                    <div slot="icon">
                                        <Icon name="tribute" class="w-5 h-5" />
                                    </div>
                                    Tribute
                                </Button>
                            </a>
                            <a
                                href="https://patreon.com/ivawa?utm_medium=unknown&utm_source=join_link&utm_campaign=creatorshare_creator&utm_content=copyLink"
                                target="_blank"
                                rel="noreferrer"
                                class="no-underline block"
                            >
                                <Button
                                    variant="black2"
                                    className="w-full justify-center"
                                >
                                    <div slot="icon">
                                        <Icon name="patreon" class="w-5 h-5" />
                                    </div>
                                    Patreon
                                </Button>
                            </a>
                        </div>
                    </div>
                </div>
            {/if}
        </main>
    </div>
{:else}
    <div class="min-h-screen w-full bg-[#F0F2F4] dark:bg-[#2a2a2a]"></div>
{/if}
