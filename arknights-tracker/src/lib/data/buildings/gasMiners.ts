import type { MinerData } from "$lib/data/types/buildings/MinerData";

export const gasMiners: Readonly<Record<string, MinerData>> = {
    "gas_pump_1": {
        "id": "gas_pump_1",
        "mineable": {
            "item_gas_inert": {
                "miningItemId": "item_gas_inert",
                "miningTimeMs": 3000,
                "consumeItem": null
            },
            "item_gas_xiranite": {
                "miningItemId": "item_gas_xiranite",
                "miningTimeMs": 3000,
                "consumeItem": null
            }
        }
    }
};