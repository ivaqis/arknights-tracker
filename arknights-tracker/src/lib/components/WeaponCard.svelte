<script>
    import { t } from "$lib/i18n";
    import { goto } from "$app/navigation";
    import { pullData } from "$lib/stores/pulls";
    import { manualPotentials } from "$lib/stores/potentials";
    import { accountStore } from "$lib/stores/accounts";

    import Images from "$lib/components/Images.svelte";
    import Tooltip from "$lib/components/Tooltip.svelte";
    import Icon from "$lib/components/Icons.svelte";

    export let weapon = {};
    export let variant = "default"; // "default" | "small"
    export let className = "";
    export let isNew = false;
    export let hideName = false;
    export let hidePot = true;
    export let hideDarkness = false;
    export let asLink = true;
    export let isEquipment = false;
    export let hideRarity = false;

    $: localeCategory = isEquipment ? "equipment" : "weaponsList";
    $: itemUrl = isEquipment
        ? `/equipment/${weapon.id}`
        : `/weapons/${weapon.id}`;
    $: imageVariant = isEquipment ? "equipment" : "weapon-icon";

    $: safeWeaponType = weapon.type || weapon.weapon;
    $: equipType =
        weapon.partType === 0
            ? "body"
            : weapon.partType === 1
              ? "hand"
              : weapon.partType === 2
                ? "edc"
                : null;
    $: topLeftIcon = isEquipment ? equipType : safeWeaponType;
    $: topLeftTooltip = isEquipment
        ? $t(`equipmentTypes.${equipType}`) || equipType
        : $t(`weapons.${safeWeaponType}`) || safeWeaponType;

    $: extraAttrs = (() => {
        if (!isEquipment || !weapon.displayAttr) return [];
        return weapon.displayAttr.slice(1).map((a) => a.attrType);
    })();

    $: displayedAttrs = extraAttrs.slice(0, 3);
    $: remainingAttrsCount = extraAttrs.length - 3;

    let isHovered = false;

    function getRarityColor(rarity) {
        if (rarity === 6) return "#F4700C"; // Orange
        if (rarity === 5) return "#F9B90C"; // Gold
        if (rarity === 4) return "#9253F1"; // Purple
        if (rarity === 3) return "#25B9F9"; // Blue
        if (rarity === 2) return "#A5B100"; // Green
        return "#8F8F8F";
    }

    $: safeRarity = weapon?.rarity || 1;
    $: rarityColor = getRarityColor(safeRarity);
    $: nameKey = weapon.id || weapon.name?.toLowerCase().replace(/\s+/g, "");

    $: rootClass =
        variant === "small"
            ? `relative flex flex-col cursor-pointer select-none group flex-shrink-0 ${className || "w-[80px] h-[80px]"}`
            : `relative flex flex-col cursor-pointer select-none group flex-shrink-0 ${className || "w-[110px] h-[110px]"}`;

    $: gachaPulls = (() => {
        if (isEquipment || !$pullData) return 0;

        let count = 0;
        Object.entries($pullData).forEach(([_, banner]) => {
            const pulls = banner?.pulls || [];
            const matches = pulls.filter(
                (p) =>
                    p.id === weapon.id ||
                    p.name === weapon.id ||
                    p.itemId === weapon.id ||
                    (p.name &&
                        weapon.name &&
                        p.name.toLowerCase() === weapon.name.toLowerCase()),
            );
            count += matches.length;
        });
        return count;
    })();

    const { selectedId } = accountStore;
    $: currentAccountId = $selectedId;
    $: basePot = gachaPulls > 0 ? gachaPulls - 1 : -1;

    $: accountPots = $manualPotentials[currentAccountId] || {};
    $: currentPot =
        accountPots[weapon.id] !== undefined ? accountPots[weapon.id] : basePot;

    $: hasWeapon = currentPot >= 0 || hideDarkness == true;
    $: constCount = hasWeapon ? currentPot : 0;
    $: isMaxPot = constCount >= 5;

    const potPaths = [
        "M35.3769 14.521L43.8763 14.4792L10.06 39.0583L2.11523 38.4865L35.3769 14.521Z",
        "M20.1176 23.9788L22.9078 15.9502L34.827 56.0203L31.6429 63.3215L20.1176 23.9788Z",
        "M24.2399 42.7944L17.3306 37.8443L59.1357 37.7639L65.2359 42.8858L24.2399 42.7944Z",
        "M44.879 41.6553L38.1667 46.8695L49.9912 6.77135L56.6378 2.38173L44.879 41.6553Z",
        "M49.8633 25.9639L52.5508 34.0273L18.6602 9.55078L16.7285 1.82324L49.8633 25.9639Z",
    ];

    function tooltipOnlyOnOverflow(node, text) {
        const checkOverflow = () => {
            requestAnimationFrame(() => {
                if (
                    node.scrollHeight > node.clientHeight ||
                    node.scrollWidth > node.clientWidth
                ) {
                    node.parentElement.style.pointerEvents = "auto";
                } else {
                    node.parentElement.style.pointerEvents = "none";
                }
            });
        };

        const observer = new ResizeObserver(checkOverflow);
        observer.observe(node);
        checkOverflow();

        return {
            update() {
                checkOverflow();
            },
            destroy() {
                observer.disconnect();
            },
        };
    }
