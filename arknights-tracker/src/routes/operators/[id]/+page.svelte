<script>
    import { page } from "$app/stores";
    import { t } from "$lib/i18n"; // Убрал goto, если не используется
    import { currentLocale } from "$lib/stores/locale";

    // Данные предметов
    import { progression } from "$lib/data/items/progression.js";
    import { currencies } from "$lib/data/items/currencies.js";
    // Данные персонажей (общие)
    import { characters } from "$lib/data/characters.js";

    // Компоненты
    import Icon from "$lib/components/Icons.svelte";
    import Tooltip from "$lib/components/Tooltip.svelte";
    import ItemCard from "$lib/components/ItemCard.svelte";
    import Button from "$lib/components/Button.svelte";
    import SkillCard from "$lib/components/SkillCard.svelte";

    // Скиллы
    // Получаем данные значений скиллов (из charDetails.skills)
    $: skillsValuesData = charDetails.skills || {};
    // Список ключей скиллов, которые мы хотим отобразить
    const skillKeys = ["basicAttack", "battleSkill", "comboSkill", "ultimate"];

    // Локализация
    const localeModulesEn = import.meta.glob(
        "$lib/locales/en/characters/*.json",
        { eager: true },
    );
    const localeModulesRu = import.meta.glob(
        "$lib/locales/ru/characters/*.json",
        { eager: true },
    );
    $: charLocale = (() => {
        // Определяем папку языка (en или ru)
        // Если локаль не ru, берем en (фоллбек)
        const lang = $currentLocale === "ru" ? "ru" : "en";

        const path = `/src/lib/locales/${lang}/characters/${id}.json`;

        // Выбираем правильный набор модулей
        const modules = lang === "ru" ? localeModulesRu : localeModulesEn;

        // Возвращаем дефолтный экспорт или пустой объект
        return modules[path]?.default || {};
    })();
    $: skillsLocale = charLocale.skills || {};

    // 1. БАЗОВЫЕ ДАННЫЕ
    $: id = $page.params.id;
    $: char = Object.values(characters).find((c) => c.id === id) || {};

    const dataModules = import.meta.glob("$lib/data/charactersData/*.json", {
        eager: true,
    });

    // ДЕТАЛЬНЫЕ ДАННЫЕ (ИЗ JSON)
    // Используем || {}, чтобы не было ошибок при загрузке
    $: charDetails = (() => {
        // Формируем путь, как он выглядит для Vite
        // Важно: путь должен совпадать буква в букву с тем, где лежат файлы
        const path = `/src/lib/data/charactersData/${id}.json`;

        const mod = dataModules[path];
        if (mod) {
            return mod.default || mod; // JSON контент
        }
        return {};
    })();

    // ЕДИНАЯ БАЗА ПРЕДМЕТОВ
    $: itemsDb = [...(progression || []), ...(currencies || [])];

    // МАТЕРИАЛЫ
    $: charMaterials = charDetails.materials || {};

    // 2. СТАТЫ (ТЕПЕРЬ РЕАКТИВНЫЕ)
    // Мы формируем объект charStats на основе загруженных данных (charDetails)
    // Если данных нет, подставляем нули/дефолт, чтобы сайт не падал
    $: charStats = {
        mainAttribute: charDetails.mainAttribute || "int",
        secondaryAttribute: charDetails.secondaryAttribute || "will",
        hp: charDetails.hp || [0, 0, 0],
        atk: charDetails.atk || [0, 0, 0],
        def: charDetails.def || [0, 0, 0],
        attributes: {
            str: charDetails.str?.[0] || 0,
            agi: charDetails.agi?.[0] || 0,
            int: charDetails.int?.[0] || 0,
            will: charDetails.will?.[0] || 0,
        },
    };

    // Хелпер для редкости (звезды)
    function getRarityColor(rarity) {
        if (rarity === 6) return "#F4700C";
        if (rarity === 5) return "#F9B90C";
        if (rarity === 4) return "#9253F1";
        return "#888";
    }

    // Реактивная переменная, чтобы использовать в HTML
    $: rarityColor = getRarityColor(char.rarity || 1);

    // 3. СОСТОЯНИЕ UI
    let activeTab = "about"; // Текущая вкладка меню
    let maxLevel = 99;
    let level = maxLevel; // Дефолт = 99
    let isTotalMode = true; // Кнопка Total

    // Меню навигации слева
    const menuItems = [
        { id: "about", label: "menu.about" },
        { id: "talents", label: "menu.talents" },
        { id: "potentials", label: "menu.potentials" },
        { id: "skills", label: "menu.combatSkills" },
        { id: "artwork", label: "menu.artwork" },
        { id: "files", label: "menu.files" },
        { id: "audio", label: "menu.audio" },
    ];

    // Хелпер для интерполяции статов (HP/ATK)
    function calculateStat(statArray, currentLvl) {
        if (!statArray || statArray.length === 0) return "-";
        const min = parseFloat(statArray[0]);
        const max = parseFloat(statArray[statArray.length - 1]);
        if (currentLvl === 1) return Math.round(min);
        if (currentLvl === maxLevel) return Math.round(max);
        const percent = (currentLvl - 1) / (maxLevel - 1);
        return Math.round(min + (max - min) * percent);
    }

    // Хелпер стилей атрибутов
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

    // 4. ЛОГИКА ПОДСЧЕТА МАТЕРИАЛОВ
    $: neededMaterials = (() => {
        if (!charMaterials || Object.keys(charMaterials).length === 0)
            return [];

        const required = {};
        let phasesNeeded = [];

        // Пороги возвышения
        const t1 = { cap: 20, key: "ascention1" };
        const t2 = { cap: 40, key: "ascention2" };
        const t3 = { cap: 60, key: "ascention3" };
        const t4 = { cap: 80, key: "ascention4" };

        if (isTotalMode) {
            // РЕЖИМ TOTAL: Накопительный итог "С нуля до Цели"
            // Если цель >= 40, значит мы должны были купить asc1
            if (level >= t1.cap) phasesNeeded.push(t1.key);
            if (level >= t2.cap) phasesNeeded.push(t2.key);
            if (level >= t3.cap) phasesNeeded.push(t3.key);
            if (level >= t4.cap) phasesNeeded.push(t4.key);

            // Если level = 1, ни одно условие не сработает -> массив пуст. Это верно, затрат 0.
        } else {
            // РЕЖИМ SINGLE: Материалы конкретного этапа
            // Показываем то, что актуально для диапазона, где стоит слайдер

            if (level <= 20) {
                phasesNeeded.push(t1.key);
            } else if (level <= 40) {
                phasesNeeded.push(t2.key);
            } else if (level <= 60) {
                phasesNeeded.push(t3.key);
            } else {
                // Все что выше 80 (включая 90-99) требует последнего возвышения
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

    // отслеживание Shift
    let shiftPressed = false;

    function handleKeydown(e) {
        if (e.key === "Shift") shiftPressed = true;
    }

    function handleKeyup(e) {
        if (e.key === "Shift") shiftPressed = false;
    }

    // Обработчик изменения слайдера
    function handleInput(e) {
        let val = parseInt(e.target.value);

        if (shiftPressed) {
            // Округляем до ближайшего десятка
            // Math.round(44/10)*10 -> 4.4 -> 4 -> 40
            // Math.round(46/10)*10 -> 4.6 -> 5 -> 50
            val = Math.round(val / 10) * 10;

            // Защита границ (чтобы не улететь в 0 или 100, если макс 99)
            if (val < 1) val = 1; // Или 1, если мин 1
            if (val > maxLevel) val = maxLevel;
        }

        level = val;
    }
</script>

<svelte:window on:keydown={handleKeydown} on:keyup={handleKeyup} />

<div
    class="min-h-screen bg-[#F9F9F9] relative overflow-hidden flex flex-col p-8"
>
    <!-- === ФОНОВЫЙ SPLASH ART (По центру) === -->
    <!-- fixed или absolute, чтобы был под контентом, но над фоном -->
    <div
        class="fixed inset-0 flex items-center justify-center pointer-events-none z-0 transition-opacity duration-500 {activeTab ===
        'about'
            ? 'opacity-100'
            : 'opacity-100'}"
    >
        <!-- Сдвигаем вправо (translate-x), так как меню слева занимает место -->
        <img
            src={char.splashArt}
            alt="Splash"
            class="h-[110%] max-w-none object-cover opacity-20 lg:opacity-100 mask-image-gradient"
        />
        <!-- Градиент, чтобы текст читался (опционально) -->
        <div
            class="absolute inset-0 bg-gradient-to-r from-[#F9F9F9] via-[#F9F9F9]/80 to-transparent lg:via-[#F9F9F9]/40 z-10"
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
                        <span class="font-bold text-sm"
                            >{$t("stats.attributes") || "Attributes"}</span
                        >
                        <button
                            class="flex items-center gap-2 text-sm font-normal text-gray-300 hover:text-white transition-colors"
                        >
                            <div class="w-[1px] h-4 bg-gray-500 mx-1"></div>
                            {$t("stats.table") || "Table"}
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
                                    {charStats.attributes[attr]}
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
                            >XP Items (Coming Soon)</span
                        >
                    </div>
                </div>
            {:else if activeTab === "skills"}
                <!-- === ВКЛАДКА SKILLS (Новый контент) === -->

                <div class="flex flex-col gap-6 animate-fadeIn w-full">
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
            {:else}
                <!-- Заглушка для других вкладок -->
                <div class="text-white opacity-50 text-xl font-bold mt-10">
                    WIP: {activeTab} section
                </div>
            {/if}
        </div>
    </div>
</div>

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
