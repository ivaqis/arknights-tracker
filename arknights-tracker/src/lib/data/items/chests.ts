export interface ChestItem {
    id: string;
    gameId?: string;
    type: 'weapon' | 'character' | 'item';
    count: number;
}

export interface ChestData {
    id: string;
    type: number;
    selectedCount: number;
    options: ChestItem[][];
}

export const chests: Record<string, ChestData> = {
    "item_case_bp_random_1": {
        "id": "item_case_bp_random_1",
        "type": 0,
        "selectedCount": 0,
        "options": [
            [
                {
                    "id": "item_diamond",
                    "type": "item",
                    "count": 0
                },
                {
                    "id": "item_gold",
                    "type": "item",
                    "count": 0
                },
                {
                    "id": "item_expcard_stage1_high",
                    "type": "item",
                    "count": 0
                },
                {
                    "id": "item_weapon_expcard_high",
                    "type": "item",
                    "count": 0
                },
                {
                    "id": "item_char_skill_level_1_6",
                    "type": "item",
                    "count": 0
                }
            ]
        ]
    },
    "item_case_bp_random_2": {
        "id": "item_case_bp_random_2",
        "type": 0,
        "selectedCount": 0,
        "options": [
            [
                {
                    "id": "item_diamond",
                    "type": "item",
                    "count": 0
                },
                {
                    "id": "item_gold",
                    "type": "item",
                    "count": 0
                },
                {
                    "id": "item_expcard_stage2_low",
                    "type": "item",
                    "count": 0
                },
                {
                    "id": "item_weapon_expcard_high",
                    "type": "item",
                    "count": 0
                },
                {
                    "id": "item_char_skill_level_7_12",
                    "type": "item",
                    "count": 0
                }
            ]
        ]
    },
    "item_case_bp_random_3": {
        "id": "item_case_bp_random_3",
        "type": 0,
        "selectedCount": 0,
        "options": [
            [
                {
                    "id": "item_diamond",
                    "type": "item",
                    "count": 0
                },
                {
                    "id": "item_gold",
                    "type": "item",
                    "count": 0
                },
                {
                    "id": "item_expcard_stage2_high",
                    "type": "item",
                    "count": 0
                },
                {
                    "id": "item_weapon_expcard_high",
                    "type": "item",
                    "count": 0
                },
                {
                    "id": "item_char_skill_level_7_12",
                    "type": "item",
                    "count": 0
                }
            ]
        ]
    },
    "item_case_bp_random_new_2": {
        "id": "item_case_bp_random_new_2",
        "type": 0,
        "selectedCount": 0,
        "options": [
            [
                {
                    "id": "item_diamond",
                    "type": "item",
                    "count": 0
                },
                {
                    "id": "item_bp_double_reward",
                    "type": "item",
                    "count": 0
                },
                {
                    "id": "item_gold",
                    "type": "item",
                    "count": 0
                },
                {
                    "id": "item_expcard_stage2_low",
                    "type": "item",
                    "count": 0
                },
                {
                    "id": "item_weapon_expcard_high",
                    "type": "item",
                    "count": 0
                },
                {
                    "id": "item_char_skill_level_7_12",
                    "type": "item",
                    "count": 0
                }
            ]
        ]
    },
    "item_case_bp_random_new_3": {
        "id": "item_case_bp_random_new_3",
        "type": 0,
        "selectedCount": 0,
        "options": [
            [
                {
                    "id": "item_diamond",
                    "type": "item",
                    "count": 0
                },
                {
                    "id": "item_bp_double_reward",
                    "type": "item",
                    "count": 0
                },
                {
                    "id": "item_gold",
                    "type": "item",
                    "count": 0
                },
                {
                    "id": "item_expcard_stage2_high",
                    "type": "item",
                    "count": 0
                },
                {
                    "id": "item_weapon_expcard_high",
                    "type": "item",
                    "count": 0
                },
                {
                    "id": "item_char_skill_level_7_12",
                    "type": "item",
                    "count": 0
                }
            ]
        ]
    },
    "item_case_bp_selfselect_break": {
        "id": "item_case_bp_selfselect_break",
        "type": 1,
        "selectedCount": 1,
        "options": [
            [
                {
                    "id": "item_char_break_stage_1_2",
                    "type": "item",
                    "count": 10
                }
            ],
            [
                {
                    "id": "item_char_break_stage_3_4",
                    "type": "item",
                    "count": 4
                }
            ],
            [
                {
                    "id": "item_weapon_break_low",
                    "type": "item",
                    "count": 10
                }
            ],
            [
                {
                    "id": "item_weapon_break_high",
                    "type": "item",
                    "count": 4
                }
            ]
        ]
    },
    "item_case_bp_selfselect_exp": {
        "id": "item_case_bp_selfselect_exp",
        "type": 1,
        "selectedCount": 1,
        "options": [
            [
                {
                    "id": "item_expcard_stage1_high",
                    "type": "item",
                    "count": 5
                }
            ],
            [
                {
                    "id": "item_expcard_stage2_high",
                    "type": "item",
                    "count": 2
                }
            ],
            [
                {
                    "id": "item_weapon_expcard_high",
                    "type": "item",
                    "count": 5
                }
            ],
            [
                {
                    "id": "item_gold",
                    "type": "item",
                    "count": 10000
                }
            ]
        ]
    },
    "item_case_bp_selfselect_skill": {
        "id": "item_case_bp_selfselect_skill",
        "type": 1,
        "selectedCount": 1,
        "options": [
            [
                {
                    "id": "item_char_skill_level_1_6",
                    "type": "item",
                    "count": 25
                }
            ],
            [
                {
                    "id": "item_char_skill_level_7_12",
                    "type": "item",
                    "count": 5
                }
            ]
        ]
    },
    "item_case_bp_selfselect_skillsp_1": {
        "id": "item_case_bp_selfselect_skillsp_1",
        "type": 1,
        "selectedCount": 1,
        "options": [
            [
                {
                    "id": "item_char_skill_specialize_1",
                    "type": "item",
                    "count": 2
                }
            ],
            [
                {
                    "id": "item_char_skill_specialize_2",
                    "type": "item",
                    "count": 2
                }
            ],
            [
                {
                    "id": "item_char_skill_specialize_3",
                    "type": "item",
                    "count": 2
                }
            ],
            [
                {
                    "id": "item_char_skill_specialize_4",
                    "type": "item",
                    "count": 2
                }
            ],
            [
                {
                    "id": "item_char_skill_specialize_5",
                    "type": "item",
                    "count": 2
                }
            ]
        ]
    },
    "item_case_bp_selfselect_skillsp_2": {
        "id": "item_case_bp_selfselect_skillsp_2",
        "type": 1,
        "selectedCount": 1,
        "options": [
            [
                {
                    "id": "item_char_skill_specialize_1",
                    "type": "item",
                    "count": 2
                }
            ],
            [
                {
                    "id": "item_char_skill_specialize_2",
                    "type": "item",
                    "count": 2
                }
            ],
            [
                {
                    "id": "item_char_skill_specialize_3",
                    "type": "item",
                    "count": 2
                }
            ],
            [
                {
                    "id": "item_char_skill_specialize_4",
                    "type": "item",
                    "count": 2
                }
            ],
            [
                {
                    "id": "item_char_skill_specialize_5",
                    "type": "item",
                    "count": 2
                }
            ],
            [
                {
                    "id": "item_char_skill_specialize_6",
                    "type": "item",
                    "count": 2
                }
            ]
        ]
    },
    "item_case_char_selfselect_gahca_1_2_2": {
        "id": "item_case_char_selfselect_gahca_1_2_2",
        "type": 3,
        "selectedCount": 1,
        "options": [
            [
                {
                    "id": "laevatain",
                    "gameId": "chr_0016_laevat",
                    "type": "character",
                    "count": 1
                }
            ],
            [
                {
                    "id": "gilberta",
                    "gameId": "chr_0013_aglina",
                    "type": "character",
                    "count": 1
                }
            ],
            [
                {
                    "id": "ardelia",
                    "gameId": "chr_0025_ardelia",
                    "type": "character",
                    "count": 1
                }
            ],
            [
                {
                    "id": "pogranichnik",
                    "gameId": "chr_0029_pograni",
                    "type": "character",
                    "count": 1
                }
            ]
        ]
    },
    "item_case_char_selfselect_standard": {
        "id": "item_case_char_selfselect_standard",
        "type": 1,
        "selectedCount": 1,
        "options": [
            [
                {
                    "id": "ardelia",
                    "gameId": "chr_0025_ardelia",
                    "type": "character",
                    "count": 1
                }
            ],
            [
                {
                    "id": "pogranichnik",
                    "gameId": "chr_0029_pograni",
                    "type": "character",
                    "count": 1
                }
            ],
            [
                {
                    "id": "lastRite",
                    "gameId": "chr_0026_lastrite",
                    "type": "character",
                    "count": 1
                }
            ],
            [
                {
                    "id": "ember",
                    "gameId": "chr_0009_azrila",
                    "type": "character",
                    "count": 1
                }
            ],
            [
                {
                    "id": "lifeng",
                    "gameId": "chr_0015_lifeng",
                    "type": "character",
                    "count": 1
                }
            ]
        ]
    },
    "item_case_gem_random_1": {
        "id": "item_case_gem_random_1",
        "type": 0,
        "selectedCount": 0,
        "options": [
            [
                {
                    "id": "item_adventureexp",
                    "type": "item",
                    "count": 0
                }
            ],
            [
                {
                    "id": "item_gem_rarity_5",
                    "type": "item",
                    "count": 1
                }
            ]
        ]
    },
    "item_case_token_selfselect_gahca_1_2_2": {
        "id": "item_case_token_selfselect_gahca_1_2_2",
        "type": 4,
        "selectedCount": 1,
        "options": [
            [
                {
                    "id": "item_charpotentialup_chr_0016_laevat",
                    "type": "item",
                    "count": 1
                }
            ],
            [
                {
                    "id": "item_charpotentialup_chr_0013_aglina",
                    "type": "item",
                    "count": 1
                }
            ],
            [
                {
                    "id": "item_charpotentialup_chr_0025_ardelia",
                    "type": "item",
                    "count": 1
                }
            ],
            [
                {
                    "id": "item_charpotentialup_chr_0029_pograni",
                    "type": "item",
                    "count": 1
                }
            ]
        ]
    },
    "item_case_wpn_selfselect_1": {
        "id": "item_case_wpn_selfselect_1",
        "type": 1,
        "selectedCount": 1,
        "options": [
            [
                {
                    "id": "sunderingSteel",
                    "gameId": "wpn_sword_0005",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "fortmaker",
                    "gameId": "wpn_sword_0007",
                    "type": "weapon",
                    "count": 1
                }
            ]
        ]
    },
    "item_case_wpn_selfselect_bp_1": {
        "id": "item_case_wpn_selfselect_bp_1",
        "type": 2,
        "selectedCount": 1,
        "options": [
            [
                {
                    "id": "umbralTorch",
                    "gameId": "wpn_sword_0010",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "opusEtchFigure",
                    "gameId": "wpn_funnel_0006",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "navigator",
                    "gameId": "wpn_pistol_0005",
                    "type": "weapon",
                    "count": 1
                }
            ]
        ]
    },
    "item_case_wpn_selfselect_bp_2": {
        "id": "item_case_wpn_selfselect_bp_2",
        "type": 2,
        "selectedCount": 1,
        "options": [
            [
                {
                    "id": "homeLonging",
                    "gameId": "wpn_pistol_0007",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "gloriousMemory",
                    "gameId": "wpn_sword_0017",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "opusEtchFigure",
                    "gameId": "wpn_funnel_0006",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "navigator",
                    "gameId": "wpn_pistol_0005",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "umbralTorch",
                    "gameId": "wpn_sword_0010",
                    "type": "weapon",
                    "count": 1
                }
            ]
        ]
    },
    "item_case_wpn_selfselect_bp_3": {
        "id": "item_case_wpn_selfselect_bp_3",
        "type": 2,
        "selectedCount": 1,
        "options": [
            [
                {
                    "id": "flickersInTheMist",
                    "gameId": "wpn_funnel_0017",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "gloriousMemory",
                    "gameId": "wpn_sword_0017",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "homeLonging",
                    "gameId": "wpn_pistol_0007",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "opusEtchFigure",
                    "gameId": "wpn_funnel_0006",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "navigator",
                    "gameId": "wpn_pistol_0005",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "umbralTorch",
                    "gameId": "wpn_sword_0010",
                    "type": "weapon",
                    "count": 1
                }
            ]
        ]
    },
    "item_case_wpn_selfselect_bp_4": {
        "id": "item_case_wpn_selfselect_bp_4",
        "type": 2,
        "selectedCount": 1,
        "options": [
            [
                {
                    "id": "phantomPain",
                    "gameId": "wpn_claym_0016",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "beaconOfDuty",
                    "gameId": "wpn_lance_0007",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "flickersInTheMist",
                    "gameId": "wpn_funnel_0017",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "gloriousMemory",
                    "gameId": "wpn_sword_0017",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "homeLonging",
                    "gameId": "wpn_pistol_0007",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "opusEtchFigure",
                    "gameId": "wpn_funnel_0006",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "navigator",
                    "gameId": "wpn_pistol_0005",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "umbralTorch",
                    "gameId": "wpn_sword_0010",
                    "type": "weapon",
                    "count": 1
                }
            ]
        ]
    },
    "item_case_wpn_selfselect_bp_5": {
        "id": "item_case_wpn_selfselect_bp_5",
        "type": 2,
        "selectedCount": 1,
        "options": [
            [
                {
                    "id": "junctionPoint",
                    "gameId": "wpn_funnel_0018",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "goldenAge",
                    "gameId": "wpn_lance_0016",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "phantomPain",
                    "gameId": "wpn_claym_0016",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "beaconOfDuty",
                    "gameId": "wpn_lance_0007",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "flickersInTheMist",
                    "gameId": "wpn_funnel_0017",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "gloriousMemory",
                    "gameId": "wpn_sword_0017",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "homeLonging",
                    "gameId": "wpn_pistol_0007",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "opusEtchFigure",
                    "gameId": "wpn_funnel_0006",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "navigator",
                    "gameId": "wpn_pistol_0005",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "umbralTorch",
                    "gameId": "wpn_sword_0010",
                    "type": "weapon",
                    "count": 1
                }
            ]
        ]
    },
    "item_case_wpn_selfselect_bp_6": {
        "id": "item_case_wpn_selfselect_bp_6",
        "type": 2,
        "selectedCount": 1,
        "options": [
            [
                {
                    "id": "sufferingsEnd",
                    "gameId": "wpn_funnel_0020",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "junctionPoint",
                    "gameId": "wpn_funnel_0018",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "goldenAge",
                    "gameId": "wpn_lance_0016",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "phantomPain",
                    "gameId": "wpn_claym_0016",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "beaconOfDuty",
                    "gameId": "wpn_lance_0007",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "flickersInTheMist",
                    "gameId": "wpn_funnel_0017",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "gloriousMemory",
                    "gameId": "wpn_sword_0017",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "homeLonging",
                    "gameId": "wpn_pistol_0007",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "opusEtchFigure",
                    "gameId": "wpn_funnel_0006",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "navigator",
                    "gameId": "wpn_pistol_0005",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "umbralTorch",
                    "gameId": "wpn_sword_0010",
                    "type": "weapon",
                    "count": 1
                }
            ]
        ]
    },
    "item_case_wpn_selfselect_bp_7": {
        "id": "item_case_wpn_selfselect_bp_7",
        "type": 2,
        "selectedCount": 1,
        "options": [
            [
                {
                    "id": "longHeritage",
                    "gameId": "wpn_claym_0019",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "complexedIndustry",
                    "gameId": "wpn_sword_0024",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "sufferingsEnd",
                    "gameId": "wpn_funnel_0020",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "junctionPoint",
                    "gameId": "wpn_funnel_0018",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "goldenAge",
                    "gameId": "wpn_lance_0016",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "phantomPain",
                    "gameId": "wpn_claym_0016",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "beaconOfDuty",
                    "gameId": "wpn_lance_0007",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "flickersInTheMist",
                    "gameId": "wpn_funnel_0017",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "gloriousMemory",
                    "gameId": "wpn_sword_0017",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "homeLonging",
                    "gameId": "wpn_pistol_0007",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "opusEtchFigure",
                    "gameId": "wpn_funnel_0006",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "navigator",
                    "gameId": "wpn_pistol_0005",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "umbralTorch",
                    "gameId": "wpn_sword_0010",
                    "type": "weapon",
                    "count": 1
                }
            ]
        ]
    },
    "item_case_wpn_selfselect_common_advlevel": {
        "id": "item_case_wpn_selfselect_common_advlevel",
        "type": 2,
        "selectedCount": 1,
        "options": [
            [
                {
                    "id": "jet",
                    "gameId": "wpn_lance_0011",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "whiteNightNova",
                    "gameId": "wpn_sword_0014",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "detonationUnit",
                    "gameId": "wpn_funnel_0008",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "wedge",
                    "gameId": "wpn_pistol_0008",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "exemplar",
                    "gameId": "wpn_claym_0004",
                    "type": "weapon",
                    "count": 1
                }
            ]
        ]
    },
    "item_case_wpn_selfselect_gacha_beginner": {
        "id": "item_case_wpn_selfselect_gacha_beginner",
        "type": 2,
        "selectedCount": 1,
        "options": [
            [
                {
                    "id": "oblivion",
                    "gameId": "wpn_funnel_0009",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "sunderedPrince",
                    "gameId": "wpn_claym_0008",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "thermiteCutter",
                    "gameId": "wpn_sword_0012",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "formerFinery",
                    "gameId": "wpn_claym_0006",
                    "type": "weapon",
                    "count": 1
                }
            ],
            [
                {
                    "id": "valiant",
                    "gameId": "wpn_lance_0010",
                    "type": "weapon",
                    "count": 1
                }
            ]
        ]
    },
    "item_case_wpn_selfselect_gahca_1_0_1": {
        "id": "item_case_wpn_selfselect_gahca_1_0_1",
        "type": 2,
        "selectedCount": 1,
        "options": [
            [
                {
                    "id": "whiteNightNova",
                    "gameId": "wpn_sword_0014",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "wedge",
                    "gameId": "wpn_pistol_0008",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "clannibal",
                    "gameId": "wpn_pistol_0009",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "chivalricVirtues",
                    "gameId": "wpn_funnel_0010",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "valiant",
                    "gameId": "wpn_lance_0010",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "formerFinery",
                    "gameId": "wpn_claym_0006",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ]
        ]
    },
    "item_case_wpn_selfselect_gahca_1_0_2": {
        "id": "item_case_wpn_selfselect_gahca_1_0_2",
        "type": 2,
        "selectedCount": 1,
        "options": [
            [
                {
                    "id": "wedge",
                    "gameId": "wpn_pistol_0008",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "rapidAscent",
                    "gameId": "wpn_sword_0011",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "whiteNightNova",
                    "gameId": "wpn_sword_0014",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "jet",
                    "gameId": "wpn_lance_0011",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "chivalricVirtues",
                    "gameId": "wpn_funnel_0010",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "sunderedPrince",
                    "gameId": "wpn_claym_0008",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ]
        ]
    },
    "item_case_wpn_selfselect_gahca_1_0_3": {
        "id": "item_case_wpn_selfselect_gahca_1_0_3",
        "type": 2,
        "selectedCount": 1,
        "options": [
            [
                {
                    "id": "chivalricVirtues",
                    "gameId": "wpn_funnel_0010",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "oblivion",
                    "gameId": "wpn_funnel_0009",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "wedge",
                    "gameId": "wpn_pistol_0008",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "thermiteCutter",
                    "gameId": "wpn_sword_0012",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "whiteNightNova",
                    "gameId": "wpn_sword_0014",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "exemplar",
                    "gameId": "wpn_claym_0004",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ]
        ]
    },
    "item_case_wpn_selfselect_gahca_1_1_1": {
        "id": "item_case_wpn_selfselect_gahca_1_1_1",
        "type": 2,
        "selectedCount": 1,
        "options": [
            [
                {
                    "id": "clannibal",
                    "gameId": "wpn_pistol_0009",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "wedge",
                    "gameId": "wpn_pistol_0008",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "chivalricVirtues",
                    "gameId": "wpn_funnel_0010",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "thermiteCutter",
                    "gameId": "wpn_sword_0012",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "sunderedPrince",
                    "gameId": "wpn_claym_0008",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "jet",
                    "gameId": "wpn_lance_0011",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ]
        ]
    },
    "item_case_wpn_selfselect_gahca_1_1_2": {
        "id": "item_case_wpn_selfselect_gahca_1_1_2",
        "type": 2,
        "selectedCount": 1,
        "options": [
            [
                {
                    "id": "rapidAscent",
                    "gameId": "wpn_sword_0011",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "eminentRepute",
                    "gameId": "wpn_sword_0013",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "wedge",
                    "gameId": "wpn_pistol_0008",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "formerFinery",
                    "gameId": "wpn_claym_0006",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "detonationUnit",
                    "gameId": "wpn_funnel_0008",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "valiant",
                    "gameId": "wpn_lance_0010",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ]
        ]
    },
    "item_case_wpn_selfselect_gahca_1_2_1": {
        "id": "item_case_wpn_selfselect_gahca_1_2_1",
        "type": 2,
        "selectedCount": 1,
        "options": [
            [
                {
                    "id": "oblivion",
                    "gameId": "wpn_funnel_0009",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "chivalricVirtues",
                    "gameId": "wpn_funnel_0010",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "eminentRepute",
                    "gameId": "wpn_sword_0013",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "jet",
                    "gameId": "wpn_lance_0011",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "wedge",
                    "gameId": "wpn_pistol_0008",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "exemplar",
                    "gameId": "wpn_claym_0004",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ]
        ]
    },
    "item_case_wpn_selfselect_gahca_1_2_2": {
        "id": "item_case_wpn_selfselect_gahca_1_2_2",
        "type": 2,
        "selectedCount": 1,
        "options": [
            [
                {
                    "id": "thermiteCutter",
                    "gameId": "wpn_sword_0012",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "whiteNightNova",
                    "gameId": "wpn_sword_0014",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "clannibal",
                    "gameId": "wpn_pistol_0009",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "detonationUnit",
                    "gameId": "wpn_funnel_0008",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "valiant",
                    "gameId": "wpn_lance_0010",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "formerFinery",
                    "gameId": "wpn_claym_0006",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ]
        ]
    },
    "item_case_wpn_selfselect_gahca_1_2_3": {
        "id": "item_case_wpn_selfselect_gahca_1_2_3",
        "type": 2,
        "selectedCount": 1,
        "options": [
            [
                {
                    "id": "oblivion",
                    "gameId": "wpn_funnel_0009",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "detonationUnit",
                    "gameId": "wpn_funnel_0008",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "wedge",
                    "gameId": "wpn_pistol_0008",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "whiteNightNova",
                    "gameId": "wpn_sword_0014",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "exemplar",
                    "gameId": "wpn_claym_0004",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "valiant",
                    "gameId": "wpn_lance_0010",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ]
        ]
    },
    "item_case_wpn_selfselect_gahca_1_3_1": {
        "id": "item_case_wpn_selfselect_gahca_1_3_1",
        "type": 2,
        "selectedCount": 1,
        "options": [
            [
                {
                    "id": "formerFinery",
                    "gameId": "wpn_claym_0006",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "sunderedPrince",
                    "gameId": "wpn_claym_0008",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "clannibal",
                    "gameId": "wpn_pistol_0009",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "rapidAscent",
                    "gameId": "wpn_sword_0011",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "detonationUnit",
                    "gameId": "wpn_funnel_0008",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "valiant",
                    "gameId": "wpn_lance_0010",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ]
        ]
    },
    "item_case_wpn_selfselect_gahca_1_3_2": {
        "id": "item_case_wpn_selfselect_gahca_1_3_2",
        "type": 2,
        "selectedCount": 1,
        "options": [
            [
                {
                    "id": "valiant",
                    "gameId": "wpn_lance_0010",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "jet",
                    "gameId": "wpn_lance_0011",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "clannibal",
                    "gameId": "wpn_pistol_0009",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "thermiteCutter",
                    "gameId": "wpn_sword_0012",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "oblivion",
                    "gameId": "wpn_funnel_0009",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "exemplar",
                    "gameId": "wpn_claym_0004",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ]
        ]
    },
    "item_case_wpn_selfselect_gahca_1_4_1": {
        "id": "item_case_wpn_selfselect_gahca_1_4_1",
        "type": 2,
        "selectedCount": 1,
        "options": [
            [
                {
                    "id": "detonationUnit",
                    "gameId": "wpn_funnel_0008",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "formerFinery",
                    "gameId": "wpn_claym_0006",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "wedge",
                    "gameId": "wpn_pistol_0008",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "eminentRepute",
                    "gameId": "wpn_sword_0013",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "jet",
                    "gameId": "wpn_lance_0011",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "oblivion",
                    "gameId": "wpn_funnel_0009",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ]
        ]
    },
    "item_case_wpn_selfselect_gahca_1_4_2": {
        "id": "item_case_wpn_selfselect_gahca_1_4_2",
        "type": 2,
        "selectedCount": 1,
        "options": [
            [
                {
                    "id": "sunderedPrince",
                    "gameId": "wpn_claym_0008",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "clannibal",
                    "gameId": "wpn_pistol_0009",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "valiant",
                    "gameId": "wpn_lance_0010",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "jet",
                    "gameId": "wpn_lance_0011",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "detonationUnit",
                    "gameId": "wpn_funnel_0008",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "thermiteCutter",
                    "gameId": "wpn_sword_0012",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ]
        ]
    },
    "item_case_wpn_selfselect_gahca_1_5_1": {
        "id": "item_case_wpn_selfselect_gahca_1_5_1",
        "type": 2,
        "selectedCount": 1,
        "options": [
            [
                {
                    "id": "exemplar",
                    "gameId": "wpn_claym_0004",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "sunderedPrince",
                    "gameId": "wpn_claym_0008",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "clannibal",
                    "gameId": "wpn_pistol_0009",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "valiant",
                    "gameId": "wpn_lance_0010",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "oblivion",
                    "gameId": "wpn_funnel_0009",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "detonationUnit",
                    "gameId": "wpn_funnel_0008",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "rapidAscent",
                    "gameId": "wpn_sword_0011",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ]
        ]
    },
    "item_case_wpn_selfselect_gahca_1_6_1": {
        "id": "item_case_wpn_selfselect_gahca_1_6_1",
        "type": 2,
        "selectedCount": 1,
        "options": [
            [
                {
                    "id": "formerFinery",
                    "gameId": "wpn_claym_0006",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "wedge",
                    "gameId": "wpn_pistol_0008",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "jet",
                    "gameId": "wpn_lance_0011",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "chivalricVirtues",
                    "gameId": "wpn_funnel_0010",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "sunderedPrince",
                    "gameId": "wpn_claym_0008",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "eminentRepute",
                    "gameId": "wpn_sword_0013",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ]
        ]
    },
    "item_case_wpn_selfselect_gahca_c_1": {
        "id": "item_case_wpn_selfselect_gahca_c_1",
        "type": 2,
        "selectedCount": 1,
        "options": [
            [
                {
                    "id": "exemplar",
                    "gameId": "wpn_claym_0004",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "sunderedPrince",
                    "gameId": "wpn_claym_0008",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "detonationUnit",
                    "gameId": "wpn_funnel_0008",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "jet",
                    "gameId": "wpn_lance_0011",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "whiteNightNova",
                    "gameId": "wpn_sword_0014",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "clannibal",
                    "gameId": "wpn_pistol_0009",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ]
        ]
    },
    "item_case_wpn_selfselect_gahca_c_2": {
        "id": "item_case_wpn_selfselect_gahca_c_2",
        "type": 2,
        "selectedCount": 1,
        "options": [
            [
                {
                    "id": "detonationUnit",
                    "gameId": "wpn_funnel_0008",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "oblivion",
                    "gameId": "wpn_funnel_0009",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "jet",
                    "gameId": "wpn_lance_0011",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "thermiteCutter",
                    "gameId": "wpn_sword_0012",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "formerFinery",
                    "gameId": "wpn_claym_0006",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "wedge",
                    "gameId": "wpn_pistol_0008",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ]
        ]
    },
    "item_case_wpn_selfselect_gahca_c_3": {
        "id": "item_case_wpn_selfselect_gahca_c_3",
        "type": 2,
        "selectedCount": 1,
        "options": [
            [
                {
                    "id": "grandVision",
                    "gameId": "wpn_sword_0021",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "rapidAscent",
                    "gameId": "wpn_sword_0011",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "exemplar",
                    "gameId": "wpn_claym_0004",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "valiant",
                    "gameId": "wpn_lance_0010",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "oblivion",
                    "gameId": "wpn_funnel_0009",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "wedge",
                    "gameId": "wpn_pistol_0008",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ]
        ]
    },
    "item_case_wpn_selfselect_gahca_c_4": {
        "id": "item_case_wpn_selfselect_gahca_c_4",
        "type": 2,
        "selectedCount": 1,
        "options": [
            [
                {
                    "id": "valiant",
                    "gameId": "wpn_lance_0010",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "jet",
                    "gameId": "wpn_lance_0011",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "eminentRepute",
                    "gameId": "wpn_sword_0013",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "exemplar",
                    "gameId": "wpn_claym_0004",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "chivalricVirtues",
                    "gameId": "wpn_funnel_0010",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "clannibal",
                    "gameId": "wpn_pistol_0009",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ]
        ]
    },
    "item_case_wpn_selfselect_gahca_c_5": {
        "id": "item_case_wpn_selfselect_gahca_c_5",
        "type": 2,
        "selectedCount": 1,
        "options": [
            [
                {
                    "id": "formerFinery",
                    "gameId": "wpn_claym_0006",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "sunderedPrince",
                    "gameId": "wpn_claym_0008",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "chivalricVirtues",
                    "gameId": "wpn_funnel_0010",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "valiant",
                    "gameId": "wpn_lance_0010",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "eminentRepute",
                    "gameId": "wpn_sword_0013",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "wedge",
                    "gameId": "wpn_pistol_0008",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ]
        ]
    },
    "item_case_wpn_selfselect_gahca_tangtang": {
        "id": "item_case_wpn_selfselect_gahca_tangtang",
        "type": 2,
        "selectedCount": 1,
        "options": [
            [
                {
                    "id": "clannibal",
                    "gameId": "wpn_pistol_0009",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "wedge",
                    "gameId": "wpn_pistol_0008",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "chivalricVirtues",
                    "gameId": "wpn_funnel_0010",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "thermiteCutter",
                    "gameId": "wpn_sword_0012",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "sunderedPrince",
                    "gameId": "wpn_claym_0008",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "jet",
                    "gameId": "wpn_lance_0011",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ]
        ]
    },
    "item_case_wpn_selfselect_gahca_yvonne": {
        "id": "item_case_wpn_selfselect_gahca_yvonne",
        "type": 2,
        "selectedCount": 1,
        "options": [
            [
                {
                    "id": "wedge",
                    "gameId": "wpn_pistol_0008",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "rapidAscent",
                    "gameId": "wpn_sword_0011",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "whiteNightNova",
                    "gameId": "wpn_sword_0014",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "jet",
                    "gameId": "wpn_lance_0011",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "chivalricVirtues",
                    "gameId": "wpn_funnel_0010",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ],
            [
                {
                    "id": "sunderedPrince",
                    "gameId": "wpn_claym_0008",
                    "type": "weapon",
                    "count": 1
                },
                {
                    "id": "item_gachabyproducts_weaponticket",
                    "type": "item",
                    "count": 50
                }
            ]
        ]
    },
    "item_springbox_01": {
        "id": "item_springbox_01",
        "type": 0,
        "selectedCount": 0,
        "options": [
            [
                {
                    "id": "item_diamond",
                    "type": "item",
                    "count": 0
                }
            ],
            [
                {
                    "id": "item_diamond",
                    "type": "item",
                    "count": 260
                },
                {
                    "id": "item_diamond",
                    "type": "item",
                    "count": 280
                },
                {
                    "id": "item_diamond",
                    "type": "item",
                    "count": 300
                }
            ]
        ]
    },
    "item_springbox_02": {
        "id": "item_springbox_02",
        "type": 0,
        "selectedCount": 0,
        "options": [
            [
                {
                    "id": "item_diamond",
                    "type": "item",
                    "count": 880
                }
            ],
            [
                {
                    "id": "item_diamond",
                    "type": "item",
                    "count": 880
                }
            ]
        ]
    }
};
