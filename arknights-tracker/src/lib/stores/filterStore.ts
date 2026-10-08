import { FoodFieldComparatorName } from "$lib/classes/comparators/items/FoodFieldComparatorName";
import { ItemFieldComparatorName } from "$lib/classes/comparators/items/ItemFieldComparatorName";
import { LocaleOrder } from "$lib/classes/comparators/LocaleOrder";
import { FilterSelector } from "$lib/classes/filters/FilterSelector";
import { FilterSelectorMany } from "$lib/classes/filters/FilterSelectorMany";
import { EquipableItemConditionType } from "$lib/classes/gameData/items/equipable/EquipableItemConditionType";
import { UsableTargetType } from "$lib/classes/gameData/items/usable/UsableTargetType";
import type { EnemyFilterOptions } from "$lib/stores/filters/enemies/EnemyFilterOptions";
import type { EnemySelectedFilters } from "$lib/stores/filters/enemies/EnemySelectedFilters";
import type { EnemySortOption } from "$lib/stores/filters/enemies/EnemySortOption";
import type { EquipmentFilterOptions } from "$lib/stores/filters/equipment/EquipmentFilterOptions";
import type { EquipmentSelectedFilters } from "$lib/stores/filters/equipment/EquipmentSelectedFilters";
import type { EquipmentSortOption } from "$lib/stores/filters/equipment/EquipmentSortOption";
import type { FoodFilters } from "$lib/stores/filters/food/FoodFilters";
import type { FoodSortParams } from "$lib/stores/filters/food/FoodSortParams";
import type { OperatorFilterOptions } from "$lib/stores/filters/operators/OperatorFilterOptions";
import type { OperatorSelectedFilters } from "$lib/stores/filters/operators/OperatorSelectedFilters";
import type { OperatorSortOption } from "$lib/stores/filters/operators/OperatorSortOption";
import type { RecipeSelectedFilterMap } from "$lib/stores/filters/recipes/RecipeSelectedFilterMap";
import type { RecipeSortParams } from "$lib/stores/filters/recipes/RecipeSortParams";
import type { WeaponFilterOptions } from "$lib/stores/filters/weapon/WeaponFilterOptions";
import type { WeaponSelectedFilters } from "$lib/stores/filters/weapon/WeaponSelectedFilters";
import type { WeaponSortOption } from "$lib/stores/filters/weapon/WeaponSortOption";
import { get, type Writable, writable } from "svelte/store";

function createPersistentStore<T>(key: string, startValue: T): Writable<T> {
    const isBrowser = typeof window !== "undefined";
    const storedValue = isBrowser ? localStorage.getItem(key) : null;
    const initial = storedValue !== null ? JSON.parse(storedValue) as T : startValue;
    const store = writable(initial);

    if (isBrowser) {
        store.subscribe(value => {
            localStorage.setItem(key, JSON.stringify(value));
        });
    }

    return store;
}

export function getOperatorFilters(): OperatorFilterOptions {
    return {
        rarity: [6, 5, 4],
        class: ["guard", "vanguard", "caster", "defender", "supporter", "striker"],
        element: ["cryo", "nature", "heat", "electric", "physical"],
        weapon: ["sword", "polearm", "artsUnit", "greatSword", "handcannon"],
        skillMaterialType: ["any", "basic_combo", "battle_ultimate", "ascension"],
        skillMaterial: [
            "d96SteelSample4",
            "metadiastimaPhotoemissionTube",
            "tachyonScreeningLattice",
            "quadrantFittingFluid",
            "triphasicNanoflake"
        ],
        baseSkill: [
            "weaponMaterialEfficiency",
            "operatorMaterialEfficiency",
            "operatorClueCollectingEfficiency",
            "fungiGrowthEfficiency",
            "vitrosGrowthEfficiency",
            "mineralGrowthEfficiency",
            "moodRegen",
            "clueEfficiencyBoost",
            "moodDropHour_receptionRoom",
            "moodDropHour_manufacturingCabin",
            "moodDropHour_growthChamber"
        ]
    };
}

export function getWeaponFilters(): WeaponFilterOptions {
    return {
        rarity: [6, 5, 4, 3],
        type: ["sword", "polearm", "artsUnit", "greatSword", "handcannon"],
        essence: [0, 1, 2, 3],
        attr1: [
            "attr_agi",
            "attr_str",
            "attr_will",
            "attr_wisd",
            "attr_main"
        ],
        attr2: [
            "attr_firedam",
            "attr_icedam",
            "attr_naturaldam",
            "attr_pulsedam",
            "attr_phydam",
            "attr_atk",
            "attr_crirate",
            "attr_hp",
            "attr_heal",
            "attr_usp",
            "attr_physpell",
            "attr_magicdam",
        ],
        attr3: [
            "tacafter",
            "magabn",
            "burst",
            "spirit",
            "tactic",
            "ult",
            "break",
            "combo",
            "crit",
            "force",
            "heal",
            "keyword",
            "phyabn",
            "smash"
        ]
    };
}

