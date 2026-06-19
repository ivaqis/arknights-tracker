// src/lib/stores/filterStore.js

import { writable } from 'svelte/store';

function createPersistentStore(key, startValue) {
    const isBrowser = typeof window !== 'undefined';
    const storedValue = isBrowser ? localStorage.getItem(key) : null;
    const initial = storedValue !== null ? JSON.parse(storedValue) : startValue;
    const store = writable(initial);
    if (isBrowser) {
        store.subscribe(value => {
            localStorage.setItem(key, JSON.stringify(value));
        });
    }
    return store;
}

export function getOperatorFilters() {
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
        ]
    };
}

export function getWeaponFilters() {
    return {
        rarity: [6, 5, 4, 3],
        type: ["sword", "polearm", "artsUnit", "greatSword", "handcannon"],
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

export function getEquipmentFilters() {
    return {
        rarity: [5, 4, 3, 2, 1],
        partType: ["body", "hand", "edc"],
        pack: [],
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
                "Sub",
                "Main"
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
        ]
    };
}

export function getEnemyFilters() {
    return {
        rarity: [6, 5, 4, 3]
    };
}

export function getOperatorSortOptions() {
    return ["rarity", "class", "element", "weapon"];
}

export function getWeaponSortOptions() {
    return ["rarity", "type"];
}

export function getEquipmentSortOptions() {
    return ["rarity"];
}

export function getEnemySortOptions() {
    return ["rarity"];
}

export function getDefaultItemSortParams() {
    return {
        sortFieldOrder: [
            "itemGroups",
            "itemTypes",
            "events",
            "rarity",
            "itemMaterials",
            "localeName"
        ],
        sortFieldParams: {
            itemGroups: ["nature", "product", "usable", "gatherable", "facility"],
            itemTypes: [
                "ore",
                "liquid",
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
                "hulu",
                "tool",
                "muck",
                "full_bottle",
                "bomb",
                "hp_recovery",
                "food",
                "special_food",
                "insect",
                "drop",
                "miner",
                "pump",
                "crafter",
                "power",
                "soil",
                "battle",
                "other"
            ],
            itemMaterials: [
                "water",
                "acid",
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
            rarity: [1, 2, 3, 4, 5],
            events: ["nonEvent", "ev4-v1.2"],
            localeName: "a-z"
        }
    };
}

export const equipmentFilters = writable({});
export const equipmentSearch = writable("");
export const equipmentGroupMode = createPersistentStore('equipmentGroupMode', true);

export const weaponFilters = writable({});
export const weaponSearch = writable("");
export const weaponOwnedOnly = writable(false);

export const essenceWeaponFilters = writable({});
export const essenceWeaponSearch = writable("");
export const essenceWeaponOwnedOnly = writable(false);

export const operatorFilters = writable({});
export const operatorSearch = writable("");
export const operatorOwnedOnly = writable(false);

export const enemyFilters = writable({});
export const enemySearch = writable("");
export const enemyGroupMode = createPersistentStore('enemyGroupMode', true);

export const itemFilters = writable({});
export const itemSearch = writable("");
export const itemSortParams = createPersistentStore("itemSortParams", getDefaultItemSortParams());
export const itemGroupMode = createPersistentStore('itemGroupMode', true);

export const recordsExcludedBannerTypes = createPersistentStore('recordsExcludedBannerTypes', []);
export const recordsExcludedBanners = createPersistentStore('recordsExcludedBanners', []);
export const recordsShowMonthlyChart = createPersistentStore('recordsShowMonthlyChart', true);
export const recordsShowRating = createPersistentStore('recordsShowRating', true);
export const recordsShowTotalCost = createPersistentStore('recordsShowTotalCost', true);
export const recordsMaxCols = createPersistentStore('recordsMaxCols', 3);
export const recordsEnableDragDrop = createPersistentStore('recordsEnableDragDrop', false);
export const recordsCardsOrder = createPersistentStore('recordsCardsOrder', []);
