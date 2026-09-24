import type { GasEnvData } from "$lib/data/types/items/GasEnvData";

export const gasEnv: Readonly<Record<string, GasEnvData>> = {
    "gas_env_stable": {
        "id": "gas_env_stable",
        "gameId": 1,
        "icon": {
            "id": "gasEnvStable",
            "color": "#444444",
            "bgColor": "#32c0ff"
        }
    },
    "gas_env_wet": {
        "id": "gas_env_wet",
        "gameId": 2,
        "icon": {
            "id": "gasEnvWet",
            "color": "#eeeeee",
            "bgColor": "#414141"
        }
    },
    "gas_env_acidic": {
        "id": "gas_env_acidic",
        "gameId": 3,
        "icon": {
            "id": "gasEnvAcidic",
            "color": "#444444",
            "bgColor": "#ffba00"
        }
    },
    "gas_env_xiranite": {
        "id": "gas_env_xiranite",
        "gameId": 4,
        "icon": {
            "id": "gasEnvXiranite",
            "color": "#444444",
            "bgColor": "#24d4ab"
        }
    }
};