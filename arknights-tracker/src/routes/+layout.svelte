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
    import { addNotification } from "$lib/stores";

    import CookieConsent from "$lib/components/layout/CookieConsent.svelte";
    import LanguageSelect from "$lib/components/layout/LanguageSelect.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import ThemeSwitch from "$lib/components/layout/ThemeSwitch.svelte";
    import SyncModal from "$lib/components/modals/SyncModal.svelte";
    import PrivacyModal from "$lib/components/layout/PrivacyModal.svelte";
    import Button from "$lib/components/Button.svelte";
    import SupportModal from "$lib/components/modals/SupportModal.svelte";
    import Notifications from "$lib/components/layout/Notifications.svelte";

    let isDonateModalOpen = false;
    let isMobileMenuOpen = false;
    let isPrivacyModalOpen = false;
    let isCollapsed = browser
        ? localStorage.getItem("sidebarCollapsed") === "true"
        : false;
    let ready = false;

    let prevStatus = null;

    $: if ($justSynced && $isI18nReady) {
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
            fetch('/images/icons.svg?v=5')
                .then(res => {
                    if (res.ok) return res.text();
                    throw new Error('Failed to load icons.svg');
                })
                .then(svgText => {
                    const div = document.createElement('div');
                    div.style.display = 'none';
                    div.id = '__svg-sprite-sheet__';
                    div.innerHTML = svgText;
                    document.body.appendChild(div);
                })
                .catch(err => console.error(err));

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

        <Notifications />

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

            <SupportModal
                isOpen={isDonateModalOpen}
                on:close={() => (isDonateModalOpen = false)}
            />
        </main>
    </div>
{:else}
    <div class="min-h-screen w-full bg-[#F0F2F4] dark:bg-[#2a2a2a]"></div>
{/if}
