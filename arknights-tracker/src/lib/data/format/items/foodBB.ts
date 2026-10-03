import type { BbValueFormat } from "$lib/data/types/BbValueFormat";

export const foodBBFormat: Readonly<Record<string, Readonly<Record<string, BbValueFormat>>>> = {
    buff_common_heal_potion_1: {
        value: {}
    },
    buff_common_heal_potion_2: {
        value: {},
        value2: {}
    },
    buff_common_heal_moss_1: {
        triggerheal: {},
        duration: {},
        maxcount: {
            display: false
        }
    },
    buff_common_heal_moss_2: {
        triggerheal: {},
        triggerheal2: {},
        duration: {},
        maxcount: {
            display: false
        }
    },
    buff_custom_revive_1: {
        value: {}
    },
    buff_common_ultsp_potion_1: {
        value: {}
    },
    buff_common_def_buff_potion_1: {
        value: {},
        duration: {}
    },
    buff_common_def_buff_potion_2: {
        value: {},
        duration: {}
    },
    buff_common_def_buff_potion_3: {
        value: {},
        duration: {}
    },
    buff_common_resis_up_potion_1: {
        value: {},
        duration: {}
    },
    buff_common_dmg_up_potion_1: {
        value: {},
        duration: {}
    },
    buff_common_phydmg_up_potion_1: {
        value: {},
        duration: {}
    },
    buff_common_mainattri_up_potion_1: {
        value: {},
        duration: {}
    },
    buff_common_atk_buff_potion_1: {
        value: {},
        duration: {}
    },
    buff_common_atk_buff_potion_2: {
        value: {},
        duration: {}
    },
    buff_common_ctr_buff_potion_1: {
        value: {},
        duration: {}
    },
    buff_common_cdr_buff_potion_1: {
        value: {},
        duration: {}
    },
    buff_common_usprt_buff_potion_1: {
        value: {},
        duration: {}
    },
    buff_common_healrt_buff_potion_1: {
        value: {},
        duration: {}
    },
    buff_common_healrt_buff_potion_2: {
        value: {},
        duration: {}
    },
    buff_common_dispel_potion: {},
};