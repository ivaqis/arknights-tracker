<script>
    import { t } from "$lib/i18n.js";
    import { goto } from "$app/navigation";
    import { pullData } from "$lib/stores/pulls.js";
    import { manualPotentials } from "$lib/stores/potentials.js";
    import { accountStore } from "$lib/stores/accounts.js";
    import { disableDarkening } from "$lib/stores/settings.js";
    import { changelogData } from "$lib/data/versions.js";

    import Icon from "$lib/components/Icon.svelte";
    import Tooltip from "$lib/components/Tooltip.svelte";
    import Image from "$lib/components/Image.svelte";
    import PotentialIcon from "$lib/components/operators/PotentialIcon.svelte";
    import { getBaseSkillLocale, getBaseSkillMappedFilter } from "$lib/utils/filterUtils.js";

    export let operator = {};
    export let variant = "default"; // "small" | "default"
    export let className = "";
    export let isNew = undefined;
    export let hideName = false;
    export let materialIcon = null;
    export let materialCount = 0;
    export let baseSkills = null;
    export let activeBaseSkillFilters = null;

    $: uniqueBaseSkills = (() => {
        if (!baseSkills) return [];
        const names = new Set();
        const keys = Object.keys(baseSkills).sort();
        for (const key of keys) {
            const skill = baseSkills[key];
            if (skill && skill.name) {
                names.add(skill.name);
            }
        }
        return Array.from(names);
    })();

    $: displayedBaseSkills = (() => {
        if (!activeBaseSkillFilters || activeBaseSkillFilters.size === 0) return [];
        return uniqueBaseSkills.filter(skillName => {
            const mappedFilter = getBaseSkillMappedFilter(operator.id, skillName);
            return activeBaseSkillFilters.has(mappedFilter);
        });
    })();

    $: computedIsNew =
        isNew !== undefined
            ? isNew
            : (() => {
                  if (!operator || !operator.id) return false;
                  const latest = [...changelogData].sort((a, b) =>
                      b.version.localeCompare(a.version, undefined, {
                          numeric: true,
                      }),
                  )[0];
                  return latest?.characters?.includes(operator.id) || false;
              })();

    $: gachaPulls = (() => {
        if (!$pullData) return 0;
        let count = 0;
        Object.entries($pullData).forEach(([_, banner]) => {
            const pulls = banner?.pulls || [];
            const matches = pulls.filter(
                (p) =>
                    p.id === operator.id ||
                    p.name === operator.id ||
                    p.itemId === operator.id ||
                    (p.name &&
                        operator.name &&
                        p.name.toLowerCase() === operator.name.toLowerCase()),
            );
            count += matches.length;
        });
        return count;
    })();

    const { selectedId } = accountStore;
    $: currentAccountId = $selectedId;
    $: isAlwaysOwned =
        operator.id === "endministrator1" || operator.id === "endministrator2";
    $: basePot = gachaPulls > 0 ? gachaPulls - 1 : isAlwaysOwned ? 0 : -1;

    $: accountPots = $manualPotentials[currentAccountId] || {};
    $: currentPot =
        accountPots[operator.id] !== undefined
            ? isAlwaysOwned
                ? Math.max(0, accountPots[operator.id])
                : accountPots[operator.id]
            : basePot;

    $: manualPot = accountPots[operator.id];
    $: actualPulls = manualPot !== undefined ? manualPot + 1 : gachaPulls;
    $: hasOperator = currentPot >= 0;
    $: constCount = hasOperator ? currentPot : 0;
    $: isMaxPot = constCount >= 5;
    $: isAccountEmpty = (() => {
        if (!$pullData) return true;
        for (const key in $pullData) {
            if ($pullData[key]?.pulls?.length > 0) {
                return false;
            }
        }
        return true;
    })();
    $: shouldDarken =
        !hasOperator &&
        variant === "default" &&
        !isAccountEmpty &&
        !$disableDarkening;


    function getRarityColor(rarity) {
        if (rarity === 6) return "#F4700C";
        if (rarity === 5) return "#F9B90C";
        if (rarity === 4) return "#9253F1";
        return "#888";
    }

    $: safeRarity = operator?.rarity || 1;
    $: rarityColor = getRarityColor(safeRarity);
    $: nameKey =
        operator.id || operator.name?.toLowerCase().replace(/\s+/g, "");

    let nameElement;
    let isTruncated = false;
    let isHovered = false;

    function checkTruncation() {
        if (nameElement) {
            isTruncated = nameElement.scrollWidth > nameElement.clientWidth;
        }
    }

    $: cornerSize = variant === "small" ? "w-2 h-2" : "w-3 h-3";
    $: borderW = variant === "small" ? "2px" : "4px";
    $: rootClass =
        variant === "small"
            ? `relative cursor-pointer transition-all duration-300 group bg-transparent flex-shrink-0 ${className || "w-[80px] h-[110px]"}`
            : `relative w-[120px] h-[147px] cursor-pointer transition-all duration-300 group bg-transparent flex-shrink-0 ${className}`;
    $: iconSize = variant === "small" ? "w-4 h-4" : "w-6 h-6";
    $: iconPadding =
        variant === "small" ? "pl-1 pt-1 gap-0.5" : "pl-0.5 pt-0.5 gap-0";