</script>

{#if weapon && weapon.id}
    <svelte:element
        this={asLink ? "a" : "div"}
        href={asLink ? itemUrl : undefined}
        role={asLink ? "link" : "presentation"}
        class="{rootClass} no-underline focus:outline-none focus:ring-2 focus:ring-[#F9B90C] rounded-[6px]"
        on:mouseenter={() => (isHovered = true)}
        on:mouseleave={() => (isHovered = false)}
    >
        <div
            class="absolute inset-0 border-[2px] border-white rounded-[6px] z-30 pointer-events-none transition-opacity duration-200 opacity-0 group-hover:opacity-100"
        ></div>

        <div
            class="relative w-full h-full rounded-[6px] overflow-hidden bg-white dark:bg-[#2a2a2a]"
        >
            <div
                class="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-200 dark:from-[#3a3a3a] dark:to-[#1a1a1a]"
            ></div>

            <div
                class="absolute inset-0 bottom-[6px] flex items-center justify-center z-0"
            >
                <Images
                    id={weapon.id}
                    variant={imageVariant}
                    className="w-full h-full object-contain blur-[0.3px] rotate-[0.01deg] backface-hidden transform-gpu transition-all duration-300 {!hasWeapon &&
                    !isEquipment
                        ? 'brightness-50 grayscale-[50%]'
                        : ''}"
                    alt={weapon.name}
                />
            </div>

            {#if topLeftIcon && variant !== "small"}
                <div
                    class="absolute top-1 {isEquipment
                        ? 'right-1'
                        : 'left-1'} z-20 pointer-events-auto filter flex flex-col items-center gap-0.5"
                >
                    <Tooltip text={topLeftTooltip}>
                        <div
                            class="bg-[#1A1A1A] rounded-[4px] flex items-center justify-center cursor-pointer {variant ===
                            'small'
                                ? 'w-4 h-4 p-0.5'
                                : 'w-5 h-5 p-0.5'} shadow-sm"
                        >
                            <Icon
                                name={topLeftIcon}
                                class="w-full h-full text-white/90"
                            />
                        </div>
                    </Tooltip>

                    {#if isEquipment && weapon.level !== undefined}
                        <span
                            class="text-[10px] font-black text-white leading-none tracking-tight font-nums mt-1"
                            style="text-shadow: 1px 1px 0 #111, -1px -1px 0 #111, 1px -1px 0 #111, -1px 1px 0 #111, 0 2px 2px rgba(0,0,0,0.8);"
                        >
                            {weapon.level}
                        </span>
                    {/if}
                </div>
            {/if}

            {#if isEquipment && extraAttrs.length > 0 && variant !== "small"}
                <div
                    class="absolute top-1 left-1 z-20 flex flex-col gap-1 pointer-events-auto filter"
                >
                    {#each extraAttrs as attr}
                        <Tooltip text={$t(`equipSkills.${attr}`) || attr}>
                            <div
                                class="bg-[#1A1A1A]/95 rounded-[4px] flex items-center justify-center shadow-inner cursor-pointer w-4 h-4 p-0.5"
                            >
                                <Icon
                                    name={attr.toLowerCase() === "maxhp"
                                        ? "hp"
                                        : attr.toLowerCase()}
                                    class="w-full h-full text-white/90"
                                />
                            </div>
                        </Tooltip>
                    {/each}
                </div>
            {/if}

            {#if hasWeapon && variant !== "small" && hidePot && !isEquipment}
                <div
                    class="absolute z-20 right-1 top-1 pointer-events-auto blur-[0.2px] shadow-black"
                >
                    <Tooltip text={`P${currentPot}`} class="">
                        <svg
                            viewBox="0 0 66 65"
                            fill="none"
                            class="w-7 h-7 transition-all cursor-pointer duration-300 {isMaxPot
                                ? 'drop-shadow-[0_0_8px_rgba(254,222,40,0.8)]'
                                : ''}"
                            style="shape-rendering: geometricPrecision;"
                        >
                            {#each potPaths as d, i}
                                {@const isActive = i < constCount}
                                <path
                                    {d}
                                    fill={isActive ? "#FEDE28" : "black"}
                                    stroke={isMaxPot
                                        ? "white"
                                        : isActive
                                          ? "#E5D32B"
                                          : "white"}
                                    stroke-width="1.5"
                                    stroke-linejoin="round"
                                    class="transition-colors duration-300"
                                />
                            {/each}
                        </svg>
                    </Tooltip>
                </div>
            {/if}

            {#if !hideName}
                <div
                    class="absolute bottom-[6px] left-0 right-0 h-[30px] z-10 pointer-events-none bg-gradient-to-t from-black/50 to-transparent"
                ></div>
            {/if}
            {#if !hideRarity}
                <div
                    class="absolute bottom-0 left-0 w-full h-[6px] z-20"
                    style:background-color={rarityColor}
                >
                    <div
                        class="absolute bottom-full left-0 w-full h-[30px] pointer-events-none opacity-60"
                        style="--dot-color: {rarityColor}; background-image: radial-gradient(var(--dot-color) 30%, transparent 35%); background-size: 4px 4px; mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, transparent 100%); -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, transparent 100%);"
                    ></div>
                </div>
            {/if}

            {#if !hideName}
                <div
                    class="absolute bottom-[8px] left-0 right-0 z-30 flex justify-center px-0.5"
                >
                    <span
                        class="text-white text-[11px] mb-0.5 font-bold text-center leading-tight line-clamp-2 drop-shadow-md opacity-90 w-full block cursor-pointer"
                    >
                        {$t(`${localeCategory}.${nameKey}`) || weapon.name}
                    </span>
                </div>
            {/if}

            {#if isNew && variant !== "small"}
                <div
                    class="absolute right-0 mr-[-3px] top-[38px] h-[16px] flex items-stretch z-30 pointer-events-none"
                >
                    <div
                        class="w-[3px] mr-[1.5px] bg-[#FFC107]/85 -skew-x-[24deg]"
                    ></div>
                    <div
                        class="w-[3px] mr-[1.5px] bg-[#FFC107]/85 -skew-x-[24deg]"
                    ></div>
                    <div
                        class="relative bg-[#FFC107]/85 pl-0.5 pr-1 -skew-x-[24deg] flex items-center justify-center"
                    >
                        <div
                            class="absolute left-[-4px] w-[8px] top-0 bottom-0"
                        ></div>
                        <span
                            class="relative z-10 text-[#111111] font-black text-[9px] -skew-x-[-24deg] tracking-widest leading-none uppercase"
                            >NEW</span
                        >
                    </div>
                </div>
            {/if}
            {#if !hideRarity}
                <div
                    class="absolute bottom-0 left-0 w-full h-[6px] z-10"
                    style:background-color={rarityColor}
                ></div>{/if}
        </div>
    </svelte:element>
{/if}
