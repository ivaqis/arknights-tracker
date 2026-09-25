import type { VaporizerData } from "$lib/data/types/buildings/VaporizerData";

export const vaporizers: Readonly<Record<string, VaporizerData>> = {
    "vaporizer_1": {
        "id": "vaporizer_1",
        "groups": [
            {
                "consumeItem": "item_gas_inert",
                "consumeRate": 6,
                "maxConsumeRate": 30,
                "gasEnv": "gas_env_stable"
            },
            {
                "consumeItem": "item_gas_water",
                "consumeRate": 6,
                "maxConsumeRate": 30,
                "gasEnv": "gas_env_wet"
            },
            {
                "consumeItem": "item_gas_acid",
                "consumeRate": 6,
                "maxConsumeRate": 30,
                "gasEnv": "gas_env_acidic"
            },
            {
                "consumeItem": "item_gas_xiranite",
                "consumeRate": 6,
                "maxConsumeRate": 30,
                "gasEnv": "gas_env_xiranite"
            }
        ]
    }
};