export function getEquipmentFilters(): EquipmentFilterOptions {
    return {
        rarity: [5, 4, 3, 2, 1],
        partType: ["body", "hand", "edc"],
        pack: [],
        stats_any: [
            [
                "Def",
                "Str",
                "Agi",
                "Wisd",
                "Will",
                "Atk",
                "CriticalRate",
                "UltimateSpGainScalar",
                "OriginiumArts",
                "Main",
                "Sub",
            ], [
                "NormalSkillEfficiency",
                "ComboSkillEfficiency",
                "UltimateSkillEfficiency",
                "SpellDamageIncrease",
                "AllSkillDamageIncrease"
            ], [
                "PhysicalDamageIncrease",
                "AttrDamageToBrokenUnitIncrease",
                "NormalAttackDamageIncrease",
                "CrystAndPulseDamageIncrease",
                "FireAndNaturalDamageIncrease"
            ], [
                "MaxHp",
                "AllDamageTakenScalar",
                "HealOutputIncrease"
            ]
        ],
        stats: [
            [
                "Def",
                "Str",
                "Agi",
                "Wisd",
                "Will",
                "Atk",
                "CriticalRate",
                "UltimateSpGainScalar",
                "OriginiumArts",
                "Main",
                "Sub",
                "NoAttr",
            ], [
                "NormalSkillEfficiency",
                "ComboSkillEfficiency",
                "UltimateSkillEfficiency",
                "SpellDamageIncrease",
                "AllSkillDamageIncrease"
            ], [
                "PhysicalDamageIncrease",
                "AttrDamageToBrokenUnitIncrease",
                "NormalAttackDamageIncrease",
                "CrystAndPulseDamageIncrease",
                "FireAndNaturalDamageIncrease"
            ], [
                "MaxHp",
                "AllDamageTakenScalar",
                "HealOutputIncrease"
            ]
        ],
        stats_1: [],
        stats_2: [],
        stats_3: []
    };
}

export function getEnemyFilters(): EnemyFilterOptions {
    return {
        rarity: [6, 5, 4, 3]
    };
}

export function getOperatorSortOptions(): OperatorSortOption[] {
    return ["rarity", "class", "element", "weapon"];
}

export function getWeaponSortOptions(): WeaponSortOption[] {
    return ["rarity", "type"];
}

export function getEquipmentSortOptions(): EquipmentSortOption[] {
    return ["rarity"];
}

export function getEnemySortOptions(): EnemySortOption[] {
    return ["rarity"];
}

export function getDefaultItemSortParams(): RecipeSortParams {
    return {
        sortFieldOrder: [
            ItemFieldComparatorName.ITEM_GROUP,
            ItemFieldComparatorName.ITEM_TYPE,
            ItemFieldComparatorName.EVENT,
            ItemFieldComparatorName.RARITY,
            ItemFieldComparatorName.ITEM_MATERIAL,
            ItemFieldComparatorName.LOCALE_NAME
        ],
        sortFieldParams: {
            itemGroups: ["nature", "product", "usable", "gatherable", "device", "nurturance", "facility", "other"],
            itemTypes: [
                "spcstone",
                "mushroom",
                "crylplant",
                "ore",
                "liquid",
                "gas",
                "plant",
                "plant_seed",
                "plant_special",
                "wood",
                "ingot",
                "powder",
                "compressed_powder",
                "part",
                "component",
                "battery",
                "bottle",
                "jar",
                "balloon_recycle",
                "hulu",
                "tool",
                "lung_box",
                "lung",
                "xiranite_radar",
                "xiranite_nexus",
                "arrow_chip",
                "muck",
                "full_bottle",
                "full_gas_jar",
                "bomb",
                "hp_recovery",
                "food",
                "special_food",
                "insect",
                "drop",
                "miner",
                "gas_miner",
                "pump",
                "crafter",
                "power",
                "vaporizer",
                "soil",
                "battle",
                "sanity",
                "other"
            ],
            itemMaterials: [
                "water",
                "acid",
                "inert",
                "sewage",
                "originium",
                "amethyst",
                "iron",
                "originium_enr",
                "amethyst_enr",
                "iron_enr",
                "xiranite",
                "xiranite_enr",
                "copper",
                "copper_enr",
                "copper_xiranite",
                "copper_poly",
                "carbon",
                "carbon_enr",
                "plant_flower_1",
                "plant_flower_2",
                "plant_flower_3",
                "plant_grass_1",
                "plant_grass_2",
                "plant_flower_spc_1",
                "plant_flower_spc_2",
                "plant_grass_spc_1",
                "plant_grass_spc_2",
                "plant_bbflower_1",
                "plant_sp_1",
                "plant_sp_2",
                "plant_sp_3",
                "plant_sp_4",
                "nonMaterial"
            ],
            rarity: [1, 2, 3, 4, 5, 6],
            events: ["nonEvent", "ev4-v1.2", "ev3-v1.5"],
            localeName: LocaleOrder.A_Z
        }
    };
}

