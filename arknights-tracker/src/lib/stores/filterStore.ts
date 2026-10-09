import { FoodFieldComparatorName } from "$lib/classes/comparators/items/FoodFieldComparatorName";
import { ItemFieldComparatorName } from "$lib/classes/comparators/items/ItemFieldComparatorName";
import { LocaleOrder } from "$lib/classes/comparators/LocaleOrder";
import { EquipmentComparatorName } from "$lib/classes/comparators/names/EquipmentComparatorName";
import type { IFactoryEvent } from "$lib/classes/events/IFactoryEvent";
import { FilterSelector } from "$lib/classes/filters/FilterSelector";
import { FilterSelectorMany } from "$lib/classes/filters/FilterSelectorMany";
import { GroupedFilterSelector } from "$lib/classes/filters/GroupedFilterSelector";
import { GroupedFilterSelectorMany } from "$lib/classes/filters/GroupedFilterSelectorMany";
import { EquipableItemConditionType } from "$lib/classes/gameData/items/equipable/EquipableItemConditionType";
import { ItemGroup } from "$lib/classes/gameData/items/ItemGroup";
import { ItemMaterial } from "$lib/classes/gameData/items/ItemMaterial";
import { ItemType } from "$lib/classes/gameData/items/ItemType";
import { UsableTargetType } from "$lib/classes/gameData/items/usable/UsableTargetType";
import type { EnemyFilterOptions } from "$lib/stores/filters/enemies/EnemyFilterOptions";
import type { EnemySelectedFilters } from "$lib/stores/filters/enemies/EnemySelectedFilters";
import type { EnemySortOption } from "$lib/stores/filters/enemies/EnemySortOption";
import type { EquipmentFilterOptions } from "$lib/stores/filters/equipment/EquipmentFilterOptions";
import type { EquipmentFilters } from "$lib/stores/filters/equipment/EquipmentFilters";
import type { EquipmentGroupOption } from "$lib/stores/filters/equipment/EquipmentGroupField";
import type { EquipmentSelectedFilters } from "$lib/stores/filters/equipment/EquipmentSelectedFilters";
import type { EquipmentSortOption } from "$lib/stores/filters/equipment/EquipmentSortOption";
import type { EquipmentSortParams } from "$lib/stores/filters/equipment/EquipmentSortParams";
import type { FoodFilters } from "$lib/stores/filters/food/FoodFilters";
import type { FoodGroupOption } from "$lib/stores/filters/food/FoodGroupField";
import type { FoodSortParams } from "$lib/stores/filters/food/FoodSortParams";
import type { OperatorFilterOptions } from "$lib/stores/filters/operators/OperatorFilterOptions";
import type { OperatorSelectedFilters } from "$lib/stores/filters/operators/OperatorSelectedFilters";
import type { OperatorSortOption } from "$lib/stores/filters/operators/OperatorSortOption";
import type { RecipeFilters } from "$lib/stores/filters/recipes/RecipeFilters";
import type { RecipeGroupOption } from "$lib/stores/filters/recipes/RecipeGroupField";
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
        pack: [
            "suit_spellburst",
            "suit_generaltype",
            "suit_crush_fracture",
            "suit_expend_spell01",
            "suit_combo_cd01",
            "suit_atb01",
            "suit_atk02",
            "suit_attri01",
            "suit_burst01",
            "suit_criti01",
            "suit_fire_natr01",
            "suit_heal01",
            "suit_phy01",
            "suit_poise01",
            "suit_pulse_cryst01",
            "suit_usp02",
            "suit_agi01",
            "suit_atk01",
            "suit_str01",
            "suit_usp01",
            "suit_will01",
            "suit_wisd01",
            "suit_stragi01",
            "suit_wisdwill01",
            "none"
        ],
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

export function getDefaultEquipmentSortParams(): EquipmentSortParams {
    return {
        sortFieldOrder: [
            EquipmentComparatorName.PACK,
            EquipmentComparatorName.RARITY,
            EquipmentComparatorName.PART_TYPE,
            EquipmentComparatorName.LEVEL,
            EquipmentComparatorName.LOCALE_NAME
        ],
        sortFieldParams: {
            rarity: [5, 4, 3, 2, 1],
            partType: ["body", "hand", "edc"],
            pack: [
                "suit_spellburst",
                "suit_generaltype",
                "suit_crush_fracture",
                "suit_expend_spell01",
                "suit_combo_cd01",
                "suit_atb01",
                "suit_atk02",
                "suit_attri01",
                "suit_burst01",
                "suit_criti01",
                "suit_fire_natr01",
                "suit_heal01",
                "suit_phy01",
                "suit_poise01",
                "suit_pulse_cryst01",
                "suit_usp02",
                "suit_agi01",
                "suit_atk01",
                "suit_str01",
                "suit_usp01",
                "suit_will01",
                "suit_wisd01",
                "suit_stragi01",
                "suit_wisdwill01",
                "none"
            ],
            level: "desc",
            localeName: LocaleOrder.A_Z
        }
    };
}

