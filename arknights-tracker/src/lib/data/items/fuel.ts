import type { FuelData } from "$lib/data/types/items/FuelData";

export const fuel: Readonly<Record<string, FuelData>> = {
    "item_originium_ore": {
        "id": "item_originium_ore",
        "powerProvide": 50,
        "progressRound": 8
    },
    "item_proc_battery_1": {
        "id": "item_proc_battery_1",
        "powerProvide": 220,
        "progressRound": 40
    },
    "item_proc_battery_2": {
        "id": "item_proc_battery_2",
        "powerProvide": 420,
        "progressRound": 40
    },
    "item_proc_battery_4": {
        "id": "item_proc_battery_4",
        "powerProvide": 1600,
        "progressRound": 40
    },
    "item_proc_battery_3": {
        "id": "item_proc_battery_3",
        "powerProvide": 1100,
        "progressRound": 40
    },
    "item_proc_battery_5": {
        "id": "item_proc_battery_5",
        "powerProvide": 3200,
        "progressRound": 40
    }
};