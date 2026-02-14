<script>
    import "../app.css";
    import { onMount } from "svelte";
    import { pullData } from "$lib/stores/pulls";
    import { accountStore } from "$lib/stores/accounts";
    import { t } from "$lib/i18n";
    import { page } from "$app/stores";
    import { fade } from "svelte/transition";
    import { isDarkMode } from "$lib/stores/theme";
    import { browser } from "$app/environment";
    import { currentLocale } from "$lib/stores/locale";
    import CookieConsent from "$lib/components/CookieConsent.svelte";
    import LanguageSelect from "$lib/components/LanguageSelect.svelte";
    import Icons from "$lib/components/Icons.svelte";
    import ThemeSwitch from "$lib/components/ThemeSwitch.svelte";

    let isMobileMenuOpen = false;
    let isCollapsed = browser ? localStorage.getItem("sidebarCollapsed") === "true" : false;
    let ready = false;

    onMount(() => {
        if (browser) {
            setTimeout(() => { ready = true; }, 100);
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
            document.documentElement.style.setProperty('--sb-w', collapsed ? '5rem' : '16rem');
            if (collapsed) {
                document.documentElement.classList.add('sidebar-closed');
            } else {
                document.documentElement.classList.remove('sidebar-closed');
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
        let w = '16rem';
        let isCol = false;
        try {
            if (localStorage.getItem('sidebarCollapsed') === 'true') {
                w = '5rem';
                isCol = true;
            }
        } catch(e){}
        document.documentElement.style.setProperty('--sb-w', w);
        if (isCol) document.documentElement.classList.add('sidebar-closed');
        else document.documentElement.classList.remove('sidebar-closed');
    </script>
</svelte:head>

<div class="flex min-h-screen bg-[#F9F9F9] dark:bg-[#2C2C2C]">
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
            class="p-2 bg-white dark:bg-[#2C2C2C] dark:border-[#7A7A7A] dark:text-[#FDFDFD] rounded-lg shadow-md border border-gray-100 text-gray-600"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 6h16M4 12h16M4 18h16"
                />
            </svg>
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
        <div class="flex-1 overflow-y-auto overflow-x-hidden">
            <div
                class="mb-10 flex items-center min-h-[40px] px-4 {visuallyCollapsed
                    ? 'justify-center'
                    : 'justify-between'}"
            >
                {#if !visuallyCollapsed}
                    <div class="pr-1 [.sidebar-closed_&]:hidden">
                        <h1
                            class="font-black text-2xl tracking-tighter text-gray-900 dark:text-white leading-none"
                        >
                            <a
                                href="/"
                                class="block hover:opacity-80 transition-opacity"
                            >
                                <Icons name="siteLogo" class="w-full h-auto" />
                            </a>
                        </h1>
                    </div>
                {/if}

                <button
                    on:click={toggleCollapse}
                    class="hidden md:flex items-center justify-center w-8 h-8 rounded text-gray-400 dark:text-gray-500 hover:text-[#21272C] dark:hover:text-[#FDFDFD] transition-colors group flex-shrink-0"
                    aria-label={isCollapsed
                        ? "Expand Sidebar"
                        : "Collapse Sidebar"}
                >
                    {#if isCollapsed}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-6 w-6 group-hover:text-[#FFE145] transition-colors"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            stroke-width="2"
                        >
                            <path
                                stroke-linecap="square"
                                stroke-linejoin="miter"
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        </svg>
                    {:else}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-6 w-6 group-hover:text-[#FFE145] transition-colors"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            stroke-width="2"
                        >
                            <path
                                stroke-linecap="square"
                                stroke-linejoin="miter"
                                d="M18 19l-7-7 7-7"
                            />
                            <path
                                stroke-linecap="square"
                                stroke-linejoin="miter"
                                d="M11 19l-7-7 7-7"
                                class="opacity-50"
                            />
                        </svg>
                    {/if}
                </button>
            </div>

            <nav class="flex flex-col gap-4 px-3">
                {#each [{ path: "/", label: "sidebar.home", icon: "main" }, { path: "/records", label: "sidebar.records", icon: "records" }, { path: "/operators", label: "sidebar.operators", icon: "operators" }, { path: "/events", label: "sidebar.events", icon: "timeline" }, { path: "/settings", label: "sidebar.settings", icon: "settingsMenu" }] as item}
                    <a
                        href={item.path}
                        class="
                            flex items-center gap-3 py-3 rounded-lg group relative min-h-[48px]
                            {ready ? 'transition-all' : ''} 
                            
                            px-3 
                            [.sidebar-closed_&]:px-0 
                            [.sidebar-closed_&]:justify-center

                            {isCurrent(item.path) && (item.path === '/' ? $page.url.pathname === '/' : true)
                                ? 'bg-gray-100 dark:bg-[#424242] text-gray-900 dark:text-[#FDFDFD]'
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
                            <Icons name={item.icon} class="w-full h-full" />
                        </div>

                        {#if !visuallyCollapsed}
                            <span
                                class="
                                    text-lg leading-tight [.sidebar-closed_&]:hidden
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
                {/each}
            </nav>
        </div>

        <div class="w-full mt-auto mb-4 flex flex-col items-center gap-6 px-4">
            {#if !visuallyCollapsed}
            <div class="w-full flex justify-center flex-col gap-6 [.sidebar-closed_&]:hidden">
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
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            stroke="none"
                            ><path
                                d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                            ></path></svg
                        >
                    {:else}
                        <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            ><circle cx="12" cy="12" r="5" /><path
                                d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                            /></svg
                        >
                    {/if}
                </button>

                <button 
                    on:click={() => setSidebarState(false)} 
                    class="w-10 h-10 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#444] hover:text-black dark:hover:text-white transition-colors" 
                    title="Change Language"
                >
                    <Icons name="globe" style="width:22px; height:22px;" />
                </button>
            {/if}
        </div>
    </aside>

    <main
        class="
            w-full p-4 md:p-8 relative z-0 
            ml-0
            {ready ? 'transition-all duration-300 ease-in-out' : ''}
            
            md:ml-[var(--sb-w)]
        "
    >
        {#key $currentLocale}
            <slot />
        {/key}

        <CookieConsent />
    </main>
</div>
