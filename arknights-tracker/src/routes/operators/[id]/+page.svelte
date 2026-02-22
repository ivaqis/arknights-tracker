<script>
    import { page } from "$app/stores";
    import { t } from "$lib/i18n";
    import { currentLocale } from "$lib/stores/locale";
    import { progression } from "$lib/data/items/progression.js";
    import { currencies } from "$lib/data/items/currencies.js";
    import { characters } from "$lib/data/characters.js";

    import Icon from "$lib/components/Icons.svelte";
    import Tooltip from "$lib/components/Tooltip.svelte";
    import ItemCard from "$lib/components/ItemCard.svelte";
    import Button from "$lib/components/Button.svelte";
    import SkillCard from "$lib/components/SkillCard.svelte";
    import Images from "$lib/components/Images.svelte";
    import TalentCard from "$lib/components/TalentCard.svelte";

    const localeModules = {
        de: import.meta.glob("$lib/locales/de/characters/*.json", { eager: true }),
        en: import.meta.glob("$lib/locales/en/characters/*.json", { eager: true }),
        es: import.meta.glob("$lib/locales/es/characters/*.json", { eager: true }),
        fr: import.meta.glob("$lib/locales/fr/characters/*.json", { eager: true }),
        id: import.meta.glob("$lib/locales/id/characters/*.json", { eager: true }),
        it: import.meta.glob("$lib/locales/it/characters/*.json", { eager: true }),
        ja: import.meta.glob("$lib/locales/ja/characters/*.json", { eager: true }),
        ko: import.meta.glob("$lib/locales/ko/characters/*.json", { eager: true }),
        pt: import.meta.glob("$lib/locales/pt/characters/*.json", { eager: true }),
        ru: import.meta.glob("$lib/locales/ru/characters/*.json", { eager: true }),
        th: import.meta.glob("$lib/locales/th/characters/*.json", { eager: true }),
        vi: import.meta.glob("$lib/locales/vi/characters/*.json", { eager: true }),
        zhcn: import.meta.glob("$lib/locales/zhcn/characters/*.json", { eager: true }),
        zhtw: import.meta.glob("$lib/locales/zhtw/characters/*.json", { eager: true })
    };

    $: id = $page.params.id;
    $: char = Object.values(characters).find((c) => c.id === id) || {};

    $: charLocale = (() => {
        const lang = $currentLocale || "en"; 
        const path = `/src/lib/locales/${lang}/characters/${id}.json`;
        const modules = localeModules[lang] || localeModules["en"];
        let data = modules[path]?.default;
        if (!data && lang !== "en") {
            const fallbackPath = `/src/lib/locales/en/characters/${id}.json`;
            data = localeModules["en"][fallbackPath]?.default;
        }

        return data || {};
    })();

    $: skillsLocale = charLocale.skills || {};
    $: baseInfoLocale = charLocale.baseInfo || {};

    const dataModules = import.meta.glob(
        "/src/lib/data/charactersData/*.json",
        {
            eager: true,
        },
    );

    $: charDetails = (() => {
        if (!id) return {};
        const foundKey = Object.keys(dataModules).find((k) =>
            k.endsWith(`/${id}.json`),
        );
        const mod = foundKey ? dataModules[foundKey] : null;
        if (mod) {
            return mod.default || mod;
        }
        console.warn(`Character data not found for ID: ${id}`);
        return {};
    })();

    $: skillsValuesData = charDetails.skills || {};
    const skillKeys = ["basicAttack", "battleSkill", "comboSkill", "ultimate"];

    $: itemsDb = [...(progression || []), ...(currencies || [])];

    $: charMaterials = charDetails.materials || {};

    function getSkillMaterials(materials, skillKey) {
        if (!materials) return {};
        const mapped = { ...materials };
        for (let i = 2; i <= 12; i++) {
            const newKey = `${skillKey}Rank${i}`;
            if (materials[newKey]) {
                mapped[`skillLevel${i}`] = materials[newKey];
            }
        }
        return mapped;
    }

    $: charStats = {
        mainAttribute: charDetails.mainAttribute,
        secondaryAttribute: charDetails.secondaryAttribute,
        hp: charDetails.hp || [0, 0, 0],
        atk: charDetails.atk || [0, 0, 0],
        def: charDetails.def || [0, 0, 0],

        attributes: {
            str: charDetails.str || [],
            agi: charDetails.agi || [],
            int: charDetails.int || [],
            will: charDetails.will || [],
        },
    };

    function getRarityColor(rarity) {
        if (rarity === 6) return "#F4700C";
        if (rarity === 5) return "#F9B90C";
        if (rarity === 4) return "#9253F1";
        return "#888";
    }

    $: rarityColor = getRarityColor(char.rarity || 1);

    let activeTab = "about";
    let maxLevel = 90;
    let level = maxLevel;
    let isTotalMode = false;
    let isTableCopied = false;

    const menuItems = [
        { id: "about", label: "menu.about" },
        { id: "skills", label: "menu.combatSkills" },
        { id: "talents", label: "menu.talents" },
        { id: "potentials", label: "menu.potentials" },
        { id: "artwork", label: "menu.artwork" },
        { id: "files", label: "menu.files" },
        //{ id: "audio", label: "menu.audio" },
    ];

    function calculateStat(statArray, currentLvl) {
        if (!statArray || statArray.length === 0) return "0";
        const min = parseFloat(statArray[0]);
        const max = parseFloat(statArray[statArray.length - 1]);
        if (currentLvl === 1) return Math.round(min);
        if (currentLvl === maxLevel) return Math.round(max);
        const percent = (currentLvl - 1) / (maxLevel - 1);
        return Math.round(min + (max - min) * percent);
    }

    function getAttrStyles(attrName) {
        if (attrName === charStats.mainAttribute) {
            return {
                bg: "bg-[#FFEE00]",
                icon: "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]",
            };
        }
        if (attrName === charStats.secondaryAttribute) {
            return {
                bg: "bg-[#3B3B3B]",
                icon: "text-white",
            };
        }
        return {
            bg: "bg-[#8F8F8F]",
            icon: "text-white",
        };
    }

    $: neededMaterials = (() => {
        if (!charMaterials || Object.keys(charMaterials).length === 0)
            return [];

        const required = {};
        let phasesNeeded = [];

        const t1 = { cap: 20, key: "ascention1" };
        const t2 = { cap: 40, key: "ascention2" };
        const t3 = { cap: 60, key: "ascention3" };
        const t4 = { cap: 80, key: "ascention4" };

        if (isTotalMode) {
            if (level >= t1.cap) phasesNeeded.push(t1.key);
            if (level >= t2.cap) phasesNeeded.push(t2.key);
            if (level >= t3.cap) phasesNeeded.push(t3.key);
            if (level >= t4.cap) phasesNeeded.push(t4.key);
        } else {
            if (level <= 20) {
                phasesNeeded.push(t1.key);
            } else if (level <= 40) {
                phasesNeeded.push(t2.key);
            } else if (level <= 60) {
                phasesNeeded.push(t3.key);
            } else {
                phasesNeeded.push(t4.key);
            }
        }

        phasesNeeded.forEach((key) => {
            const mats = charMaterials[key];
            if (mats) {
                mats.forEach((mat) => {
                    const itemId = mat.name;
                    if (!required[itemId]) required[itemId] = 0;
                    required[itemId] += mat.amount;
                });
            }
        });

        return Object.entries(required)
            .map(([itemId, amount]) => {
                const itemData = itemsDb.find((i) => i.id === itemId) || {
                    id: itemId,
                    name: itemId,
                    rarity: 1,
                    icon: "",
                };
                return { ...itemData, amount };
            })
            .sort((a, b) => {
                if (a.id === "t_creds") return -1;
                if (b.id === "t_creds") return 1;
                return (a.rarity || 1) - (b.rarity || 1);
            });
    })();

    let shiftPressed = false;

    function handleKeydown(e) {
        if (e.key === "Shift") shiftPressed = true;
        if (e.key === "Escape") {
            selectedArtId = null;
            showStatsTable = false;
        }
    }

    function handleKeyup(e) {
        if (e.key === "Shift") shiftPressed = false;
    }

    function handleInput(e) {
        let val = parseInt(e.target.value);

        if (shiftPressed) {
            val = Math.round(val / 10) * 10;
            if (val < 1) val = 1;
            if (val > maxLevel) val = maxLevel;
        }

        level = val;
    }

    let showStatsTable = false;
    let selectedArtId = null;

    async function copyStatsTable() {
        const headers = [
            $t("stats.level") || "Level",
            "HP",
            "ATK",
            "STR",
            "AGI",
            "INT",
            "WILL",
        ];

        let textData = headers.join("\t") + "\n";

        for (let i = 1; i <= 90; i++) {
            const row = [
                i,
                calculateStat(charStats.hp, i),
                calculateStat(charStats.atk, i),
                calculateStat(charStats.attributes.str, i),
                calculateStat(charStats.attributes.agi, i),
                calculateStat(charStats.attributes.int, i),
                calculateStat(charStats.attributes.will, i),
            ];
            textData += row.join("\t") + "\n";
        }

        try {
            await navigator.clipboard.writeText(textData);

            isTableCopied = true;

            setTimeout(() => {
                isTableCopied = false;
            }, 2000);
        } catch (err) {
            console.error("Failed to copy", err);
        }
    }

    function parseRichText(text) {
        if (!text) return "";

        const styles = {
            "ba.natur": "text-[#4ADE80] font-bold", // Природный
            "ba.fire": "text-[#F87171] font-bold", // Огненный
            "ba.cryst": "text-[#67E8F9] font-bold", // Кристаллический
            "ba.pulse": "text-[#C084FC] font-bold", // Электрический
            "ba.phy": "text-[#A3A3A3] font-bold", // Физический
            "ba.poise": "text-[#FBBF24] font-bold", // Ошеломление
            "ba.vup": "text-[#38BDF8] font-bold", // Повышение
            "ba.key": "text-[#E3BC55] font-bold", // Ключевые термины
            "ba.conduct": "text-[#C084FC] font-bold", // Электризация
            "ba.spelldmg": "text-[#E3BC55] font-bold", // Урон от искусств
        };

        return text.replace(
            /<([@#])([^>]+)>([\s\S]*?)<\/>/g,
            (match, type, tag, content) => {
                if (tag === "profile.key") return content;

                let styleClass = styles[tag] || "text-[#E3BC55] font-bold";

                if (type === "#") {
                    styleClass +=
                        " underline decoration-dashed decoration-current underline-offset-4";
                }

                return `<span class="${styleClass}">${content}</span>`;
            },
        );
    }

    function interpolateBlackboard(text, bb) {
        if (!text) return "";
        if (!bb || Object.keys(bb).length === 0) return text;

        return text.replace(/\{([^}]+)\}/g, (match, content) => {
            let [expr, format] = content.split(":");
            let mathStr = expr;

            for (const key in bb) {
                const regex = new RegExp(`\\b${key}\\b`, "g");
                mathStr = mathStr.replace(regex, `(${bb[key]})`);
            }

            if (/[a-zA-Z_]/.test(mathStr)) return match;

            let result = 0;
            try {
                result = new Function("return " + mathStr)();
            } catch (e) {
                return match;
            }
            if (format) {
                if (format.includes("%")) {
                    result = parseFloat((result * 100).toFixed(2)) + "%";
                } else if (format === "0") {
                    result = Math.round(result);
                } else {
                    result = parseFloat(Number(result).toFixed(2));
                }
            }
            return `<span class="text-[#38BDF8] font-bold drop-shadow-sm">${result}</span>`;
        });
    }
</script>

<svelte:window on:keydown={handleKeydown} on:keyup={handleKeyup} />

<div class="min-h-screen relative flex flex-col p-8">
    <div
        class="fixed inset-0 flex items-center justify-center pointer-events-none z-0 transition-opacity duration-500 {activeTab ===
        'about'
            ? 'opacity-100'
            : 'opacity-60'}"
    >
        <div
            class="h-[110%] max-w-none object-cover opacity-100 lg:opacity-100 mask-image-gradient"
        >
            <Images id={char.id} variant="operator-splash" size="100%" />
        </div>
        <div
            class="absolute inset-0 bg-gradient-to-r dark:from-[#707070] from-[#F9F9F9] via-[#F9F9F9]/80 to-transparent lg:via-[#F9F9F9]/40 z-10 opacity-40"
        ></div>
    </div>

    <div
        class="relative z-20 w-full max-w-[1600px] mx-auto flex flex-col 2xl:flex-row justify-between gap-8 h-full"
    >
        <div
            class="flex flex-col gap-6 2xl:sticky 2xl:top-8 2xl:self-start z-30 w-full 2xl:w-[380px] shrink-0"
        >
            <div class="flex flex-col gap-1">
                <div class="mb-2">
                    <Button
                        variant="roundSmall"
                        color="white"
                        onClick={() => history.back()}
                    >
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"><path d="M15 18l-6-6 6-6" /></svg
                        >
                    </Button>
                </div>

                <h1
                    class="font-sdk text-5xl font-bold dark:text-[#FDFDFD] text-[#21272C]"
                >
                    {$t(`characters.${id}`) || char.name}
                </h1>

                <div class="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mt-2">
                    
                    <div class="flex items-center gap-4">
                        <Tooltip text={$t(`classes.${char.class}`)}>
                            <div
                                class="w-10 h-10 rounded flex items-center justify-center shadow-sm"
                            >
                                <Icon
                                    name={char.class}
                                    class="w-10 h-10 text-white"
                                />
                            </div>
                        </Tooltip>

                        <div class="w-[1px] h-8 bg-gray-300"></div>

                        <Tooltip text={$t(`elements.${char.element}`)}>
                            <div
                                class="w-10 h-10 rounded flex items-center justify-center shadow-sm"
                            >
                                <Icon
                                    name={char.element}
                                    class="w-7 h-7 text-white"
                                />
                            </div>
                        </Tooltip>
                    </div>

                    <div class="hidden md:block w-[1px] h-8 bg-gray-300"></div>

                    <div class="flex items-center gap-0 -space-x-1">
                        {#each Array(char.rarity || 1) as _}
                            <Icon
                                name="strokeStar"
                                class="w-10 h-10"
                                style="color: {rarityColor}; stroke-opacity: 50%"
                            />
                        {/each}
                    </div>
                </div>

                <div class="flex flex-wrap gap-2 mt-2 items-center">
                    {#if char.weapon}
                        <div
                            class="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold tracking-wide text-gray-500 shadow-sm"
                            title={$t(`weapons.${char.weapon}`)}
                        >
                            <Icon
                                name={char.weapon}
                                class="w-4 h-4 text-gray-700"
                            />
                            <span
                                >{$t(`weapons.${char.weapon}`) ||
                                    char.weapon}</span
                            >
                        </div>
                    {/if}

                    {#if baseInfoLocale.tags && baseInfoLocale.tags.length > 0}
                        {#each baseInfoLocale.tags as tag}
                            <div
                                class="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold tracking-wide text-gray-500 shadow-sm"
                            >
                                {tag}
                            </div>
                        {/each}
                    {:else if char.tags}
                        {#each char.tags as tag}
                            <div
                                class="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold tracking-wide text-gray-500 shadow-sm"
                            >
                                {$t(`tags.${tag}`) || tag}
                            </div>
                        {/each}
                    {/if}
                </div>

                <div class="flex flex-col gap-2 mt-3 w-fit">
                    {#each [{ label: "bio.faction", localizedVal: baseInfoLocale.blocTag, rawVal: char.faction }, { label: "bio.race", localizedVal: baseInfoLocale.raceTag, rawVal: char.race }, { label: "bio.birth", localizedVal: null, rawVal: char.birthDate }] as item}
                        <div
                            class="flex items-stretch h-[32px] rounded-lg overflow-hidden shadow-sm text-sm w-full"
                        >
                            <div
                                class="bg-[#333] text-white px-4 flex items-center justify-center font-bold whitespace-nowrap min-w-[120px]"
                            >
                                {$t(item.label) || item.label}
                            </div>
                            <div
                                class="bg-[#E5E5E5] text-[#333] px-4 flex items-center font-medium whitespace-nowrap min-w-[150px] w-full flex-grow"
                            >
                                {#if item.localizedVal}
                                    {item.localizedVal}
                                {:else}
                                    {$t(
                                        `bioValues.${item.rawVal || "Unknown"}`,
                                    ) ||
                                        item.rawVal ||
                                        "-"}
                                {/if}
                            </div>
                        </div>
                    {/each}
                </div>
            </div>

            <div class="flex flex-col gap-2 w-full max-w-[240px]">
                {#each menuItems as item}
                    <Button
                        variant="menuButton"
                        active={activeTab === item.id}
                        onClick={() => (activeTab = item.id)}
                        className="transition-all duration-300 {activeTab !==
                        item.id
                            ? 'opacity-60 hover:opacity-100'
                            : 'scale-105'}"
                    >
                        {$t(item.label) || item.id}
                    </Button>
                {/each}
            </div>
        </div>

        <div class="flex flex-col gap-1 relative z-10 w-full flex-1 transition-all duration-300 {activeTab === 'about' ? '2xl:max-w-[400px] 2xl:ml-auto' : '2xl:max-w-[1000px]'}">
            {#if activeTab === "about"}
                <div
                    class="bg-white/90 backdrop-blur-sm dark:bg-[#383838] dark:border-[#444444] p-6 rounded-2xl shadow-xl border border-white/50 flex flex-col gap-6"
                >
                    <div class="flex flex-col gap-2">
                        <div class="flex items-baseline gap-1">
                            <span
                                class="text-6xl font-sdk font-bold dark:text-[#FDFDFD] text-[#21272C] leading-none"
                            >
                                {level}
                            </span>
                            <span
                                class="text-xl font-bold text-gray-400 dark:text-[#B7B6B3] uppercase"
                                >Lv.</span
                            >
                        </div>

                        <div class="w-full relative h-6 flex items-center">
                            <input
                                type="range"
                                min="1"
                                max={maxLevel}
                                step="1"
                                value={level}
                                on:input={handleInput}
                                class="w-full h-[2px] bg-[#333] dark:bg-[#7A7A7A] dark:accent-[#7A7A7A] appearance-none cursor-pointer accent-[#333]"
                            />
                        </div>
                    </div>

                    <div
                        class="bg-[#333] rounded h-[36px] flex dark:bg-[#424242] items-center justify-between px-4 text-white shadow-sm"
                    >
                        <span class="font-bold text-sm">
                            {$t("stats.attributes") || "Attributes"}
                        </span>

                        <button
                            on:click={() => (showStatsTable = true)}
                            class="flex items-center gap-2 text-sm font-normal text-gray-300 hover:text-white transition-colors"
                        >
                            <div class="w-[1px] h-4 bg-gray-500 mx-1"></div>
                            <span class="flex gap-0.5 items-center"
                                ><Icon name="table" class="w-4 h-4" />
                                {$t("stats.table") || "Table"}</span
                            >
                        </button>
                    </div>

                    <div class="flex flex-col gap-3 px-1">
                        {#each ["str", "agi", "int", "will"] as attr}
                            {@const styles = getAttrStyles(attr)}
                            {@const isMain = attr === charStats.mainAttribute}

                            <div
                                class="flex items-center justify-between h-[40px]"
                            >
                                <div class="flex items-center gap-3">
                                    <Tooltip
                                        text={$t(
                                            isMain
                                                ? "stats.mainAttr"
                                                : attr ===
                                                    charStats.secondaryAttribute
                                                  ? "stats.secAttr"
                                                  : "",
                                        )}
                                    >
                                        <div
                                            class="w-10 h-10 rounded flex items-center justify-center {styles.bg}"
                                        >
                                            <Icon
                                                name={attr}
                                                class="w-6 h-6 {styles.icon}"
                                            />
                                        </div>
                                    </Tooltip>
                                    <span
                                        class="text-lg font-bold text-[#21272C] dark:text-[#E4E4E4]"
                                    >
                                        {$t(`stats.${attr}`) || attr}
                                    </span>
                                </div>
                                <span
                                    class="text-2xl font-sdk font-bold text-[#21272C] dark:text-[#E4E4E4]"
                                >
                                    {calculateStat(
                                        charStats.attributes[attr],
                                        level,
                                    )}
                                </span>
                            </div>
                        {/each}

                        <div class="flex items-center justify-between h-[40px]">
                            <div class="flex items-center gap-3">
                                <div
                                    class="w-10 h-10 rounded bg-[#8F8F8F] flex items-center justify-center"
                                >
                                    <Icon
                                        name="hp"
                                        class="w-6 h-6 text-white"
                                    />
                                </div>
                                <span
                                    class="text-lg font-bold text-[#21272C] dark:text-[#E4E4E4]"
                                    >{$t("stats.baseHp") || "Base HP"}</span
                                >
                            </div>
                            <span
                                class="text-2xl font-sdk font-bold text-[#21272C] dark:text-[#E4E4E4]"
                            >
                                {calculateStat(charStats.hp, level)}
                            </span>
                        </div>

                        <div class="flex items-center justify-between h-[40px]">
                            <div class="flex items-center gap-3">
                                <div
                                    class="w-10 h-10 rounded bg-[#8F8F8F] flex items-center justify-center"
                                >
                                    <Icon
                                        name="atk"
                                        class="w-6 h-6 text-white"
                                    />
                                </div>
                                <span
                                    class="text-lg font-bold text-[#21272C] dark:text-[#E4E4E4]"
                                    >{$t("stats.baseAtk") || "Base ATK"}</span
                                >
                            </div>
                            <span
                                class="text-2xl font-sdk font-bold text-[#21272C] dark:text-[#E4E4E4]"
                            >
                                {calculateStat(charStats.atk, level)}
                            </span>
                        </div>
                    </div>
                </div>

                <div
                    class="mt-4 bg-white/90 backdrop-blur-sm p-6 dark:bg-[#383838] dark:border-[#444444] rounded-2xl shadow-xl border border-white/50 flex flex-col gap-4"
                >
                    <div
                        class="flex justify-between items-center border-b border-gray-100 pb-3 dark:border-[#444444]"
                    >
                        <div class="flex items-center gap-2">
                            <span
                                class="font-bold text-[#21272C] text-lg dark:text-[#FDFDFD]"
                            >
                                {$t("stats.materials") || "Materials"}
                            </span>
                        </div>
                    </div>

                    <div class="flex flex-wrap justify-center gap-4 pt-2">
                        {#if neededMaterials.length > 0}
                            {#each neededMaterials as mat (mat.id)}
                                <ItemCard item={mat} amount={mat.amount} />
                            {/each}
                        {:else}
                            <div
                                class="w-full text-center text-gray-400 text-sm py-4 italic"
                            >
                                {$t("stats.maxed") || "Max level reached"}
                            </div>
                        {/if}
                    </div>
                </div>
            {:else if activeTab === "skills"}
                <div class="flex flex-col gap-5 animate-fadeIn w-full">
                    <h2
                        class="text-3xl dark:text-[#FDFDFD] mb-1 font-bold text-[#21272C] drop-shadow-sm font-sdk text-left 2xl:text-right"
                    >
                        {$t("menu.combatSkills") || "Combat Skills"}
                    </h2>

                    {#each skillKeys as key}
                        {#if skillsValuesData[key]}
                            <div class="w-full flex justify-center">
                                <SkillCard
                                    charId={id}
                                    skillKey={key}
                                    element={char.element}
                                    skillData={skillsLocale[key] || {}}
                                    skillValues={skillsValuesData[key]}
                                    weaponType={char.weapon}
                                    materialsData={getSkillMaterials(
                                        charMaterials,
                                        key,
                                    )}
                                    {itemsDb}
                                />
                            </div>
                        {/if}
                    {/each}
                </div>
            {:else if activeTab === "talents"}
                <div class="flex flex-col gap-5 animate-fadeIn">
                    {#if skillsLocale?.indicator || charMaterials?.indicator}
                        <section>
                            <h2
                                class="text-3xl dark:text-[#FDFDFD] mb-2 font-bold text-[#21272C] mb-4 drop-shadow-sm font-sdk text-left 2xl:text-right "
                            >
                                {$t("menu.indicators") || "Indicators"}
                            </h2>
                            <TalentCard
                                charId={id}
                                type="indicator"
                                dataKey="indicator"
                                maxLevels={4}
                                materials={charMaterials?.indicator}
                                indicatorType={charDetails?.indicatorType}
                                localizedData={skillsLocale?.indicator}
                            />
                        </section>
                    {/if}

                    {#if skillsLocale?.talent1 || charMaterials?.talent1 || skillsLocale?.talent2 || charMaterials?.talent2}
                        <section>
                            <h2
                                class="text-3xl dark:text-[#FDFDFD] font-bold text-[#21272C] mb-4 drop-shadow-sm font-sdk text-left 2xl:text-right"
                            >
                                {$t("menu.talents") || "Talents"}
                            </h2>

                            <div class="flex flex-col gap-4">
                                {#if skillsLocale?.talent1 || charMaterials?.talent1}
                                    <TalentCard
                                        charId={id}
                                        type="talent"
                                        dataKey="talent1"
                                        maxLevels={2}
                                        materials={charMaterials?.talent1}
                                        indicatorType={charDetails?.indicatorType}
                                        localizedData={skillsLocale?.talent1}
                                        blackboard={charDetails?.blackboard}
                                    />
                                {/if}

                                {#if skillsLocale?.talent2 || charMaterials?.talent2}
                                    <TalentCard
                                        charId={id}
                                        type="talent"
                                        dataKey="talent2"
                                        maxLevels={2}
                                        materials={charMaterials?.talent2}
                                        localizedData={skillsLocale?.talent2}
                                        indicatorType={charDetails?.indicatorType}
                                        blackboard={charDetails?.blackboard}
                                    />
                                {/if}
                            </div>
                        </section>
                    {/if}

                    {#if charDetails?.facSkills}
                        {@const fac1 =
                            charDetails.facSkills.facSkill1_1 ||
                            charDetails.facSkills.facSkill1_2}
                        {@const fac2 =
                            charDetails.facSkills.facSkill2_1 ||
                            charDetails.facSkills.facSkill2_2}
                        {@const hasBase1 =
                            skillsLocale?.baseSkill1 ||
                            charMaterials?.baseSkill1}
                        {@const hasBase2 =
                            skillsLocale?.baseSkill2 ||
                            charMaterials?.baseSkill2}

                        {#if (fac1 && hasBase1) || (fac2 && hasBase2)}
                            <section>
                                <h2
                                    class="text-3xl dark:text-[#FDFDFD] font-bold text-[#21272C] mb-4 drop-shadow-sm font-sdk text-left 2xl:text-right"
                                >
                                    {$t("menu.baseSkills") || "Base Skills"}
                                </h2>

                                <div class="flex flex-col gap-4">
                                    {#if fac1 && hasBase1}
                                        <TalentCard
                                            charId={id}
                                            type="base"
                                            index={0}
                                            dataKey="baseSkill1"
                                            maxLevels={charDetails.facSkills
                                                .facSkill1_2
                                                ? 2
                                                : 1}
                                            levelsCount={charDetails.facSkills
                                                .facSkill1_2
                                                ? 2
                                                : 1}
                                            materials={charMaterials?.baseSkill1}
                                            localizedData={skillsLocale?.baseSkill1}
                                            facSkillImage={fac1.name}
                                            blackboard={charDetails?.blackboard}
                                            postfixes={[
                                                charDetails.facSkills
                                                    .facSkill1_1
                                                    ?.skillNamePostfix,
                                                charDetails.facSkills
                                                    .facSkill1_2
                                                    ?.skillNamePostfix,
                                            ].filter(Boolean)}
                                        />
                                    {/if}

                                    {#if fac2 && hasBase2}
                                        <TalentCard
                                            charId={id}
                                            type="base"
                                            index={1}
                                            dataKey="baseSkill2"
                                            maxLevels={charDetails.facSkills
                                                .facSkill2_2
                                                ? 2
                                                : 1}
                                            levelsCount={charDetails.facSkills
                                                .facSkill2_2
                                                ? 2
                                                : 1}
                                            materials={charMaterials?.baseSkill2}
                                            localizedData={skillsLocale?.baseSkill2}
                                            facSkillImage={fac2.name}
                                            blackboard={charDetails?.blackboard}
                                            postfixes={[
                                                charDetails.facSkills
                                                    .facSkill2_1
                                                    ?.skillNamePostfix,
                                                charDetails.facSkills
                                                    .facSkill2_2
                                                    ?.skillNamePostfix,
                                            ].filter(Boolean)}
                                        />
                                    {/if}
                                </div>
                            </section>
                        {/if}
                    {/if}
                </div>
            {:else if activeTab === "files"}
                <div class="flex flex-col gap-5 animate-fadeIn w-full">
                    <h2
                        class="text-3xl dark:text-[#FDFDFD] font-bold text-[#21272C] mb-4 drop-shadow-sm font-sdk text-left 2xl:text-right"
                    >
                        {$t("menu.files") || "Files"}
                    </h2>

                    {#if skillsLocale?.files}
                        {#each Object.entries(skillsLocale.files) as [fileKey, fileContent]}
                            <div
                                class="bg-white/90 backdrop-blur-sm p-6 rounded-2xl dark:bg-[#383838] dark:border-[#444444] shadow-xl border border-white/50 flex flex-col gap-3"
                            >
                                <h3
                                    class="font-bold text-lg text-[#21272C] dark:text-[#E4E4E4] capitalize border-b border-gray-100 dark:border-[#444444] pb-1"
                                >
                                    {fileKey}
                                </h3>
                                <div
                                    class="text-gray-700 dark:text-[#E4E4E4] whitespace-pre-wrap text-sm leading-relaxed font-medium"
                                >
                                    {@html parseRichText(fileContent)}
                                </div>
                            </div>
                        {/each}
                    {:else}
                        <div class="text-gray-500 text-center italic mt-10">
                            {$t("global.noData") || "No Data"}
                        </div>
                    {/if}
                </div>
            {:else if activeTab === "potentials"}
                <div class="flex flex-col gap-5 animate-fadeIn w-full">
                    <h2
                        class="text-3xl dark:text-[#FDFDFD] font-bold text-[#21272C] mb-4 drop-shadow-sm font-sdk text-left 2xl:text-right"
                    >
                        {$t("menu.potentials") || "Potentials"}
                    </h2>

                    {#if charLocale?.potentials}
                        <div class="flex flex-col gap-4">
                            {#each Object.entries(charLocale.potentials) as [potKey, potData]}
                                {@const bbData =
                                    charDetails.blackboard?.[potKey]}
                                <div
                                    class="bg-white/90 backdrop-blur-sm p-5 rounded-2xl dark:bg-[#383838] dark:border-[#444444] shadow-xl border border-white/50 flex gap-4 items-start transition-transform"
                                >
                                    <div
                                        class="bg-gradient-to-br from-[#F9B90C] to-[#E3A000] text-white font-black text-xl w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-white/20 mt-1"
                                    >
                                        {potKey.replace("potential", "")}
                                    </div>

                                    <div class="flex flex-col gap-1 w-full">
                                        <h3
                                            class="font-bold text-lg text-[#21272C] dark:text-[#E4E4E4] dark:border-[#444444] border-b border-gray-100 pb-1.5"
                                        >
                                            {potData.name}
                                        </h3>
                                        <div
                                            class="text-gray-700 text-sm dark:text-[#E4E4E4] leading-relaxed font-medium mt-1"
                                        >
                                            {@html parseRichText(
                                                interpolateBlackboard(
                                                    potData.description,
                                                    bbData,
                                                ),
                                            )}
                                        </div>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    {:else}
                        <div class="text-gray-500 text-center italic mt-10">
                            {$t("global.noData") || "No Data"}
                        </div>
                    {/if}
                </div>
            {:else if activeTab === "artwork"}
                <div class="flex flex-col gap-5 animate-fadeIn w-full">
                    <h2
                        class="text-3xl dark:text-[#FDFDFD] font-bold text-[#21272C] mb-4 drop-shadow-sm font-sdk text-left 2xl:text-right"
                    >
                        {$t("menu.artwork") || "Artwork"}
                    </h2>

                    {#if charLocale?.arts}
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {#each Object.entries(charLocale.arts) as [artKey, artData]}
                                {@const realKey =
                                    artKey === "potential6"
                                        ? "potential5"
                                        : artKey}

                                <div
                                    class="group flex flex-col shadow-xl rounded-2xl overflow-hidden border border-white/50 bg-white/90 backdrop-blur-sm transition-all hover:shadow-2xl dark:bg-[#383838] dark:border-[#444444]"
                                >
                                    <div
                                        role="button"
                                        tabindex="0"
                                        class="relative w-full aspect-[4/3] bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center overflow-hidden cursor-zoom-in outline-none focus:ring-4 focus:ring-gray-300"
                                        on:click={() =>
                                            (selectedArtId = `${id}_${realKey}`)}
                                        on:keydown={(e) =>
                                            (e.key === "Enter" ||
                                                e.key === " ") &&
                                            (selectedArtId = `${id}_${realKey}`)}
                                    >
                                        <Images
                                            id={`${id}_${realKey}`}
                                            variant="operator-art"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            alt={artData.name}
                                        />

                                        <div
                                            class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500 pointer-events-none"
                                        ></div>

                                        <div
                                            class="absolute top-3 left-3 bg-black/60 backdrop-blur text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm z-10 pointer-events-none"
                                        >
                                            Phase {realKey.replace(
                                                "potential",
                                                "",
                                            )}
                                        </div>

                                        <button
                                            class="absolute top-3 right-3 z-20 flex items-center justify-center w-8 h-8 bg-black/60 hover:bg-[#FFD800] text-white hover:text-black backdrop-blur rounded-full transition-all duration-300 shadow-md group/down"
                                            title="Скачать арт"
                                            on:click|stopPropagation={() => {
                                                const imageUrl = `/images/operators/arts/${id}_${realKey}.png`;
                                                const link =
                                                    document.createElement("a");
                                                link.href = imageUrl;
                                                link.download = `${id}_${realKey}.png`;
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                            }}
                                        >
                                            <Icon
                                                name="import"
                                                class="w-4 h-4 transition-transform group-hover/down:scale-110"
                                            />
                                        </button>
                                    </div>

                                    <div
                                        class="flex flex-col p-5 h-full dark:bg-[#383838] dark:border-[#444444]"
                                    >
                                        <div
                                            class="flex justify-between items-start gap-4 mb-3"
                                        >
                                            <h3
                                                class="font-bold text-xl text-[#21272C] dark:text-[#E4E4E4] leading-tight line-clamp-2"
                                            >
                                                {artData.name}
                                            </h3>
                                        </div>
                                        <p
                                            class="text-gray-600 text-sm dark:text-[#E4E4E4] leading-relaxed mb-4 flex-grow italic"
                                        >
                                            "{artData.description}"
                                        </p>
                                        <div
                                            class="flex items-center gap-2 mt-auto pt-3 border-t border-gray-100 dark:border-[#444444]"
                                        >
                                            <div
                                                class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 dark:text-[#B7B6B3] shrink-0"
                                            >
                                                <svg
                                                    width="12"
                                                    height="12"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    stroke-width="2"
                                                    ><path
                                                        d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                                                    ></path><circle
                                                        cx="12"
                                                        cy="7"
                                                        r="4"
                                                    ></circle></svg
                                                >
                                            </div>
                                            <span
                                                class="text-xs font-bold text-gray-500 dark:text-[#B7B6B3]"
                                            >
                                                {artData.author}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    {:else}
                        <div class="text-gray-500 text-center italic mt-10">
                            {$t("global.noData") || "No Data"}
                        </div>
                    {/if}
                </div>
            {:else}
                <div class="text-white text-xl font-bold mt-10">
                    WIP: {activeTab} section
                </div>
            {/if}
        </div>
    </div>
</div>

{#if showStatsTable}
    <div
        role="dialog"
        aria-modal="true"
        tabindex="-1"
        class="fixed inset-0 z-50 md:ml-[var(--sb-w)] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn outline-none"
        on:click={(e) => {
            if (e.target === e.currentTarget) {
                showStatsTable = false;
            }
        }}
        on:keydown={(e) => {
            if (e.key === "Escape") showStatsTable = false;
        }}
    >
        <div
            class="bg-white rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden cursor-auto"
        >
            <div
                class="flex items-center justify-between px-6 py-4 bg-[#21272C] text-white dark:bg-[#2C2C2C] shrink-0"
            >
                <h3 class="font-bold text-lg">
                    {$t("stats.attributesTable") || "Attributes Table (1-90)"}
                </h3>
                <div class="flex items-center gap-3">
                    <button
                        on:click={copyStatsTable}
                        class="flex items-center justify-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-md transition-colors text-white text-sm font-bold border border-white/20 shrink-0"
                    >
                        {#if isTableCopied}
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#FACC15"
                                stroke-width="3"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                class="animate-fadeIn"
                            >
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        {:else}
                            <Icon name="copy" class="w-4 h-4" />
                        {/if}
                        <span>{$t("common.copy") || "Copy"}</span>
                    </button>
                    <button
                        on:click={() => (showStatsTable = false)}
                        class="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <Icon name="close" class="w-6 h-6" />
                    </button>
                </div>
            </div>

            <div class="overflow-auto custom-scrollbar bg-white p-0">
                <table class="w-full text-center border-collapse">
                    <thead
                        class="bg-gray-100 dark:bg-[#383838] font-bold sticky top-0 z-10 shadow-sm text-sm"
                    >
                        <tr>
                            <th
                                class="py-3 px-2 border-b text-gray-600 dark:text-[#E4E4E4]"
                                >{$t("stats.level") || "Level"}</th
                            >
                            <th
                                class="py-3 px-2 border-b text-gray-600 dark:text-[#E4E4E4]"
                                >{$t("stats.baseHp") || "Base HP"}</th
                            >
                            <th
                                class="py-3 px-2 border-b text-gray-600 dark:text-[#E4E4E4]"
                                >{$t("stats.baseAtk") || "Base ATK"}</th
                            >

                            {#each ["str", "agi", "int", "will"] as attr}
                                {@const isMain =
                                    attr === charStats.mainAttribute}
                                {@const isSec =
                                    attr === charStats.secondaryAttribute}

                                <th class="py-3 px-2 border-b align-middle">
                                    <div class="flex justify-center w-full">
                                        <Tooltip
                                            text={$t(
                                                isMain
                                                    ? "stats.mainAttr"
                                                    : isSec
                                                      ? "stats.secAttr"
                                                      : "",
                                            )}
                                        >
                                            <div
                                                class="px-2 py-1 rounded transition-colors text-xs font-bold tracking-wider {isMain
                                                    ? 'bg-[#FFEE00] text-[#21272C]  shadow-sm'
                                                    : ''} {isSec
                                                    ? 'bg-[#3B3B3B] dark:bg-[#343434] text-white shadow-sm'
                                                    : ''} {!isMain && !isSec
                                                    ? 'text-gray-600 dark:text-[#E4E4E4]'
                                                    : ''}"
                                            >
                                                {$t(`stats.${attr}`) || attr}
                                            </div>
                                        </Tooltip>
                                    </div>
                                </th>
                            {/each}
                        </tr>
                    </thead>
                    <tbody class="text-sm font-nums text-gray-800">
                        {#each Array(90) as _, i}
                            {@const lvl = i + 1}
                            <tr
                                class="hover:bg-yellow-50 transition-colors border-b border-gray-50 even:bg-gray-50/50"
                            >
                                <td
                                    class="py-2 px-2 font-bold text-gray-400 bg-gray-50/50"
                                    >{lvl}</td
                                >
                                <td class="py-2 px-2 font-bold"
                                    >{calculateStat(charStats.hp, lvl)}</td
                                >
                                <td class="py-2 px-2 font-bold"
                                    >{calculateStat(charStats.atk, lvl)}</td
                                >
                                <td class="py-2 px-2"
                                    >{calculateStat(
                                        charStats.attributes.str,
                                        lvl,
                                    )}</td
                                >
                                <td class="py-2 px-2"
                                    >{calculateStat(
                                        charStats.attributes.agi,
                                        lvl,
                                    )}</td
                                >
                                <td class="py-2 px-2"
                                    >{calculateStat(
                                        charStats.attributes.int,
                                        lvl,
                                    )}</td
                                >
                                <td class="py-2 px-2"
                                    >{calculateStat(
                                        charStats.attributes.will,
                                        lvl,
                                    )}</td
                                >
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
{/if}
{#if selectedArtId}
    <div
        role="dialog"
        aria-modal="true"
        tabindex="-1"
        class="md:ml-[var(--sb-w)] fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 md:p-10 animate-fadeIn outline-none cursor-zoom-out overflow-hidden"
        on:click={() => (selectedArtId = null)}
        on:keydown={(e) =>
            (e.key === "Enter" || e.key === " ") && (selectedArtId = null)}
    >
        <div
            role="presentation"
            class="relative max-w-full max-h-full flex items-center justify-center cursor-auto"
            on:click|stopPropagation
            on:keydown|stopPropagation
        >
            <Images
                id={selectedArtId}
                variant="operator-art"
                className="max-w-full max-h-full object-contain rounded-lg drop-shadow-2xl select-none"
            />
            <button
                class="absolute top-0 right-0 md:top-4 md:right-4 p-3 bg-black/40 hover:bg-[#FFD800] text-white rounded-full transition-colors backdrop-blur-sm z-10"
                on:click={() => (selectedArtId = null)}
            >
                <Icon name="close" class="w-6 h-6" />
            </button>
        </div>
    </div>
{/if}

<style>
    .mask-image-gradient {
        mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
        -webkit-mask-image: linear-gradient(
            to bottom,
            black 80%,
            transparent 100%
        );
    }
</style>
