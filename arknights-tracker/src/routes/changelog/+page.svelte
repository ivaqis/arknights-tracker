<script>
    import { t } from "$lib/i18n";
    import { currentLocale } from "$lib/stores/locale";
    import { changelogData } from "$lib/data/versions.js";
    import { equipment } from "$lib/data/items/equipment.js";
    import { characters } from "$lib/data/characters.js";
    import { weapons } from "$lib/data/weapons.js";
    import { enemies } from "$lib/data/enemies.js";
    import { banners } from "$lib/data/banners.js";
    import { rawEvents } from "$lib/data/timeline.js";

    import Select from "$lib/components/Select.svelte";
    import WeaponCard from "$lib/components/WeaponCard.svelte";
    import OperatorCard from "$lib/components/OperatorCard.svelte";
    import Icon from "$lib/components/Icons.svelte";
    import Images from "$lib/components/Images.svelte";
    import BannerModal from "$lib/components/BannerModal.svelte";

    $: versionOptions = changelogData
        .map((v) => ({
            value: v.version,
            label: `${$t("systemNames.version") || "Version"} ${v.version}`,
        }))
        .sort((a, b) =>
            b.value.localeCompare(a.value, undefined, { numeric: true }),
        );

    let selectedVersion = "";
    let bannerForModal = null;

    $: if (!selectedVersion && versionOptions.length > 0) {
        selectedVersion = versionOptions[0].value;
    }

    $: currentVersionData = changelogData.find(
        (v) => v.version === selectedVersion,
    ) || {
        characters: [],
        weapons: [],
        equipment: [],
        enemies: [],
    };

    $: displayCharacters = (currentVersionData.characters || []).map((id) => ({
        id,
        ...characters[id],
    }));

    $: displayWeapons = (currentVersionData.weapons || []).map((id) => ({
        id,
        ...weapons[id],
    }));

    $: displayEquipment = (currentVersionData.equipment || []).map((id) => ({
        id,
        ...equipment[id],
    }));

    $: displayEnemies = (currentVersionData.enemies || []).map((id) => ({
        id,
        ...enemies[id],
    }));

    $: displayBanners = banners
        .filter((b) => b.version === selectedVersion)
        .sort(
            (a, b) =>
                new Date(a.startTime).getTime() -
                new Date(b.startTime).getTime(),
        );

    $: displayEvents = rawEvents.filter((ev) => ev.version === selectedVersion);

    $: eventsByType = displayEvents.reduce((acc, ev) => {
        const type = ev.type || "other";
        if (!acc[type]) acc[type] = [];
        acc[type].push(ev);
        return acc;
    }, {});

    const typeOrder = [
        "signIn",
        "inGame",
        "inGamePermanent",
        "protoPass",
        "web",
        "mailEvent",
    ];
    $: sortedEventTypes = Object.keys(eventsByType).sort((a, b) => {
        const idxA = typeOrder.indexOf(a);
        const idxB = typeOrder.indexOf(b);
        if (idxA === -1 && idxB === -1) return a.localeCompare(b);
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
    });

    $: eventTypeLabels = {
        signIn:
            $t("events.type.signIn") !== "events.type.signIn"
                ? $t("events.type.signIn")
                : "События входа",
        inGame:
            $t("events.type.inGame") !== "events.type.inGame"
                ? $t("events.type.inGame")
                : "Игровые события",
        inGamePermanent:
            $t("events.type.inGamePermanent") !== "events.type.inGamePermanent"
                ? $t("events.type.inGamePermanent")
                : "Постоянные события",
        web:
            $t("events.type.web") !== "events.type.web"
                ? $t("events.type.web")
                : "Веб-события",
        mailEvent:
            $t("events.type.mailEvent") !== "events.type.mailEvent"
                ? $t("events.type.mailEvent")
                : "Почтовые события",
        protoPass:
            $t("events.type.protoPass") !== "events.type.protoPass"
                ? $t("events.type.protoPass")
                : "Протопропуск",
    };

    $: equipmentByPack = displayEquipment.reduce((acc, eq) => {
        const packName = eq.pack || "none";
        if (!acc[packName]) acc[packName] = [];
        acc[packName].push(eq);
        return acc;
    }, {});

    $: packKeys = Object.keys(equipmentByPack).sort();

    function formatBannerDate(dateStr, loc) {
        if (!dateStr) return "";
        try {
            const onlyDate = dateStr.split(" ")[0];
            const [year, month, day] = onlyDate.split("-").map(Number);
            const dateObj = new Date(Date.UTC(year, month - 1, day));
            if (isNaN(dateObj.getTime())) return onlyDate;
            return new Intl.DateTimeFormat(loc || "ru", {
                day: "numeric",
                month: "long",
                year: "numeric",
                timeZone: "UTC",
            }).format(dateObj);
        } catch (e) {
            console.error("Format date error:", e);
            return dateStr.split(" ")[0];
        }
    }
</script>