export function getAllEquipmentStatsGrouped(): string[][] {
    return [
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
        ],
        [
            "NormalSkillEfficiency",
            "ComboSkillEfficiency",
            "UltimateSkillEfficiency",
            "SpellDamageIncrease",
            "AllSkillDamageIncrease"
        ],
        [
            "PhysicalDamageIncrease",
            "AttrDamageToBrokenUnitIncrease",
            "NormalAttackDamageIncrease",
            "CrystAndPulseDamageIncrease",
            "FireAndNaturalDamageIncrease"
        ],
        [
            "MaxHp",
            "AllDamageTakenScalar",
            "HealOutputIncrease"
        ]
    ];
}

export function getEquipmentFilters2(): EquipmentFilters {
    return {
        rarity: new FilterSelector(get(equipmentSortParams).sortFieldParams.rarity, item => item.rarity),
        partType: new FilterSelector(get(equipmentSortParams).sortFieldParams.partType, item => item.partType === 0 ? "body" : item.partType === 1 ? "hand" : "edc"),
        pack: new FilterSelector(get(equipmentSortParams).sortFieldParams.pack, item => item.pack || "none"),
        stats_any: new GroupedFilterSelectorMany(
            [
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
                ],
                [
                    "NormalSkillEfficiency",
                    "ComboSkillEfficiency",
                    "UltimateSkillEfficiency",
                    "SpellDamageIncrease",
                    "AllSkillDamageIncrease"
                ],
                [
                    "PhysicalDamageIncrease",
                    "AttrDamageToBrokenUnitIncrease",
                    "NormalAttackDamageIncrease",
                    "CrystAndPulseDamageIncrease",
                    "FireAndNaturalDamageIncrease"
                ],
                [
                    "MaxHp",
                    "AllDamageTakenScalar",
                    "HealOutputIncrease"
                ]
            ],
            item => item.displayAttr.map((attr: any) => attr.attrType)
        ),
        stats_1: new GroupedFilterSelector([], item => item.displayAttr.length >= 3 ? item.displayAttr[1].attrType : "NoAttr"),
        stats_2: new GroupedFilterSelector([], item => item.displayAttr.length >= 4 ? item.displayAttr[2].attrType : "NoAttr"),
        stats_3: new GroupedFilterSelector([], item => item.displayAttr.length >= 2 ? item.displayAttr.at(-1).attrType : "NoAttr"),
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
            itemGroups: [
                ItemGroup.NATURE,
                ItemGroup.PRODUCT,
                ItemGroup.USABLE,
                ItemGroup.GATHERABLE,
                ItemGroup.DEVICE,
                ItemGroup.NURTURANCE,
                ItemGroup.FACILITY,
                ItemGroup.OTHER
            ],
            itemTypes: [
                ItemType.SPECIAL_STONE,
                ItemType.MUSHROOM,
                ItemType.CRYLPLANT,
                ItemType.ORE,
                ItemType.LIQUID,
                ItemType.GAS,
                ItemType.PLANT,
                ItemType.PLANT_SEED,
                ItemType.PLANT_SPECIAL,
                ItemType.WOOD,
                ItemType.INGOT,
                ItemType.POWDER,
                ItemType.COMPRESSED_POWDER,
                ItemType.PART,
                ItemType.COMPONENT,
                ItemType.BATTERY,
                ItemType.BOTTLE,
                ItemType.JAR,
                ItemType.BALLOON_RECYCLE,
                ItemType.HULU,
                ItemType.TOOL,
                ItemType.LUNG_BOX,
                ItemType.LUNG,
                ItemType.XIRANITE_RADAR,
                ItemType.XIRANITE_NEXUS,
                ItemType.ARROW_CHIP,
                ItemType.MUCK,
                ItemType.FULL_BOTTLE,
                ItemType.FULL_GAS_JAR,
                ItemType.BOMB,
                ItemType.HP_RECOVERY,
                ItemType.FOOD,
                ItemType.SPECIAL_FOOD,
                ItemType.INSECT,
                ItemType.DROP,
                ItemType.MINER,
                ItemType.GAS_MINER,
                ItemType.PUMP,
                ItemType.CRAFTER,
                ItemType.POWER,
                ItemType.VAPORIZER,
                ItemType.SOIL,
                ItemType.BATTLE,
                ItemType.SANITY,
                ItemType.OTHER
            ],
            itemMaterials: [
                ItemMaterial.WATER,
                ItemMaterial.ACID,
                ItemMaterial.INERT,
                ItemMaterial.SEWAGE,
                ItemMaterial.ORIGINIUM,
                ItemMaterial.AMETHYST,
                ItemMaterial.IRON,
                ItemMaterial.ORIGINIUM_ENR,
                ItemMaterial.AMETHYST_ENR,
                ItemMaterial.IRON_ENR,
                ItemMaterial.XIRANITE,
                ItemMaterial.XIRANITE_ENR,
                ItemMaterial.COPPER,
                ItemMaterial.COPPER_ENR,
                ItemMaterial.COPPER_XIRANITE,
                ItemMaterial.COPPER_POLY,
                ItemMaterial.CARBON,
                ItemMaterial.CARBON_ENR,
                ItemMaterial.PLANT_FLOWER_1,
                ItemMaterial.PLANT_FLOWER_2,
                ItemMaterial.PLANT_FLOWER_3,
                ItemMaterial.PLANT_GRASS_1,
                ItemMaterial.PLANT_GRASS_2,
                ItemMaterial.PLANT_FLOWER_SPC_1,
                ItemMaterial.PLANT_FLOWER_SPC_2,
                ItemMaterial.PLANT_GRASS_SPC_1,
                ItemMaterial.PLANT_GRASS_SPC_2,
                ItemMaterial.PLANT_BBFLOWER_1,
                ItemMaterial.PLANT_SP_1,
                ItemMaterial.PLANT_SP_2,
                ItemMaterial.PLANT_SP_3,
                ItemMaterial.PLANT_SP_4,
                "nonMaterial"
            ],
            rarity: [1, 2, 3, 4, 5, 6],
            events: ["nonEvent", "ev4-v1.2", "ev3-v1.5"],
            localeName: LocaleOrder.A_Z
        }
    };
}