export function getDefaultFoodSortParams(): FoodSortParams {
    return {
        sortFieldOrder: [
            FoodFieldComparatorName.BUFF,
            FoodFieldComparatorName.TARGET_TYPE,
            FoodFieldComparatorName.EQUIP_COND,
            FoodFieldComparatorName.RARITY,
            FoodFieldComparatorName.LOCALE
        ],
        sortFieldParams: {
            buff: [
                "buff_common_heal_potion_1",
                "buff_common_heal_potion_2",
                "buff_common_heal_moss_1",
                "buff_common_heal_moss_2",
                "buff_custom_revive_1",
                "buff_common_ultsp_potion_1",
                "buff_common_def_buff_potion_1",
                "buff_common_def_buff_potion_2",
                "buff_common_def_buff_potion_3",
                "buff_common_resis_up_potion_1",
                "buff_common_dmg_up_potion_1",
                "buff_common_phydmg_up_potion_1",
                "buff_common_mainattri_up_potion_1",
                "buff_common_atk_buff_potion_1",
                "buff_common_atk_buff_potion_2",
                "buff_common_ctr_buff_potion_1",
                "buff_common_cdr_buff_potion_1",
                "buff_common_usprt_buff_potion_1",
                "buff_common_healrt_buff_potion_1",
                "buff_common_healrt_buff_potion_2",
                "buff_common_dispel_potion",
            ],
            equipCond: [
                EquipableItemConditionType.CHAR_HP,
                EquipableItemConditionType.CHAR_DOWN,
                EquipableItemConditionType.ARTS_REACTION,
                EquipableItemConditionType.ULT_ENERGY,
                EquipableItemConditionType.DAMAGE_TAKEN,
                "null"
            ],
            targetType: [
                UsableTargetType.USER,
                UsableTargetType.TEAM
            ],
            rarity: [2, 3, 4, 5],
            locale: LocaleOrder.A_Z
        }
    };
}

export function getFoodFilters(): FoodFilters {
    return {
        rarity: new FilterSelector(get(foodSortParams).sortFieldParams.rarity, food => food.rarity),
        buff: new FilterSelectorMany(get(foodSortParams).sortFieldParams.buff, food => food.buffs.map(buff => buff.buffId)),
        equipCond: new FilterSelector(get(foodSortParams).sortFieldParams.equipCond, food => food.tactical?.condType ?? "null"),
        targetType: new FilterSelector(get(foodSortParams).sortFieldParams.targetType, food => food.targetType)
    };
}

export const equipmentFilters: Writable<EquipmentSelectedFilters> = writable({});
export const equipmentSearch: Writable<string> = writable("");
export const equipmentGroupMode: Writable<boolean> = createPersistentStore("equipmentGroupMode", true);

export const weaponFilters: Writable<WeaponSelectedFilters> = writable({});
export const weaponSearch: Writable<string> = writable("");
export const weaponOwnedOnly: Writable<boolean> = writable(false);

export const essenceWeaponFilters: Writable<WeaponSelectedFilters> = writable({});
export const essenceWeaponSearch: Writable<string> = writable("");
export const essenceWeaponOwnedOnly: Writable<boolean> = writable(false);

export const operatorFilters: Writable<OperatorSelectedFilters> = writable({});
export const operatorSearch: Writable<string> = writable("");
export const operatorOwnedOnly: Writable<boolean> = writable(false);

export const enemyFilters: Writable<EnemySelectedFilters> = writable({});
export const enemySearch: Writable<string> = writable("");
export const enemyGroupMode: Writable<boolean> = createPersistentStore("enemyGroupMode", true);

export const itemFilters: Writable<RecipeSelectedFilterMap> = writable({});
export const itemSearch: Writable<string> = writable("");
export const itemSortParams: Writable<RecipeSortParams> = createPersistentStore("itemSortParams", getDefaultItemSortParams());
export const itemGroupMode: Writable<boolean> = createPersistentStore("itemGroupMode", true);

export const foodSortParams: Writable<FoodSortParams> = createPersistentStore("foodSortParams", getDefaultFoodSortParams());
export const foodFilters: FoodFilters = getFoodFilters();
export const foodSearch: Writable<string> = writable("");

export const recordsExcludedBannerTypes: Writable<string[]> = createPersistentStore("recordsExcludedBannerTypes", []);
export const recordsExcludedBanners: Writable<string[]> = createPersistentStore("recordsExcludedBanners", []);
export const recordsShowMonthlyChart: Writable<boolean> = createPersistentStore("recordsShowMonthlyChart", true);
export const recordsShowRating: Writable<boolean> = createPersistentStore("recordsShowRating", true);
export const recordsShowTotalCost: Writable<boolean> = createPersistentStore("recordsShowTotalCost", true);
export const recordsMaxCols: Writable<number> = createPersistentStore("recordsMaxCols", 3);
export const recordsEnableDragDrop: Writable<boolean> = createPersistentStore("recordsEnableDragDrop", false);
export const recordsCardsOrder: Writable<string[]> = createPersistentStore("recordsCardsOrder", []);