{#if bannerForModal}
    <BannerModal
        banner={bannerForModal}
        on:close={() => (bannerForModal = null)}
    />
{/if}

<div class="max-w-[100%] max-h-[100%] justify-start min-h-screen">
    <div class="flex flex-col gap-3 mb-6 font-sdk">
        <div class="flex items-baseline flex-wrap gap-2 md:gap-3">
            <h2
                class="text-3xl md:text-5xl tracking-wide text-[#21272C] dark:text-[#FDFDFD]"
            >
                {$t("pages.changelog") || "Changelog"}
            </h2>
        </div>
    </div>

    <div class="flex max-w-[800px] z-50 mb-4">
        <Select
            options={versionOptions}
            bind:value={selectedVersion}
            placeholder="Select version"
            variant="black"
        />
    </div>

    <div class="w-full xl:w-[80%] pb-12 flex flex-col gap-3 relative">
        {#if displayBanners.length > 0}
            <div class="flex flex-col gap-3 animate-fadeIn">
                <h3
                    class="text-2xl font-bold text-[#21272C] dark:text-[#E4E4E4] font-sdk flex items-center gap-2"
                >
                    {$t("systemNames.banners") || "Banners"}
                </h3>

                <div
                    class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-5 justify-start"
                >
                    {#each displayBanners as banner (banner.id)}
                        <div class="flex flex-col gap-2">
                            <div
                                role="button"
                                tabindex="0"
                                class="relative w-full aspect-[16/9] hover:outline-white hover:dark:outline-white transition-all duration-200 hover:outline-2 bg-gray-200 dark:bg-[#1E1E1E] rounded-xl overflow-hidden shadow-sm group cursor-pointer outline-none focus:ring-4 focus:ring-[#FACC15] select-none hover:shadow-lg"
                                on:click={() => (bannerForModal = banner)}
                                on:keydown={(e) =>
                                    (e.key === "Enter" || e.key === " ") &&
                                    (bannerForModal = banner)}
                            >
                                <Images
                                    id={banner.id}
                                    interactive={true}
                                    variant={banner.type === "web" ||
                                    banner.type === "ingame"
                                        ? "event-icon"
                                        : "banner-icon"}
                                    className="w-full h-full object-cover"
                                    alt={banner.name}
                                />
                                <div
                                    class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80 pointer-events-none"
                                ></div>

                                <div
                                    class="absolute top-2 right-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded text-[9px] font-bold text-white uppercase tracking-wider border border-white/10 pointer-events-none"
                                >
                                    {$t(
                                        `bannerTypes.${banner.type === "weapon" ? "weapon-all" : banner.type}`,
                                    )}
                                </div>
                            </div>

                            <div class="px-1 flex flex-col">
                                <h4
                                    class="font-bold font-sdk text-[#21272C] dark:text-[#FDFDFD] text-sm leading-tight truncate"
                                >
                                    {$t(`banners.${banner.id}`) !==
                                    `banners.${banner.id}`
                                        ? $t(`banners.${banner.id}`)
                                        : banner.name}
                                </h4>
                                {#if banner.startTime}
                                    <div
                                        class="text-[10px] font-nums font-medium text-gray-500 dark:text-[#B7B6B3] truncate mt-0.5"
                                    >
                                        {formatBannerDate(
                                            banner.startTime,
                                            $currentLocale,
                                        )} — {banner.endTime
                                            ? formatBannerDate(
                                                  banner.endTime,
                                                  $currentLocale,
                                              )
                                            : "∞"}
                                    </div>
                                {/if}
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        {/if}

        {#if displayCharacters.length > 0}
            <div class="flex flex-col gap-4 animate-fadeIn">
                <h3
                    class="text-2xl font-bold text-[#21272C] dark:text-[#E4E4E4] font-sdk flex items-center gap-2"
                >
                    {$t("pages.operators") || "Operators"}
                </h3>

                <div
                    class="ml-1 grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] md:grid-cols-[repeat(auto-fill,110px)] gap-6 justify-start"
                >
                    {#each displayCharacters as char (char.id)}
                        <div class="flex justify-center transition-transform">
                            <OperatorCard operator={char} isNew={false} />
                        </div>
                    {/each}
                </div>
            </div>
        {/if}

        {#if displayWeapons.length > 0}
            <div class="flex flex-col gap-4 animate-fadeIn">
                <h3
                    class="text-2xl font-bold text-[#21272C] dark:text-[#E4E4E4] font-sdk flex items-center gap-2 mt-4"
                >
                    {$t("pages.weapons") || "Weapons"}
                </h3>

                <div
                    class="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] md:grid-cols-[repeat(auto-fill,110px)] gap-4 justify-start"
                >
                    {#each displayWeapons as wpn (wpn.id)}
                        <div class="flex justify-center transition-transform">
                            <WeaponCard weapon={wpn} isNew={false} isEquipment={false} />
                        </div>
                    {/each}
                </div>
            </div>
        {/if}

        {#if displayEquipment.length > 0}
            <div class="flex flex-col gap-4 animate-fadeIn">
                <h3
                    class="text-2xl font-bold text-[#21272C] dark:text-[#E4E4E4] font-sdk flex items-center gap-2 mt-4"
                >
                    {$t("pages.equipment") || "Equipment"}
                </h3>

                <div class="flex flex-col gap-3">
                    {#each packKeys as packName}
                        <div class="flex flex-col gap-2">
                            <h4
                                class="text-lg font-bold text-gray-600 dark:text-[#B7B6B3] font-sdk"
                            >
                                {$t(`packs.${packName}`) || packName}
                            </h4>

                            <div
                                class="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] md:grid-cols-[repeat(auto-fill,110px)] gap-5 justify-start"
                            >
                                {#each equipmentByPack[packName] as eq (eq.id)}
                                    <div
                                        class="flex justify-center transition-transform"
                                    >
                                        <WeaponCard
                                            weapon={eq}
                                            isEquipment={true}
                                            isNew={false}
                                        />
                                    </div>
                                {/each}
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        {/if}

        {#if displayEnemies.length > 0}
            <div class="flex flex-col gap-4 animate-fadeIn">
                <h3
                    class="text-2xl font-bold text-[#21272C] dark:text-[#E4E4E4] font-sdk flex items-center gap-2 mt-4"
                >
                    {$t("pages.enemies") || "Enemies"}
                </h3>

                <div
                    class="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] md:grid-cols-[repeat(auto-fill,110px)] gap-4 justify-start"
                >
                    {#each displayEnemies as eny (eny.id)}
                        <div class="flex justify-center transition-transform">
                            <WeaponCard weapon={eny} isNew={false} isEnemy={true} />
                        </div>
                    {/each}
                </div>
            </div>
        {/if}

        {#if displayEvents.length > 0}
            <div class="flex flex-col gap-6 animate-fadeIn mt-4">
                <h3
                    class="text-2xl font-bold text-[#21272C] dark:text-[#E4E4E4] font-sdk flex items-center gap-2"
                >
                    {$t("sidebar.events") || "События"}
                </h3>

                <div class="flex flex-col gap-6">
                    {#each sortedEventTypes as type}
                        <div class="flex flex-col gap-2">
                            <h4
                                class="text-lg font-bold text-gray-600 dark:text-[#B7B6B3] font-sdk pb-1 border-b border-gray-300 dark:border-[#3b3b3b]"
                            >
                                {eventTypeLabels[type] || type}
                            </h4>

                            <div
                                class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-5 justify-start"
                            >
                                {#each eventsByType[type] as ev (ev.id)}
                                    <div class="flex flex-col gap-1.5">
                                        <div
                                            role="button"
                                            tabindex="0"
                                            class="relative w-full aspect-[16/9] hover:outline-white hover:dark:outline-white transition-all duration-200 hover:outline-2 bg-gray-200 dark:bg-[#1E1E1E] rounded-lg overflow-hidden shadow-sm group cursor-pointer outline-none focus:ring-2 focus:ring-[#FACC15] select-none hover:shadow-md"
                                            on:click={() =>
                                                (bannerForModal = ev)}
                                            on:keydown={(e) =>
                                                (e.key === "Enter" ||
                                                    e.key === " ") &&
                                                (bannerForModal = ev)}
                                        >
                                            <Images
                                                id={ev.icon}
                                                interactive={true}
                                                variant="event-icon"
                                                className="w-full h-full object-cover"
                                                alt={$t(ev.title) !== ev.title
                                                    ? $t(ev.title)
                                                    : ev.name || ev.title}
                                            />
                                            <div
                                                class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-80 pointer-events-none"
                                            ></div>
                                        </div>

                                        <div class="px-1 flex flex-col">
                                            <h5
                                                class="font-bold font-sdk text-[#21272C] dark:text-[#FDFDFD] text-xs leading-tight line-clamp-2"
                                            >
                                                {$t(ev.title) !== ev.title
                                                    ? $t(ev.title)
                                                    : ev.name || ev.title}
                                            </h5>
                                            {#if ev.startTime}
                                                <div
                                                    class="text-[9px] font-nums font-medium text-gray-500 dark:text-[#B7B6B3] truncate mt-0.5"
                                                >
                                                    {formatBannerDate(
                                                        ev.startTime,
                                                        $currentLocale,
                                                    )} — {ev.endTime
                                                        ? formatBannerDate(
                                                              ev.endTime,
                                                              $currentLocale,
                                                          )
                                                        : "∞"}
                                                </div>
                                            {/if}
                                        </div>
                                    </div>
                                {/each}
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        {/if}

        {#if displayBanners.length === 0 && displayCharacters.length === 0 && displayWeapons.length === 0 && displayEquipment.length === 0 && displayEvents.length === 0}
            <div
                class="text-center py-20 text-gray-400 italic flex flex-col items-center justify-center bg-gray-50 dark:bg-[#2C2C2C] rounded-2xl border border-dashed border-gray-200 dark:border-[#444] animate-fadeIn"
            >
                <Icon name="noData" class="w-10 h-10 mb-3 opacity-30" />
                <p class="text-sm font-medium">
                    {$t("emptyState.noChanges") || "No added content"}
                </p>
            </div>
        {/if}
    </div>
</div>
