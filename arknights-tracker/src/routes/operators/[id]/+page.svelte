<script>
    import { page } from "$app/stores";
    import { t } from "$lib/i18n"; // Убрал goto, если не используется
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

    $: skillsValuesData = charDetails.skills || {};
    const skillKeys = ["basicAttack", "battleSkill", "comboSkill", "ultimate"];

    const localeModulesEn = import.meta.glob(
        "$lib/locales/en/characters/*.json",
        { eager: true },
    );
    const localeModulesRu = import.meta.glob(
        "$lib/locales/ru/characters/*.json",
        { eager: true },
    );
    $: charLocale = (() => {
        const lang = $currentLocale === "ru" ? "ru" : "en";
        const path = `/src/lib/locales/${lang}/characters/${id}.json`;
        const modules = lang === "ru" ? localeModulesRu : localeModulesEn;
        return modules[path]?.default || {};
    })();
    $: skillsLocale = charLocale.skills || {};

    $: id = $page.params.id;
    $: char = Object.values(characters).find((c) => c.id === id) || {};

    const dataModules = import.meta.glob(
        "/src/lib/data/charactersData/*.json",
        {
            eager: true,
        },
    );

    $: charDetails = (() => {
        if (!id) return {};

        // Ищем ключ
        const foundKey = Object.keys(dataModules).find((k) =>
            k.endsWith(`/${id}.json`),
        );

        const mod = foundKey ? dataModules[foundKey] : null;

        if (mod) {
            // 3. Ура, файл есть. Возвращаем.
            return mod.default || mod;
        }

        console.warn(`Character data not found for ID: ${id}`);
        return {};
    })();

    $: itemsDb = [...(progression || []), ...(currencies || [])];

    $: charMaterials = charDetails.materials || {};

    $: charStats = {
        mainAttribute: charDetails.mainAttribute,
        secondaryAttribute: charDetails.secondaryAttribute, // Проверь, нет ли опечатки в JSON (secondaary)

        // Тут оставляем массивы как есть
        hp: charDetails.hp || [0, 0, 0],
        atk: charDetails.atk || [0, 0, 0],
        def: charDetails.def || [0, 0, 0],

        attributes: {
            // ИСПРАВЛЕНИЕ: Убираем ?.[0].
            // Теперь мы храним весь массив [9, 10, 11...], а не только число 9.
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
    let isTotalMode = true;

    const menuItems = [
        { id: "about", label: "menu.about" },
        { id: "talents", label: "menu.talents" },
        { id: "potentials", label: "menu.potentials" },
        { id: "skills", label: "menu.combatSkills" },
        { id: "artwork", label: "menu.artwork" },
        { id: "files", label: "menu.files" },
        { id: "audio", label: "menu.audio" },
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
    }

    function handleKeyup(e) {
        if (e.key === "Shift") shiftPressed = false;
    }

    function handleInput(e) {
        let val = parseInt(e.target.value);

        if (shiftPressed) {
            val = Math.round(val / 10) * 10;
            if (val < 1) val = 1; // Или 1, если мин 1
            if (val > maxLevel) val = maxLevel;
        }

        level = val;
    }

    let showStatsTable = false;

    async function copyStatsTable() {
        // 1. Заголовки (Убрали DEF)
        const headers = [
            $t("stats.level") || "Level",
            "HP", "ATK", /* DEF удален */ "STR", "AGI", "INT", "WILL"
        ];
        
        // 2. Сбор данных
        let textData = headers.join("\t") + "\n";

        for (let i = 1; i <= 90; i++) {
            const row = [
                i,
                calculateStat(charStats.hp, i),
                calculateStat(charStats.atk, i),
                // calculateStat(charStats.def, i), // Удалено
                calculateStat(charStats.attributes.str, i),
                calculateStat(charStats.attributes.agi, i),
                calculateStat(charStats.attributes.int, i),
                calculateStat(charStats.attributes.will, i)
            ];
            textData += row.join("\t") + "\n";
        }

        try {
            await navigator.clipboard.writeText(textData);
            console.log("Stats copied to clipboard"); 
        } catch (err) {
            console.error("Failed to copy", err);
        }
    }
</script>

<svelte:window on:keydown={handleKeydown} on:keyup={handleKeyup} />

<div
    class="min-h-screen bg-[#F9F9F9] relative overflow-hidden flex flex-col p-8"
>
    <!-- === ФОНОВЫЙ SPLASH ART (По центру) === -->
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
        <!-- Градиент, чтобы текст читался (опционально) -->
        <div
            class="absolute inset-0 bg-gradient-to-r from-[#F9F9F9] via-[#F9F9F9]/80 to-transparent lg:via-[#F9F9F9]/40 z-10 opacity-40"
        ></div>
    </div>

    <!-- === КОНТЕНТ === -->
    <div
        class="relative z-20 w-full max-w-[1800px] mx-auto grid grid-cols-1 h-full
        {activeTab === 'about'
            ? 'lg:grid-cols-[400px_1fr_360px]'
            : 'lg:grid-cols-[400px_minmax(0,1fr)_900px]'}"
    >
        <!-- ================= ЛЕВАЯ КОЛОНКА ================= -->
        <div class="flex flex-col gap-2">
            <!-- 1. HEADER & INFO -->
            <div class="flex flex-col gap-1">
                <!-- Кнопка Назад -->
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

                <!-- Имя -->
                <h1 class="font-sdk text-5xl font-bold text-[#21272C]">
                    {$t(`characters.${id}`) || char.name}
                </h1>

                <!-- Иконки (Class / Element / Rarity) -->
                <div class="flex items-center gap-4 mt-2">
                    <!-- Class -->
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

                    <!-- Element (Уменьшил контейнер до w-10, иконка w-7) -->
                    <Tooltip text={$t(`elements.${char.element}`)}>
                        <div
                            class="w-10 h-10 rounded flex items-center justify-center shadow-sm"
                        >
                            <!-- Иконка покрупнее относительно контейнера -->
                            <Icon
                                name={char.element}
                                class="w-7 h-7 text-white"
                            />
                        </div>
                    </Tooltip>

                    <div class="w-[1px] h-8 bg-gray-300"></div>

                    <!-- Rarity (strokeStar) -->
                    <div class="flex items-center gap-0.5">
                        {#each Array(char.rarity || 1) as _}
                            <Icon
                                name="strokeStar"
                                class="w-6 h-6"
                                style="color: {rarityColor}"
                            />
                        {/each}
                    </div>
                </div>

                <!-- Теги (Оружие + Gameplay Tags) -->
                <!-- Обновленные стили: без капса, больше скругление (rounded-lg) -->
                <div class="flex flex-wrap gap-2 mt-2 items-center">
                    <!-- Оружие -->
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

                    <!-- Gameplay Tags -->
                    {#if char.tags}
                        {#each char.tags as tag}
                            <div
                                class="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold tracking-wide text-gray-500 shadow-sm"
                            >
                                {$t(`tags.${tag}`) || tag}
                            </div>
                        {/each}
                    {/if}
                </div>

                <!-- Био Инфо -->
                <div class="flex flex-col gap-2 mt-4 w-fit">
                    {#each [{ label: "bio.faction", val: char.faction }, { label: "bio.race", val: char.race }, { label: "bio.birth", val: char.birthDate }] as item}
                        <!-- Контейнер строки: убрал border с контейнера, чтобы избежать артефактов -->
                        <!-- Скругление (rounded-lg) и overflow-hidden обрежут внутренние блоки -->
                        <div
                            class="flex items-stretch h-[32px] rounded-lg overflow-hidden shadow-sm text-sm border w-full"
                        >
                            <!-- Заголовок (Черный) -->
                            <div
                                class="bg-[#333] text-white px-4 flex items-center justify-center font-bold whitespace-nowrap min-w-[120px]"
                            >
                                {$t(item.label) || item.label}
                            </div>

                            <!-- Значение (Серый) -->
                            <!-- w-full и flex-grow заставят его заполнить все место до конца границы -->
                            <div
                                class="bg-[#E5E5E5] text-[#333] px-4 flex items-center font-medium whitespace-nowrap min-w-[150px] w-full flex-grow"
                            >
                                {$t(`bioValues.${item.val || "Unknown"}`) ||
                                    item.val ||
                                    "-"}
                            </div>
                        </div>
                    {/each}
                </div>
            </div>

            <!-- 2. НАВИГАЦИЯ (МЕНЮ) -->
            <div class="flex flex-col gap-3 mt-6 w-[240px]">
                {#each menuItems as item}
                    <!-- Убираем обертку relative и полоску снаружи, все теперь внутри кнопки -->

                    <Button
                        variant="menuButton"
                        active={activeTab === item.id}
                        onClick={() => (activeTab = item.id)}
                        className="transition-all duration-300 {activeTab !==
                        item.id
                            ? 'opacity-60 hover:opacity-100'
                            : 'scale-105'}"
                    >
                        <!-- Текст внутри кнопки -->
                        <!-- Button сам поставит его справа снизу -->
                        {$t(item.label) || item.id}
                    </Button>
                {/each}
            </div>
        </div>
        <!-- Конец левой колонки -->

        <!-- ================= ЦЕНТР (ПУСТОТА ДЛЯ АРТА) ================= -->
        <!-- Арт уже лежит background-ом, этот блок просто занимает место в гриде -->
        <div class="hidden lg:block pointer-events-none"></div>

        <!-- ПРАВАЯ КОЛОНКА -->
        <div class="flex flex-col gap-1 relative z-10 w-full">
            {#if activeTab === "about"}
                <!-- Белый контейнер-карточка -->
                <div
                    class="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/50 flex flex-col gap-6"
                >
                    <!-- Заголовок + Слайдер -->
                    <div class="flex flex-col gap-2">
                        <div class="flex items-baseline gap-1">
                            <span
                                class="text-6xl font-sdk font-bold text-[#21272C] leading-none"
                            >
                                {level}
                            </span>
                            <span
                                class="text-xl font-bold text-gray-400 uppercase"
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
                                class="w-full h-[2px] bg-[#333] appearance-none cursor-pointer accent-[#333]"
                            />
                        </div>
                    </div>

                    <!-- Attributes Header Bar -->
                    <div
                        class="bg-[#333] rounded h-[36px] flex items-center justify-between px-4 text-white shadow-sm"
                    >
                        <span class="font-bold text-sm">
                            {$t("stats.attributes") || "Attributes"}
                        </span>

                        <button
                            on:click={() => (showStatsTable = true)}
                            class="flex items-center gap-2 text-sm font-normal text-gray-300 hover:text-white transition-colors"
                        >
                            <div class="w-[1px] h-4 bg-gray-500 mx-1"></div>
                            <span>{$t("stats.table") || "Table"}</span>
                        </button>
                    </div>

                    <!-- Список Атрибутов -->
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
                                        <!-- Цвет фона и стиль иконки берутся из функции -->
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
                                        class="text-lg font-bold text-[#21272C]"
                                    >
                                        {$t(`stats.${attr}`) || attr}
                                    </span>
                                </div>
                                <span
                                    class="text-2xl font-sdk font-bold text-[#21272C]"
                                >
                                    {calculateStat(
                                        charStats.attributes[attr],
                                        level,
                                    )}
                                </span>
                            </div>
                        {/each}

                        <!-- HP (Цвет bg-[#8F8F8F] как у обычных) -->
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
                                <span class="text-lg font-bold text-[#21272C]"
                                    >{$t("stats.baseHp") || "Base HP"}</span
                                >
                            </div>
                            <span
                                class="text-2xl font-sdk font-bold text-[#21272C]"
                            >
                                {calculateStat(charStats.hp, level)}
                            </span>
                        </div>

                        <!-- ATK (Цвет bg-[#8F8F8F] как у обычных) -->
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
                                <span class="text-lg font-bold text-[#21272C]"
                                    >{$t("stats.baseAtk") || "Base ATK"}</span
                                >
                            </div>
                            <span
                                class="text-2xl font-sdk font-bold text-[#21272C]"
                            >
                                {calculateStat(charStats.atk, level)}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- === НОВАЯ СЕКЦИЯ: МАТЕРИАЛЫ ВОЗВЫШЕНИЯ === -->
                <div
                    class="mt-4 bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/50 flex flex-col gap-4"
                >
                    <!-- Заголовок + Тоггл + Калькулятор -->
                    <div
                        class="flex justify-between items-center border-b border-gray-100 pb-3"
                    >
                        <div class="flex items-center gap-2">
                            <span class="font-bold text-[#21272C] text-lg">
                                {$t("stats.materials") || "Materials"}
                            </span>

                            <!-- Переключатель Total -->
                            <button
                                class="ml-2 px-3 py-1 rounded-full text-xs font-bold transition-all border
                            {isTotalMode
                                    ? 'bg-[#21272C] text-white border-[#21272C]'
                                    : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400'}"
                                on:click={() => (isTotalMode = !isTotalMode)}
                            >
                                {$t("systemNames.total") || "Total"}
                            </button>
                        </div>

                        <!-- Кнопка Калькулятора (пока заглушка) -->
                        <button
                            class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-gray-600"
                            title="Calculator"
                        >
                            <Icon name="calc" class="w-4 h-4" />
                            <!-- Добавь иконку calc или используй svg -->
                            <!-- Если нет иконки, просто SVG -->
                            {#if !$$slots.icon}
                                <svg
                                    class="w-4 h-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    ><path
                                        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z"
                                    /></svg
                                >
                            {/if}
                        </button>
                    </div>

                    <!-- Грид Предметов -->
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

                    <!-- Плейсхолдер для XP предметов -->
                    <div
                        class="mt-2 pt-3 border-t border-gray-100 flex items-center gap-2 opacity-50"
                    >
                        <div class="w-8 h-8 rounded bg-gray-200"></div>
                        <span class="text-xs text-gray-400 font-bold uppercase"
                            >XP wip</span
                        >
                    </div>
                </div>
            {:else if activeTab === "skills"}
                <!-- === ВКЛАДКА SKILLS (Новый контент) === -->

                <div class="flex flex-col gap-5 animate-fadeIn w-full">
                    <h2
                        class="text-3xl font-bold text-[#21272C] mb-4 drop-shadow-sm font-sdk text-end"
                    >
                        {$t("menu.combatSkills") || "Combat Skills"}
                    </h2>

                    {#each skillKeys as key}
                        {#if skillsValuesData[key]}
                            <div class="w-full flex justify-center">
                                <SkillCard
                                    skillKey={key}
                                    skillData={skillsLocale[key] || {}}
                                    skillValues={skillsValuesData[key]}
                                    materialsData={charMaterials}
                                    {itemsDb}
                                />
                            </div>
                        {/if}
                    {/each}
                </div>
            {:else if activeTab === "talents"}
                <div class="flex flex-col gap-5 animate-fadeIn">
                    <section>
                        {#if skillsLocale?.indicator || charMaterials?.indicator}
                            <h2
                                class="text-3xl font-bold text-[#21272C] mb-4 drop-shadow-sm font-sdk text-end"
                            >
                                {$t("menu.indicators") || "Indicators"}
                            </h2>
                            <TalentCard
                                charId={id}
                                type="indicator"
                                dataKey="indicator"
                                maxLevels={4}
                                materials={charMaterials?.indicator}
                                localizedData={skillsLocale?.indicator}
                            />
                        {/if}
                    </section>

                    <section>
                        {#if skillsLocale?.talent1 || charMaterials?.talent1 || skillsLocale?.talent2 || charMaterials?.talent2}
                            <h2
                                class="text-3xl font-bold text-[#21272C] mb-4 drop-shadow-sm font-sdk text-end"
                            >
                                {$t("menu.talents") || "Talents"}
                            </h2>
                        {/if}

                        <div class="flex flex-col gap-4">
                            {#if skillsLocale?.talent1 || charMaterials?.talent1}
                                <TalentCard
                                    charId={id}
                                    type="talent"
                                    dataKey="talent1"
                                    maxLevels={2}
                                    materials={charMaterials?.talent1}
                                    localizedData={skillsLocale?.talent1}
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
                                />
                            {/if}
                        </div>
                    </section>

                    <section>
                        {#if skillsLocale?.baseSkill1 || charMaterials?.baseSkill1 || skillsLocale?.baseSkill2 || charMaterials?.baseSkill2}
                            <h2
                                class="text-3xl font-bold text-[#21272C] mb-4 drop-shadow-sm font-sdk text-end"
                            >
                                {$t("menu.baseSkills") || "Base Skills"}
                            </h2>
                        {/if}

                        <div class="flex flex-col gap-4">
                            {#if skillsLocale?.baseSkill1 || charMaterials?.baseSkill1}
                                <TalentCard
                                    charId={id}
                                    type="base"
                                    index={0}
                                    dataKey="baseSkill1"
                                    maxLevels={2}
                                    materials={charMaterials?.baseSkill1}
                                    localizedData={skillsLocale?.baseSkill1}
                                />
                            {/if}

                            {#if skillsLocale?.baseSkill2 || charMaterials?.baseSkill2}
                                <TalentCard
                                    charId={id}
                                    type="base"
                                    index={1}
                                    dataKey="baseSkill2"
                                    maxLevels={2}
                                    materials={charMaterials?.baseSkill2}
                                    localizedData={skillsLocale?.baseSkill2}
                                />
                            {/if}
                        </div>
                    </section>
                </div>
            {:else}
                <!-- Заглушка для других вкладок -->
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
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn outline-none"
        on:click={(e) => {
            // "Нормальная" проверка: кликнули ли мы по самому фону?
            if (e.target === e.currentTarget) {
                showStatsTable = false;
            }
        }}
        on:keydown={(e) => { 
            if (e.key === 'Escape') showStatsTable = false; 
        }}
    >
        <div 
            class="bg-white rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden cursor-auto"
        >
            <div class="flex items-center justify-between px-6 py-4 bg-[#21272C] text-white shrink-0">
                <h3 class="font-bold text-lg">
                    {$t("stats.attributesTable") || "Attributes Table (1-90)"}
                </h3>
                
                <div class="flex items-center gap-3">
                    <button 
                        on:click={copyStatsTable}
                        class="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded transition-colors text-sm font-bold border border-white/20"
                    >
                        <Icon name="copy" class="w-4 h-4" />
                        {$t("common.copy") || "Copy"}
                    </button>

                    <button 
                        on:click={() => showStatsTable = false}
                        class="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <Icon name="close" class="w-6 h-6" /> 
                    </button>
                </div>
            </div>

            <div class="overflow-auto custom-scrollbar bg-white p-0">
                <table class="w-full text-center border-collapse">
                    <thead class="bg-gray-100 font-bold sticky top-0 z-10 shadow-sm text-sm">
                        <tr>
                            <th class="py-3 px-2 border-b text-gray-600">{$t("stats.level") || "Level"}</th>
                            <th class="py-3 px-2 border-b text-gray-600">{$t("stats.baseHp") || "Base HP"}</th>
                            <th class="py-3 px-2 border-b text-gray-600">{$t("stats.baseAtk") || "Base ATK"}</th>

                            {#each ["str", "agi", "int", "will"] as attr}
                                {@const isMain = attr === charStats.mainAttribute}
                                {@const isSec = attr === charStats.secondaryAttribute}
                                
                                <th class="py-3 px-2 border-b align-middle">
                                    <div class="flex justify-center w-full">
                                        <Tooltip 
                                            text={$t(isMain ? "stats.mainAttr" : isSec ? "stats.secAttr" : "")}
                                        >
                                            <div class="
                                                px-2 py-1 rounded transition-colors text-xs font-bold tracking-wider
                                                {isMain ? 'bg-[#FFEE00] text-[#21272C] shadow-sm' : ''}
                                                {isSec ? 'bg-[#3B3B3B] text-white shadow-sm' : ''}
                                                {!isMain && !isSec ? 'text-gray-600' : ''}
                                            ">
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
                            <tr class="hover:bg-yellow-50 transition-colors border-b border-gray-50 even:bg-gray-50/50">
                                <td class="py-2 px-2 font-bold text-gray-400 bg-gray-50/50">{lvl}</td>
                                <td class="py-2 px-2 font-bold">{calculateStat(charStats.hp, lvl)}</td>
                                <td class="py-2 px-2 font-bold">{calculateStat(charStats.atk, lvl)}</td>
                                <td class="py-2 px-2">{calculateStat(charStats.attributes.str, lvl)}</td>
                                <td class="py-2 px-2">{calculateStat(charStats.attributes.agi, lvl)}</td>
                                <td class="py-2 px-2">{calculateStat(charStats.attributes.int, lvl)}</td>
                                <td class="py-2 px-2">{calculateStat(charStats.attributes.will, lvl)}</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
{/if}

<style>
    /* Маска для плавного исчезновения ног персонажа */
    .mask-image-gradient {
        mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
        -webkit-mask-image: linear-gradient(
            to bottom,
            black 80%,
            transparent 100%
        );
    }
</style>
