<script>
    import { t } from "$lib/i18n";
    // Убедись, что путь к файлу с данными оружия правильный!
    import { weapons } from "$lib/data/weapons.js"; 
    import WeaponCard from "$lib/components/WeaponCard.svelte";
    import DataToolbar from "$lib/components/DataToolbar.svelte";
    import Icon from "$lib/components/Icons.svelte";

    // Преобразуем объект weapons в массив и фильтруем пустые
    const allWeapons = Object.values(weapons || {}).filter(
        (wp) => wp && wp.id,
    );

    let sortField = "rarity";
    let sortDirection = "desc";
    let searchQuery = "";
    
    // Фильтры для оружия. Замени 'weaponType' на те, которые реально есть в твоей базе
    let filters = {
        rarity: [6, 5, 4, 3, 2, 1],
        weapon: ["sword", "polearm", "artsUnit", "greatSword", "handcannon", "bow", "pistol"], 
    };

    $: filteredWeapons = allWeapons
        .filter((wp) => {
            const query = searchQuery.toLowerCase();
            const matchesSearch =
                !query ||
                wp.name?.toLowerCase().includes(query) ||
                (wp.id && wp.id.toLowerCase().includes(query)) ||
                ($t(`weaponsList.${wp.id}`) || "").toLowerCase().includes(query);

            if (!matchesSearch) return false;
            
            const matchesRarity =
                filters.rarity.length === 0 ||
                filters.rarity.includes(wp.rarity);
                
            // Фильтрация по типу оружия
            // Проверь, как у тебя в базе называется поле типа: wp.weapon или wp.type?
            const matchesWeapon =
                filters.weapon.length === 0 || 
                filters.weapon.some(
                    (w) => w.toLowerCase() === (wp.weapon || wp.type)?.toLowerCase(),
                );

            return matchesRarity && matchesWeapon;
        })
        .sort((a, b) => {
            let valA = a[sortField];
            let valB = b[sortField];
            
            if (sortField === "rarity") {
                return sortDirection === "asc" ? valA - valB : valB - valA;
            }
            
            if (!valA) valA = "";
            if (!valB) valB = "";

            return sortDirection === "asc"
                ? String(valA).localeCompare(String(valB))
                : String(valB).localeCompare(String(valA));
        });
</script>

<div class="max-w-[100%] max-h-[100%] justify-start min-h-screen p-4 md:p-8">
    <div class="flex items-center gap-4 mb-8">
        <h2 class="font-sdk text-[#21272C] dark:text-[#FDFDFD] flex flex-col items-start gap-0 md:flex-row md:items-center md:gap-3">
            <span class="text-3xl md:text-5xl tracking-wide">
                {$t("pages.weapons") || "Weapons"}
            </span>

            <span class="text-gray-400 text-xl md:pl-3 md:text-3xl font-normal">
                / {filteredWeapons.length}
            </span>
        </h2>
    </div>

    <div class="w-full xl:w-[70%] mb-4">
        <DataToolbar
            bind:sortField
            bind:sortDirection
            bind:searchQuery
            bind:filters
            mode="weapons" 
        />
    </div>

    <div class="w-full xl:w-[80%] pb-8">
        <div class="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] md:grid-cols-[repeat(auto-fill,100px)] gap-4 justify-start">
            {#each filteredWeapons as wp (wp.id)}
                <div class="flex justify-center">
                    <WeaponCard weapon={wp} />
                </div>
            {/each}
        </div>

        {#if filteredWeapons.length === 0}
            <div class="text-center py-20 text-gray-400 italic flex flex-col items-center justify-center">
                <Icon name="noData" class="w-8 h-8 mb-2 opacity-50" />
                <p class="text-sm">
                    {$t("emptyState.noData") || "No weapons found"}
                </p>
            </div>
        {/if}
    </div>
</div>