export function getItemFilters(eventMap: Map<string, IFactoryEvent>): RecipeFilters {
    return {
        rarity: new FilterSelector(get(itemSortParams).sortFieldParams.rarity, item => item.rarity),
        itemGroups: new FilterSelector(get(itemSortParams).sortFieldParams.itemGroups, item => item.groupId),
        itemTypes: new FilterSelector(get(itemSortParams).sortFieldParams.itemTypes, item => item.type),
        itemMaterials: new FilterSelector(get(itemSortParams).sortFieldParams.itemMaterials, item => item.material ?? "nonMaterial"),
        events: new FilterSelector(get(itemSortParams).sortFieldParams.events, item => eventMap.get(item.gameId)?.id ?? "nonEvent"),
    }
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
export const equipmentSortParams: Writable<EquipmentSortParams> = createPersistentStore("equipmentSortParams", getDefaultEquipmentSortParams());
export const equipmentSearch: Writable<string> = writable("");
export const equipmentGroupMode: Writable<boolean> = createPersistentStore("equipmentGroupMode", true);
export const equipmentGroupOption: Writable<EquipmentGroupOption> = createPersistentStore("equipmentGroupOption", "pack");

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

export const itemSearch: Writable<string> = writable("");
export const itemSortParams: Writable<RecipeSortParams> = createPersistentStore("itemSortParams", getDefaultItemSortParams());
export const itemGroupMode: Writable<boolean> = createPersistentStore("itemGroupMode", true);
export const itemGroupOption: Writable<RecipeGroupOption> = createPersistentStore("itemGroupOption", "inherit_sort");

export const foodSortParams: Writable<FoodSortParams> = createPersistentStore("foodSortParams", getDefaultFoodSortParams());
export const foodSearch: Writable<string> = writable("");
export const foodGroupMode: Writable<boolean> = createPersistentStore("foodGroupMode", false);
export const foodGroupOption: Writable<FoodGroupOption> = createPersistentStore("foodGroupOption", "inherit_sort");

export const recordsExcludedBannerTypes: Writable<string[]> = createPersistentStore("recordsExcludedBannerTypes", []);
export const recordsExcludedBanners: Writable<string[]> = createPersistentStore("recordsExcludedBanners", []);
export const recordsShowMonthlyChart: Writable<boolean> = createPersistentStore("recordsShowMonthlyChart", true);
export const recordsShowRating: Writable<boolean> = createPersistentStore("recordsShowRating", true);
export const recordsShowTotalCost: Writable<boolean> = createPersistentStore("recordsShowTotalCost", true);
export const recordsMaxCols: Writable<number> = createPersistentStore("recordsMaxCols", 3);
export const recordsEnableDragDrop: Writable<boolean> = createPersistentStore("recordsEnableDragDrop", false);
export const recordsCardsOrder: Writable<string[]> = createPersistentStore("recordsCardsOrder", []);
