<script>
    import "../app.css";
    import { onMount } from "svelte";
    import { pullData } from "$lib/stores/pulls";
    import { accountStore } from "$lib/stores/accounts";
    import { t } from "$lib/i18n";
    import { page } from "$app/stores";
    import LanguageSelect from "$lib/components/LanguageSelect.svelte";
    import Icons from "$lib/components/Icons.svelte";
    import { fade } from "svelte/transition";

    let isMobileMenuOpen = false;

    $: if ($page.url.pathname) {
        isMobileMenuOpen = false;
    }

    $: isCurrent = (path) => $page.url.pathname.startsWith(path);
    
    function handleKeydown(e) {
        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
            isMobileMenuOpen = false;
        }
    }
</script>

<svelte:head>
  <title>{$t("seo.title")}</title>
  
  <meta name="description" content={$t("seo.description")}>
  <meta name="keywords" content={$t("seo.keywords")}>
  
  <link rel="icon" href="/favicon.ico" sizes="any" />
  <link rel="icon" type="image/png" href="/favicon.png" />
  <link rel="apple-touch-icon" href="/favicon.png" />
  
  <meta property="og:title" content={$t("seo.title")} />
  <meta property="og:description" content={$t("seo.description")} />
  <meta property="og:image" content="https://goyfield.moe/images/og-image.jpg" /> 
</svelte:head>

<div class="flex min-h-screen bg-[#F9F9F9]">
    
    {#if isMobileMenuOpen}
        <button
            transition:fade={{ duration: 200 }}
            class="fixed inset-0 bg-black/60 z-[9999] md:hidden backdrop-blur-sm cursor-pointer w-full h-full border-none p-0 m-0 outline-none block"
            aria-label="Close menu"
            on:click={() => (isMobileMenuOpen = false)}
            on:keydown={handleKeydown}
        ></button>
    {/if}

    <div class="md:hidden fixed top-4 right-4 z-[10001]">
        <button
            on:click|stopPropagation={() => (isMobileMenuOpen = !isMobileMenuOpen)}
            class="p-2 bg-white rounded-lg shadow-md border border-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Toggle Menu"
        >
            {#if isMobileMenuOpen}
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            {:else}
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            {/if}
        </button>
    </div>

    <aside
        class="
            fixed top-0 bottom-0 left-0
            w-64 bg-white h-full border-r border-gray-100 flex flex-col justify-between py-6 px-4
            z-[10000] transition-transform duration-300 ease-in-out shadow-2xl
            {isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
            md:translate-x-0 md:shadow-none md:z-30
        "
    >
        <div>
            <div class="mb-10 pl-2">
                <h1 class="font-black text-2xl tracking-tighter text-gray-900">
                    <a
                        href="/"
                        class="block hover:opacity-80 transition-opacity"
                        aria-label="На главную"
                    >
                        <Icons name="siteLogo" class="w-full h-full" />
                    </a>
                </h1>
            </div>

            <nav class="flex flex-col gap-4 mt-8">
                <a
                    href="/"
                    class="flex items-center gap-3 w-full px-3 py-3 rounded-lg transition group relative {isCurrent(
                        '/',
                    ) && $page.url.pathname === '/'
                        ? 'bg-gray-100 text-gray-900 font-bold'
                        : 'text-gray-500 hover:bg-gray-50 font-medium'}"
                >
                    <div
                        class="w-6 h-6 flex justify-center items-center pointer-events-none {isCurrent(
                            '/',
                        ) && $page.url.pathname === '/'
                            ? 'text-gray-900'
                            : 'text-gray-400 group-hover:text-gray-600'}"
                    >
                        <Icons name="main" class="w-full h-full" />
                    </div>
                    <span class="text-lg">{$t("sidebar.home")}</span>
                </a>

                <a
                    href="/records"
                    class="flex items-center gap-3 w-full px-3 py-3 rounded-lg transition group {isCurrent(
                        '/records',
                    )
                        ? 'bg-gray-100 text-gray-900 font-bold'
                        : 'text-gray-500 hover:bg-gray-50 font-medium'}"
                >
                    <div
                        class="w-6 h-6 flex justify-center items-center {isCurrent(
                            '/records',
                        )
                            ? 'text-gray-900'
                            : 'text-gray-400 group-hover:text-gray-600'}"
                    >
                        <Icons name="records" class="w-full h-full" />
                    </div>
                    <span class="text-lg">{$t("sidebar.records")}</span>
                </a>

                <a
                    href="/operators"
                    class="flex items-center gap-3 w-full px-3 py-3 rounded-lg transition group {isCurrent(
                        '/operators',
                    )
                        ? 'bg-gray-100 text-gray-900 font-bold'
                        : 'text-gray-500 hover:bg-gray-50 font-medium'}"
                >
                    <div
                        class="w-6 h-6 flex justify-center items-center {isCurrent(
                            '/operators',
                        )
                            ? 'text-gray-900'
                            : 'text-gray-400 group-hover:text-gray-600'}"
                    >
                        <Icons name="operators" class="w-full h-full" />
                    </div>
                    <span class="text-lg">{$t("sidebar.operators")}</span>
                </a>

                <a
                    href="/events"
                    class="flex items-center gap-3 w-full px-3 py-3 rounded-lg transition group {isCurrent(
                        '/events',
                    )
                        ? 'bg-gray-100 text-gray-900 font-bold'
                        : 'text-gray-500 hover:bg-gray-50 font-medium'}"
                >
                    <div
                        class="w-6 h-6 flex justify-center items-center {isCurrent(
                            '/events',
                        )
                            ? 'text-gray-900'
                            : 'text-gray-400 group-hover:text-gray-600'}"
                    >
                        <Icons name="timeline" class="w-full h-full" />
                    </div>
                    <span class="text-lg">{$t("sidebar.events")}</span>
                </a>

                <a
                    href="/settings"
                    class="flex items-center gap-3 w-full px-3 py-3 rounded-lg transition group text-left
    {isCurrent('/settings') && $page.url.pathname === '/settings'
                        ? 'bg-gray-100 text-gray-900 font-bold'
                        : 'text-gray-500 hover:bg-gray-50 font-medium'}"
                >
                    <div
                        class="w-6 h-6 flex justify-center items-center
        {isCurrent('/settings') && $page.url.pathname === '/settings'
                            ? 'text-gray-900'
                            : 'text-gray-400 group-hover:text-gray-600'}"
                    >
                        <Icons name="settingsMenu" class="w-full h-full" />
                    </div>
                    <span class="text-lg">{$t("sidebar.settings")}</span>
                </a>
            </nav>
        </div>

        <div class="w-full">
            <div class="mt-auto">
                <LanguageSelect />
            </div>
        </div>
    </aside>

    <main class="md:ml-64 w-full p-4 md:p-8 relative z-0">
        <slot />
    </main>
</div>