</script>

{#if operator && operator.id}
    <a
        href={`/operators/${operator.id}`}
        class="{rootClass} block no-underline focus:outline-none focus:ring-2 focus:ring-[#F9B90C] rounded-[6px]"
        on:mouseenter={() => (isHovered = true)}
        on:mouseleave={() => (isHovered = false)}
    >
        {#if variant !== "small"}
            <div
                class="absolute -inset-[3px] z-30 pointer-events-none transition-opacity duration-200 opacity-0 group-hover:opacity-100"
            >
                <div
                    class={`absolute top-0 left-0 ${cornerSize} border-[#FFF593] dark:border-[#FFD700] rounded-tl-md shadow-sm`}
                    style={`border-top-width: ${borderW}; border-left-width: ${borderW};`}
                ></div>
                <div
                    class={`absolute top-0 right-0 ${cornerSize} border-[#FFF593] dark:border-[#FFD700] rounded-tr-md shadow-sm`}
                    style={`border-top-width: ${borderW}; border-right-width: ${borderW};`}
                ></div>
                <div
                    class={`absolute bottom-0 left-0 ${cornerSize} border-[#FFF593] dark:border-[#FFD700] rounded-bl-md shadow-sm`}
                    style={`border-bottom-width: ${borderW}; border-left-width: ${borderW};`}
                ></div>
                <div
                    class={`absolute bottom-0 right-0 ${cornerSize} border-[#FFF593] dark:border-[#FFD700] rounded-br-md shadow-sm`}
                    style={`border-bottom-width: ${borderW}; border-right-width: ${borderW};`}
                ></div>
            </div>
        {/if}

        <div
            class="absolute inset-0 border-[2px] border-white dark:border-white rounded-[6px] z-30 pointer-events-none transition-opacity duration-100 opacity-0 group-hover:opacity-100"
        ></div>

        <div
            class="
            relative w-full h-full rounded-[6px] overflow-hidden transition-all duration-200
            shadow-sm dark:shadow-sm
            group-hover:shadow-md dark:group-hover:shadow-md

            bg-gradient-to-b from-[#4F4F4F] to-[#323232] dark:from-[#3a3a3a] dark:to-[#1a1a1a]
            group-hover:from-[#5E5E5E] group-hover:to-[#3E3E3E]
            dark:group-hover:from-[#404040] dark:group-hover:to-[#2C2C2C]
        "
        >
            <div
                class="absolute inset-0 z-10 {variant === 'default'
                    ? 'bottom-[21%]'
                    : 'bottom-0'}"
            >
                <Image
                    id={operator.id}
                    variant="operator-preview"
                    size="100%"
                    interactive={true}
                    alt={operator.name}
                    className="w-full h-full object-cover transition-all duration-300 {shouldDarken
                        ? 'brightness-50 grayscale-[50%]'
                        : ''}"
                />

                {#if variant === "small" && !hideName}
                    <div
                        class="absolute bottom-0 left-0 right-0 h-[60%] bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none z-10"
                    ></div>
                {/if}
            </div>

            <div
                class="absolute inset-0 z-20 {iconPadding} flex flex-col items-start pointer-events-none"
            >
                <div class="pointer-events-auto">
                    <Tooltip
                        textKey={`classes.${operator.class}`}
                        class={`flex items-center justify-center filter drop-shadow-md cursor-pointer ${iconSize}`}
                    >
                        <Icon
                            name={operator.class}
                            class="w-full h-full text-white rounded-md"
                        />
                    </Tooltip>
                </div>

                {#if operator.element}
                    <div class="pointer-events-auto {variant === 'small' ? 'mt-[-1px]' : 'mt-[-3px]'}">
                        <Tooltip
                            textKey={`elements.${operator.element}`}
                            class={`flex items-center justify-center filter drop-shadow-md cursor-pointer ${iconSize}`}
                        >
                            <Icon
                                name={operator.element}
                                class="w-full h-full text-white rounded-md"
                            />
                        </Tooltip>
                    </div>
                {/if}

                {#each displayedBaseSkills as skillName}
                    <div class="pointer-events-auto {variant === 'small' ? 'mt-[-1px]' : 'mt-[-3px]'}">
                        <Tooltip
                            text={getBaseSkillLocale(operator.id, skillName, $t)}
                            class={`flex items-center justify-center filter drop-shadow-md cursor-pointer ${iconSize}`}
                        >
                            <Image
                                id={skillName}
                                variant="fac-skill"
                                className="w-full h-full object-contain rounded-md"
                            />
                        </Tooltip>
                    </div>
                {/each}
            </div>

            {#if variant === "default"}
                <div
                    class="absolute bottom-[24px] w-full flex justify-center items-center gap-[-2px] z-30 pointer-events-none"
                >
                    {#each Array(safeRarity) as _}
                        <div
                            class="relative w-[20px] h-[20px] flex items-center justify-center"
                        >
                            <div
                                class="relative z-10 w-full h-full drop-shadow-sm"
                                style:color={rarityColor}
                            >
                                <Icon
                                    name="strokeStar"
                                    class="w-5 h-5 fill-current"
                                />
                            </div>
                        </div>
                    {/each}
                </div>

                <div
                    class="
                        absolute bottom-0 left-0 w-full h-[32px] z-20 flex items-center justify-center px-2 pb-0.5 transition-colors duration-200
                        bg-white dark:bg-[#383838]
                        group-hover:bg-white dark:group-hover:bg-[#373737]
                        pointer-events-none
                    "
                    role="none"
                    on:mouseenter={checkTruncation}
                >
                    <div class="w-full relative z-20 pointer-events-auto">
                        <Tooltip
                            text={isTruncated
                                ? $t(`characters.${nameKey}`) || operator.name
                                : ""}
                            class="w-full block cursor-pointer"
                        >
                            <div
                                bind:this={nameElement}
                                class="font-bold pb-1.5 text-[#1d1e1f] dark:text-[#E0E0E0] text-[11px] leading-normal whitespace-nowrap overflow-hidden text-ellipsis text-center w-full select-none"
                            >
                                {$t(`characters.${nameKey}`) || operator.name}
                            </div>
                        </Tooltip>
                    </div>
                    <div
                        class="absolute bottom-0 left-0 w-full h-[7px] pointer-events-none"
                        style:background-color={rarityColor}
                    ></div>
                </div>

                {#if hasOperator}
                    <div
                        class="absolute top-1 right-1.5 z-20 pointer-events-auto drop-shadow-md blur-[0.2px] shadow-black"
                    >
                        <Tooltip text={`P${currentPot}`} class="">
                            <PotentialIcon
                                pot={currentPot}
                                size={variant === "small" ? 18 : 34}
                                className="cursor-pointer"
                            />
                        </Tooltip>
                    </div>
                {/if}

                {#if materialIcon && materialCount > 0}
                    <div class="absolute right-0.5 bottom-[45px] z-30 flex flex-col items-center pointer-events-auto">
                        <Tooltip text={$t(`items.${materialIcon}`) || materialIcon}>
                            <div class="flex flex-col items-center filter drop-shadow-md">
                                <Image id={materialIcon} variant="item" size={32} className="object-contain mb-[-4px]" />
                                <span
                                    class="text-[10px] font-black text-white leading-none tracking-tight font-nums"
                                    style="text-shadow: 1px 1px 0 #111, -1px -1px 0 #111, 1px -1px 0 #111, -1px 1px 0 #111, 0 2px 2px rgba(0,0,0,0.8);"
                                >
                                    {materialCount}
                                </span>
                            </div>
                        </Tooltip>
                    </div>
                {/if}
            {/if}

            {#if variant === "small" && !hideName}
                <div
                    class="absolute bottom-0 left-0 right-0 z-20 pointer-events-none flex flex-col justify-end p-1.5 pb-1.5 h-full"
                >
                    <div
                        class="text-white text-[8px] font-bold leading-tight text-center drop-shadow-md line-clamp-2 break-words mb-1 select-none"
                    >
                        {$t(`characters.${nameKey}`) || operator.name}
                    </div>
                    <div
                        class="h-[2px] w-full rounded-full opacity-90 shrink-0 shadow-sm"
                        style:background-color={rarityColor}
                    ></div>
                </div>
            {/if}
            {#if computedIsNew && variant !== "small"}
                <div
                    class="absolute right-0 mt-1 mr-[-3px] top-[38px] h-[16px] flex items-stretch z-30 pointer-events-none drop-shadow-sm select-none"
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
                        >
                            NEW
                        </span>
                    </div>
                </div>
            {/if}
        </div>
    </a>
{/if}
