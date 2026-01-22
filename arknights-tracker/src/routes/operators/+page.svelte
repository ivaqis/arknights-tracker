<!-- src/routes/operators/+page.svelte -->
<script>
    import { goto } from "$app/navigation";
    import { t } from "$lib/i18n";
    import { characters } from "$lib/data/characters.js";
    import OperatorCard from "$lib/components/OperatorCard.svelte";
    import DataToolbar from "$lib/components/DataToolbar.svelte"; // Импорт тулбара
    import Icon from "$lib/components/Icons.svelte";

    // Исходный список (массив)
    const allOperators = Object.values(characters || {}).filter(
        (op) => op && op.id,
    );

    // === СОСТОЯНИЕ ФИЛЬТРОВ И СОРТИРОВКИ ===
    let sortField = "rarity";
    let sortDirection = "desc";
    let searchQuery = "";
    let filters = {
        rarity: [6, 5, 4],
        class: [
            "guard",
            "vanguard",
            "caster",
            "defender",
            "supporter",
            "striker",
        ],
        element: ["cryo", "physical", "nature", "heat", "electric"],
        weapon: ["sword", "polearm", "artsUnit", "greatSword", "handcannon"]
    };

    // === РЕАКТИВНЫЙ СПИСОК (ФИЛЬТРАЦИЯ + СОРТИРОВКА) ===
    $: filteredOperators = allOperators
        // 1. Фильтрация
        .filter((op) => {
            // Поиск по имени (с учетом перевода можно усложнить, пока по ID/Name)
            const query = searchQuery.toLowerCase();
            const matchesSearch =
                !query ||
                op.name.toLowerCase().includes(query) ||
                (op.id && op.id.toLowerCase().includes(query)) ||
                // Поиск по переводу (если нужно)
                ($t(`characters.${op.id}`) || "").toLowerCase().includes(query);

            if (!matchesSearch) return false;

            // Фильтры (если массив пуст = все, иначе ищем совпадение)
            const matchesRarity =
                filters.rarity.length === 0 ||
                filters.rarity.includes(op.rarity);
            // Нормализация классов для сравнения (guard == Guard)
            const matchesClass =
                filters.class.length === 0 ||
                filters.class.some(
                    (c) => c.toLowerCase() === op.class?.toLowerCase(),
                );
            const matchesElement =
                filters.element.length === 0 ||
                filters.element.some(
                    (e) => e.toLowerCase() === op.element?.toLowerCase(),
                );
            const matchesWeapon =
                filters.weapon.length === 0 ||
                filters.weapon.some(
                    (e) => e.toLowerCase() === op.weapon?.toLowerCase(),
                );

            return matchesRarity && matchesClass && matchesElement && matchesWeapon;
        })
        // 2. Сортировка
        .sort((a, b) => {
            let valA = a[sortField];
            let valB = b[sortField];

            // Если сортируем по rarity, это числа
            if (sortField === "rarity") {
                return sortDirection === "asc" ? valA - valB : valB - valA;
            }

            // Для строк (class, element)
            if (!valA) valA = "";
            if (!valB) valB = "";

            return sortDirection === "asc"
                ? valA.localeCompare(valB)
                : valB.localeCompare(valA);
        });
</script>

<div class="max-w-[100%] max-h-[100%] justify-start min-h-screen">
    <!-- Header -->
    <div class="flex items-center gap-4 mb-8">
        <h2
            class="font-sdk text-5xl tracking-wide text-[#21272C] flex items-center gap-3"
        >
            {$t("pages.operators") || "Operators"}
            <span class="text-gray-400 text-3xl font-normal">
                / {filteredOperators.length}
            </span>
        </h2>
    </div>

    <!-- Toolbar (В контейнере, чтобы не разъезжался) -->
    <div class="w-full xl:w-[70%] px-8 mb-4">
        <DataToolbar
            bind:sortField
            bind:sortDirection
            bind:searchQuery
            bind:filters
        />
    </div>

    <!-- Grid -->
    <div class="w-full xl:w-[70%] px-8 pb-8">
        <div class="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-4">
            {#each filteredOperators as op (op.id)}
                <div class="flex justify-start">
                    <OperatorCard operator={op} />
                </div>
            {/each}
        </div>

        {#if filteredOperators.length === 0}
            <div class="text-center py-20 text-gray-400 italic flex flex-col items-center justify-center">
                <Icon name="noData" class="w-4 h-4" />
                <p class="text-sm">
                    {$t("emptyState.noData") || "Нет данных"}
                </p>
            </div>
        {/if}
    </div>
</div>
