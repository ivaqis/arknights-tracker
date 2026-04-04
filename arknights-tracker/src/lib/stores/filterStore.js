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

const attr1Skills = ["attr_agi", "attr_str", "attr_will", "attr_wisd", "attr_main"];
const attr2Skills = [
    "attr_atk", "attr_firedam", "attr_crirate", "attr_heal", "attr_hp", 
    "attr_usp", "attr_icedam", "attr_magicdam", "attr_naturaldam", 
    "attr_phydam", "attr_physpell", "attr_pulsedam"
];
const attr3Skills = [
    "tacafter", "magabn", "burst", "spirit", "tactic", "ult", "break", 
    "combo", "crit", "force", "heal", "keyword", "phyabn", "smash"
];

const initialEquipmentFilters = {
    rarity: [5, 4, 3, 2, 1],
    partType: [0, 1, 2], 
    pack: [],
    stats: {
        any: [],
        1: [],
        2: [],
        3: []
    }
};

const initialWeaponFilters = {
    rarity: [6, 5, 4, 3],
    type: ["sword", "polearm", "artsUnit", "greatSword", "handcannon"],
    attr1: [...attr1Skills],
    attr2: [...attr2Skills],
    attr3: [...attr3Skills]
};

const initialOperatorFilters = {
    rarity: [6, 5, 4],
    class: ["guard", "vanguard", "caster", "defender", "supporter", "striker"],
    element: ["cryo", "physical", "nature", "heat", "electric"],
    weapon: ["sword", "polearm", "artsUnit", "greatSword", "handcannon"],
};

const initialManualMode = {
    rarity: false, partType: false, pack: false, stats: false,
    class: false, element: false, weapon: false, type: false, attr1: false, attr2: false, attr3: false
};


export const equipmentFilters = writable({ ...initialEquipmentFilters });
export const equipmentManual = writable({ ...initialManualMode });
export const equipmentSearch = writable("");
export const equipmentGroupMode = createPersistentStore('equipmentGroupMode', true);

export const weaponFilters = writable({ ...initialWeaponFilters });
export const weaponManual = writable({ ...initialManualMode });
export const weaponSearch = writable("");
export const weaponOwnedOnly = writable(false);

export const operatorFilters = writable({ ...initialOperatorFilters });
export const operatorManual = writable({ ...initialManualMode });
export const operatorSearch = writable("");
export const operatorOwnedOnly = writable(false);