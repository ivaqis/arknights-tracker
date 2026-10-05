export interface AchievementCondition {
    conditionId: string;
    progressToCompare: number;
}

export interface AchievementLevelInfo {
    achieveLevel: number;
    conditions: AchievementCondition[];
}

export interface AchievementData {
    id: string;
    type: string;
    groupId: string;
    order: number;
    initLevel: number;
    upgradable: boolean;
    plateable: boolean;
    specialProgress: boolean;
    applyRareEffect: boolean;
    levelInfos: Record<number, AchievementLevelInfo>;
    plateConditions: AchievementCondition[];
}

export interface AchievementCategoryData {
    id: string;
    priority: number;
    noObtainCanView: boolean;
    groupIds: string[];
}

export const achievementCategories: Record<string, AchievementCategoryData> = {
    "achv_type_adventure": {
        "id": "achv_type_adventure",
        "priority": 3,
        "noObtainCanView": true,
        "groupIds": [
            "achv_group_adv_tundra",
            "achv_group_adv_wuling"
        ]
    },
    "achv_type_battle": {
        "id": "achv_type_battle",
        "priority": 2,
        "noObtainCanView": true,
        "groupIds": [
            "achv_group_bat_skill",
            "achv_group_bat_dung"
        ]
    },
    "achv_type_event": {
        "id": "achv_type_event",
        "priority": 7,
        "noObtainCanView": true,
        "groupIds": [
            "achv_group_event_default"
        ]
    },
    "achv_type_factory": {
        "id": "achv_type_factory",
        "priority": 5,
        "noObtainCanView": true,
        "groupIds": [
            "achv_group_fac_factory",
            "achv_group_fac_spaceship"
        ]
    },
    "achv_type_growth": {
        "id": "achv_type_growth",
        "priority": 4,
        "noObtainCanView": true,
        "groupIds": [
            "achv_group_growth_default"
        ]
    },
    "achv_type_hide": {
        "id": "achv_type_hide",
        "priority": 8,
        "noObtainCanView": false,
        "groupIds": [
            "achv_group_hide_default"
        ]
    },
    "achv_type_quest": {
        "id": "achv_type_quest",
        "priority": 1,
        "noObtainCanView": true,
        "groupIds": [
            "achv_group_quest_main",
            "achv_group_quest_side"
        ]
    },
    "achv_type_social": {
        "id": "achv_type_social",
        "priority": 6,
        "noObtainCanView": true,
        "groupIds": [
            "achv_group_social_default"
        ]
    }
};

export const achievements: Record<string, AchievementData> = {
    "achv_adv_tundra_box": {
        "id": "achv_adv_tundra_box",
        "type": "achv_type_adventure",
        "groupId": "achv_group_adv_tundra",
        "order": 3,
        "initLevel": 1,
        "upgradable": true,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "1": {
                "achieveLevel": 1,
                "conditions": [
                    {
                        "conditionId": "achv_adv_tundra_box_1_cond_1",
                        "progressToCompare": 120
                    }
                ]
            },
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_adv_tundra_box_2_cond_1",
                        "progressToCompare": 180
                    }
                ]
            },
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_adv_tundra_box_3_cond_1",
                        "progressToCompare": 288
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_adv_tundra_campfire": {
        "id": "achv_adv_tundra_campfire",
        "type": "achv_type_adventure",
        "groupId": "achv_group_adv_tundra",
        "order": 1,
        "initLevel": 1,
        "upgradable": true,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "1": {
                "achieveLevel": 1,
                "conditions": [
                    {
                        "conditionId": "achv_adv_tundra_campfire_1_cond_1",
                        "progressToCompare": 14
                    }
                ]
            },
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_adv_tundra_campfire_2_cond_1",
                        "progressToCompare": 28
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_adv_tundra_documents": {
        "id": "achv_adv_tundra_documents",
        "type": "achv_type_adventure",
        "groupId": "achv_group_adv_tundra",
        "order": 6,
        "initLevel": 2,
        "upgradable": true,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_adv_tundra_documents_2_cond_1",
                        "progressToCompare": 4
                    }
                ]
            },
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_adv_tundra_documents_3_cond_1",
                        "progressToCompare": 6
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_adv_tundra_ether": {
        "id": "achv_adv_tundra_ether",
        "type": "achv_type_adventure",
        "groupId": "achv_group_adv_tundra",
        "order": 2,
        "initLevel": 1,
        "upgradable": true,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "1": {
                "achieveLevel": 1,
                "conditions": [
                    {
                        "conditionId": "achv_adv_tundra_ether_1_cond_1",
                        "progressToCompare": 80
                    }
                ]
            },
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_adv_tundra_ether_2_cond_1",
                        "progressToCompare": 120
                    }
                ]
            },
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_adv_tundra_ether_3_cond_1",
                        "progressToCompare": 166
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_adv_tundra_fixablerobot": {
        "id": "achv_adv_tundra_fixablerobot",
        "type": "achv_type_adventure",
        "groupId": "achv_group_adv_tundra",
        "order": 4,
        "initLevel": 1,
        "upgradable": true,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "1": {
                "achieveLevel": 1,
                "conditions": [
                    {
                        "conditionId": "achv_adv_tundra_fixablerobot_1_cond_1",
                        "progressToCompare": 25
                    }
                ]
            },
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_adv_tundra_fixablerobot_2_cond_1",
                        "progressToCompare": 35
                    }
                ]
            },
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_adv_tundra_fixablerobot_3_cond_1",
                        "progressToCompare": 43
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_adv_tundra_running": {
        "id": "achv_adv_tundra_running",
        "type": "achv_type_adventure",
        "groupId": "achv_group_adv_tundra",
        "order": 5,
        "initLevel": 1,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "1": {
                "achieveLevel": 1,
                "conditions": [
                    {
                        "conditionId": "achv_adv_tundra_running_1_cond_1",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_adv_tundra_running_1_cond_2",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_adv_tundra_running_1_cond_3",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_adv_tundra_running_1_cond_4",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_adv_wuling_arrow": {
        "id": "achv_adv_wuling_arrow",
        "type": "achv_type_adventure",
        "groupId": "achv_group_adv_wuling",
        "order": 21,
        "initLevel": 2,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_adv_wuling_arrow_2_cond_1",
                        "progressToCompare": 16
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_adv_wuling_balloon": {
        "id": "achv_adv_wuling_balloon",
        "type": "achv_type_adventure",
        "groupId": "achv_group_adv_wuling",
        "order": 19,
        "initLevel": 1,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "1": {
                "achieveLevel": 1,
                "conditions": [
                    {
                        "conditionId": "achv_adv_wuling_balloon_1_cond_1",
                        "progressToCompare": 26
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_adv_wuling_blackhole_clean": {
        "id": "achv_adv_wuling_blackhole_clean",
        "type": "achv_type_adventure",
        "groupId": "achv_group_adv_wuling",
        "order": 20,
        "initLevel": 3,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_adv_wuling_blackhole_clean_3_cond_1",
                        "progressToCompare": 5
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_adv_wuling_box_1": {
        "id": "achv_adv_wuling_box_1",
        "type": "achv_type_adventure",
        "groupId": "achv_group_adv_wuling",
        "order": 3,
        "initLevel": 3,
        "upgradable": false,
        "plateable": true,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_adv_wuling_box_1_3_cond_1",
                        "progressToCompare": 227
                    }
                ]
            }
        },
        "plateConditions": [
            {
                "conditionId": "achv_adv_wuling_box_1_plating_cond_1",
                "progressToCompare": 242
            }
        ]
    },
    "achv_adv_wuling_box_2": {
        "id": "achv_adv_wuling_box_2",
        "type": "achv_type_adventure",
        "groupId": "achv_group_adv_wuling",
        "order": 10,
        "initLevel": 2,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_adv_wuling_box_2_2_cond_1",
                        "progressToCompare": 121
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_adv_wuling_box_3": {
        "id": "achv_adv_wuling_box_3",
        "type": "achv_type_adventure",
        "groupId": "achv_group_adv_wuling",
        "order": 17,
        "initLevel": 2,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_adv_wuling_box_3_2_cond_1",
                        "progressToCompare": 151
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_adv_wuling_bugball": {
        "id": "achv_adv_wuling_bugball",
        "type": "achv_type_adventure",
        "groupId": "achv_group_adv_wuling",
        "order": 23,
        "initLevel": 2,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_adv_wuling_bugball_2_cond_1",
                        "progressToCompare": 18
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_adv_wuling_campfire_1": {
        "id": "achv_adv_wuling_campfire_1",
        "type": "achv_type_adventure",
        "groupId": "achv_group_adv_wuling",
        "order": 1,
        "initLevel": 1,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "1": {
                "achieveLevel": 1,
                "conditions": [
                    {
                        "conditionId": "achv_adv_wuling_campfire_1_1_cond_1",
                        "progressToCompare": 19
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_adv_wuling_campfire_2": {
        "id": "achv_adv_wuling_campfire_2",
        "type": "achv_type_adventure",
        "groupId": "achv_group_adv_wuling",
        "order": 8,
        "initLevel": 1,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "1": {
                "achieveLevel": 1,
                "conditions": [
                    {
                        "conditionId": "achv_adv_wuling_campfire_2_1_cond_1",
                        "progressToCompare": 19
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_adv_wuling_campfire_3": {
        "id": "achv_adv_wuling_campfire_3",
        "type": "achv_type_adventure",
        "groupId": "achv_group_adv_wuling",
        "order": 15,
        "initLevel": 1,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "1": {
                "achieveLevel": 1,
                "conditions": [
                    {
                        "conditionId": "achv_adv_wuling_campfire_3_1_cond_1",
                        "progressToCompare": 22
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_adv_wuling_clean": {
        "id": "achv_adv_wuling_clean",
        "type": "achv_type_adventure",
        "groupId": "achv_group_adv_wuling",
        "order": 7,
        "initLevel": 1,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "1": {
                "achieveLevel": 1,
                "conditions": [
                    {
                        "conditionId": "achv_adv_wuling_clean_1_cond_1",
                        "progressToCompare": 3
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_adv_wuling_documents_1": {
        "id": "achv_adv_wuling_documents_1",
        "type": "achv_type_adventure",
        "groupId": "achv_group_adv_wuling",
        "order": 4,
        "initLevel": 2,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_adv_wuling_documents_1_2_cond_1",
                        "progressToCompare": 2
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_adv_wuling_ether_1": {
        "id": "achv_adv_wuling_ether_1",
        "type": "achv_type_adventure",
        "groupId": "achv_group_adv_wuling",
        "order": 2,
        "initLevel": 3,
        "upgradable": false,
        "plateable": true,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_adv_wuling_ether_1_3_cond_1",
                        "progressToCompare": 74
                    }
                ]
            }
        },
        "plateConditions": [
            {
                "conditionId": "achv_adv_wuling_ether_1_plating_cond_1",
                "progressToCompare": 81
            }
        ]
    },
    "achv_adv_wuling_ether_2": {
        "id": "achv_adv_wuling_ether_2",
        "type": "achv_type_adventure",
        "groupId": "achv_group_adv_wuling",
        "order": 9,
        "initLevel": 2,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_adv_wuling_ether_2_2_cond_1",
                        "progressToCompare": 59
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_adv_wuling_ether_3": {
        "id": "achv_adv_wuling_ether_3",
        "type": "achv_type_adventure",
        "groupId": "achv_group_adv_wuling",
        "order": 16,
        "initLevel": 2,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_adv_wuling_ether_3_2_cond_1",
                        "progressToCompare": 59
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_adv_wuling_find_difference": {
        "id": "achv_adv_wuling_find_difference",
        "type": "achv_type_adventure",
        "groupId": "achv_group_adv_wuling",
        "order": 18,
        "initLevel": 2,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_adv_wuling_find_difference_2_cond_1",
                        "progressToCompare": 8
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_adv_wuling_floor_1": {
        "id": "achv_adv_wuling_floor_1",
        "type": "achv_type_adventure",
        "groupId": "achv_group_adv_wuling",
        "order": 5,
        "initLevel": 1,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "1": {
                "achieveLevel": 1,
                "conditions": [
                    {
                        "conditionId": "achv_adv_wuling_floor_1_1_cond_1",
                        "progressToCompare": 8
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_adv_wuling_floor_2": {
        "id": "achv_adv_wuling_floor_2",
        "type": "achv_type_adventure",
        "groupId": "achv_group_adv_wuling",
        "order": 11,
        "initLevel": 1,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "1": {
                "achieveLevel": 1,
                "conditions": [
                    {
                        "conditionId": "achv_adv_wuling_floor_2_1_cond_1",
                        "progressToCompare": 6
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_adv_wuling_frog_1": {
        "id": "achv_adv_wuling_frog_1",
        "type": "achv_type_adventure",
        "groupId": "achv_group_adv_wuling",
        "order": 6,
        "initLevel": 1,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "1": {
                "achieveLevel": 1,
                "conditions": [
                    {
                        "conditionId": "achv_adv_wuling_frog_1_1_cond_1",
                        "progressToCompare": 6
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_adv_wuling_frog_2": {
        "id": "achv_adv_wuling_frog_2",
        "type": "achv_type_adventure",
        "groupId": "achv_group_adv_wuling",
        "order": 12,
        "initLevel": 1,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "1": {
                "achieveLevel": 1,
                "conditions": [
                    {
                        "conditionId": "achv_adv_wuling_frog_2_1_cond_1",
                        "progressToCompare": 3
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_adv_wuling_hyper_clean": {
        "id": "achv_adv_wuling_hyper_clean",
        "type": "achv_type_adventure",
        "groupId": "achv_group_adv_wuling",
        "order": 14,
        "initLevel": 1,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "1": {
                "achieveLevel": 1,
                "conditions": [
                    {
                        "conditionId": "achv_adv_wuling_hyper_clean_1_cond_1",
                        "progressToCompare": 6
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_adv_wuling_minimap_1": {
        "id": "achv_adv_wuling_minimap_1",
        "type": "achv_type_adventure",
        "groupId": "achv_group_adv_wuling",
        "order": 22,
        "initLevel": 2,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_adv_wuling_minimap_1_2_cond_1",
                        "progressToCompare": 28
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_adv_wuling_watergun_1": {
        "id": "achv_adv_wuling_watergun_1",
        "type": "achv_type_adventure",
        "groupId": "achv_group_adv_wuling",
        "order": 13,
        "initLevel": 1,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "1": {
                "achieveLevel": 1,
                "conditions": [
                    {
                        "conditionId": "achv_adv_wuling_watergun_1_1_cond_1",
                        "progressToCompare": 8
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_bat_charged": {
        "id": "achv_bat_charged",
        "type": "achv_type_battle",
        "groupId": "achv_group_bat_skill",
        "order": 7,
        "initLevel": 1,
        "upgradable": true,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "1": {
                "achieveLevel": 1,
                "conditions": [
                    {
                        "conditionId": "achv_bat_charged_1_cond_1",
                        "progressToCompare": 30
                    }
                ]
            },
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_bat_charged_2_cond_1",
                        "progressToCompare": 50
                    }
                ]
            },
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_bat_charged_3_cond_1",
                        "progressToCompare": 100
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_bat_charged_hsbear": {
        "id": "achv_bat_charged_hsbear",
        "type": "achv_type_battle",
        "groupId": "achv_group_bat_skill",
        "order": 16,
        "initLevel": 2,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_bat_charged_hsbear_2_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_bat_comboskill": {
        "id": "achv_bat_comboskill",
        "type": "achv_type_battle",
        "groupId": "achv_group_bat_skill",
        "order": 1,
        "initLevel": 1,
        "upgradable": true,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "1": {
                "achieveLevel": 1,
                "conditions": [
                    {
                        "conditionId": "achv_bat_comboskill_1_cond_1",
                        "progressToCompare": 500
                    }
                ]
            },
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_bat_comboskill_2_cond_1",
                        "progressToCompare": 1000
                    }
                ]
            },
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_bat_comboskill_3_cond_1",
                        "progressToCompare": 2000
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_bat_defeat_agtrinit": {
        "id": "achv_bat_defeat_agtrinit",
        "type": "achv_type_battle",
        "groupId": "achv_group_bat_skill",
        "order": 5,
        "initLevel": 3,
        "upgradable": false,
        "plateable": true,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_bat_defeat_agtrinit_3_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": [
            {
                "conditionId": "achv_bat_defeat_agtrinit_plating_cond_1",
                "progressToCompare": 240
            }
        ]
    },
    "achv_bat_defeat_bigtree": {
        "id": "achv_bat_defeat_bigtree",
        "type": "achv_type_battle",
        "groupId": "achv_group_bat_skill",
        "order": 22,
        "initLevel": 2,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_bat_defeat_bigtree_2_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_bat_defeat_dodge_jzogre": {
        "id": "achv_bat_defeat_dodge_jzogre",
        "type": "achv_type_battle",
        "groupId": "achv_group_bat_skill",
        "order": 19,
        "initLevel": 2,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_bat_defeat_dodge_jzogre_2_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_bat_defeat_ethillu": {
        "id": "achv_bat_defeat_ethillu",
        "type": "achv_type_battle",
        "groupId": "achv_group_bat_skill",
        "order": 17,
        "initLevel": 2,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_bat_defeat_ethillu_2_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_bat_defeat_fdcentur": {
        "id": "achv_bat_defeat_fdcentur",
        "type": "achv_type_battle",
        "groupId": "achv_group_bat_skill",
        "order": 21,
        "initLevel": 3,
        "upgradable": false,
        "plateable": true,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_bat_defeat_fdcentur_3_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": [
            {
                "conditionId": "achv_bat_defeat_fdcentur_plating_cond_1",
                "progressToCompare": 200
            }
        ]
    },
    "achv_bat_defeat_hsbear": {
        "id": "achv_bat_defeat_hsbear",
        "type": "achv_type_battle",
        "groupId": "achv_group_bat_skill",
        "order": 15,
        "initLevel": 2,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_bat_defeat_hsbear_2_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_bat_defeat_jzmking": {
        "id": "achv_bat_defeat_jzmking",
        "type": "achv_type_battle",
        "groupId": "achv_group_bat_skill",
        "order": 18,
        "initLevel": 2,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_bat_defeat_jzmking_2_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_bat_defeat_klbear": {
        "id": "achv_bat_defeat_klbear",
        "type": "achv_type_battle",
        "groupId": "achv_group_bat_skill",
        "order": 20,
        "initLevel": 2,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_bat_defeat_klbear_2_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_bat_defeat_nefarp": {
        "id": "achv_bat_defeat_nefarp",
        "type": "achv_type_battle",
        "groupId": "achv_group_bat_skill",
        "order": 14,
        "initLevel": 3,
        "upgradable": false,
        "plateable": true,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_bat_defeat_nefarp_3_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": [
            {
                "conditionId": "achv_bat_defeat_nefarp_plating_cond_1",
                "progressToCompare": 200
            }
        ]
    },
    "achv_bat_defeat_palesent": {
        "id": "achv_bat_defeat_palesent",
        "type": "achv_type_battle",
        "groupId": "achv_group_bat_skill",
        "order": 6,
        "initLevel": 3,
        "upgradable": false,
        "plateable": true,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_bat_defeat_palesent_3_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": [
            {
                "conditionId": "achv_bat_defeat_palesent_plating_cond_1",
                "progressToCompare": 240
            }
        ]
    },
    "achv_bat_defeat_rodin": {
        "id": "achv_bat_defeat_rodin",
        "type": "achv_type_battle",
        "groupId": "achv_group_bat_skill",
        "order": 4,
        "initLevel": 3,
        "upgradable": false,
        "plateable": true,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_bat_defeat_rodin_3_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": [
            {
                "conditionId": "achv_bat_defeat_rodin_plating_cond_1",
                "progressToCompare": 120
            }
        ]
    },
    "achv_bat_defeat_ruanyi": {
        "id": "achv_bat_defeat_ruanyi",
        "type": "achv_type_battle",
        "groupId": "achv_group_bat_skill",
        "order": 11,
        "initLevel": 3,
        "upgradable": false,
        "plateable": true,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_bat_defeat_ruanyi_3_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": [
            {
                "conditionId": "achv_bat_defeat_ruanyi_plating_cond_1",
                "progressToCompare": 200
            }
        ]
    },
    "achv_bat_dung_char": {
        "id": "achv_bat_dung_char",
        "type": "achv_type_battle",
        "groupId": "achv_group_bat_dung",
        "order": 4,
        "initLevel": 1,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "1": {
                "achieveLevel": 1,
                "conditions": [
                    {
                        "conditionId": "achv_bat_dung_char_1_cond_1",
                        "progressToCompare": 5
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_bat_dung_resource": {
        "id": "achv_bat_dung_resource",
        "type": "achv_type_battle",
        "groupId": "achv_group_bat_dung",
        "order": 1,
        "initLevel": 2,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_bat_dung_resource_2_cond_1",
                        "progressToCompare": 6
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_bat_dung_ss": {
        "id": "achv_bat_dung_ss",
        "type": "achv_type_battle",
        "groupId": "achv_group_bat_dung",
        "order": 2,
        "initLevel": 2,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_bat_dung_ss_2_cond_1",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_bat_dung_ss_2_cond_2",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_bat_dung_ss_2_cond_3",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_bat_dung_ss_2_cond_4",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_bat_dung_ss_2_cond_5",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_bat_enemyspawner": {
        "id": "achv_bat_enemyspawner",
        "type": "achv_type_battle",
        "groupId": "achv_group_bat_dung",
        "order": 3,
        "initLevel": 2,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_bat_enemyspawner_2_cond_1",
                        "progressToCompare": 5
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_bat_eny_ace": {
        "id": "achv_bat_eny_ace",
        "type": "achv_type_battle",
        "groupId": "achv_group_bat_skill",
        "order": 9,
        "initLevel": 2,
        "upgradable": false,
        "plateable": false,
        "specialProgress": true,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_bat_eny_ace_2_cond_1",
                        "progressToCompare": 5
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_bat_eny_building_kill": {
        "id": "achv_bat_eny_building_kill",
        "type": "achv_type_battle",
        "groupId": "achv_group_bat_skill",
        "order": 10,
        "initLevel": 1,
        "upgradable": true,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "1": {
                "achieveLevel": 1,
                "conditions": [
                    {
                        "conditionId": "achv_bat_eny_building_kill_1_cond_1",
                        "progressToCompare": 10
                    }
                ]
            },
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_bat_eny_building_kill_2_cond_1",
                        "progressToCompare": 100
                    }
                ]
            },
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_bat_eny_building_kill_3_cond_1",
                        "progressToCompare": 500
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_bat_eny_cannot_move": {
        "id": "achv_bat_eny_cannot_move",
        "type": "achv_type_battle",
        "groupId": "achv_group_bat_skill",
        "order": 8,
        "initLevel": 2,
        "upgradable": false,
        "plateable": false,
        "specialProgress": true,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_bat_eny_cannot_move_2_cond_1",
                        "progressToCompare": 20
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_bat_frozen": {
        "id": "achv_bat_frozen",
        "type": "achv_type_battle",
        "groupId": "achv_group_bat_skill",
        "order": 13,
        "initLevel": 1,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "1": {
                "achieveLevel": 1,
                "conditions": [
                    {
                        "conditionId": "achv_bat_frozen_1_cond_1",
                        "progressToCompare": 10
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_bat_hard_1": {
        "id": "achv_bat_hard_1",
        "type": "achv_type_battle",
        "groupId": "achv_group_bat_dung",
        "order": 6,
        "initLevel": 2,
        "upgradable": false,
        "plateable": true,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_bat_hard_1_2_cond_1",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_bat_hard_1_2_cond_2",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_bat_hard_1_2_cond_3",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": [
            {
                "conditionId": "achv_bat_hard_1_plating_cond_1",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_bat_hard_1_plating_cond_2",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_bat_hard_1_plating_cond_3",
                "progressToCompare": 1
            }
        ]
    },
    "achv_bat_hard_2": {
        "id": "achv_bat_hard_2",
        "type": "achv_type_battle",
        "groupId": "achv_group_bat_dung",
        "order": 5,
        "initLevel": 2,
        "upgradable": false,
        "plateable": true,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_bat_hard_2_2_cond_1",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_bat_hard_2_2_cond_2",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_bat_hard_2_2_cond_3",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": [
            {
                "conditionId": "achv_bat_hard_2_plating_cond_1",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_bat_hard_2_plating_cond_2",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_bat_hard_2_plating_cond_3",
                "progressToCompare": 1
            }
        ]
    },
    "achv_bat_hard_3": {
        "id": "achv_bat_hard_3",
        "type": "achv_type_battle",
        "groupId": "achv_group_bat_dung",
        "order": 7,
        "initLevel": 2,
        "upgradable": false,
        "plateable": true,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_bat_hard_3_2_cond_1",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_bat_hard_3_2_cond_2",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_bat_hard_3_2_cond_3",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": [
            {
                "conditionId": "achv_bat_hard_3_plating_cond_1",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_bat_hard_3_plating_cond_2",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_bat_hard_3_plating_cond_3",
                "progressToCompare": 1
            }
        ]
    },
    "achv_bat_hard_4": {
        "id": "achv_bat_hard_4",
        "type": "achv_type_battle",
        "groupId": "achv_group_bat_dung",
        "order": 8,
        "initLevel": 2,
        "upgradable": false,
        "plateable": true,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_bat_hard_4_2_cond_1",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_bat_hard_4_2_cond_2",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_bat_hard_4_2_cond_3",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_bat_hard_4_2_cond_4",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_bat_hard_4_2_cond_5",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_bat_hard_4_2_cond_6",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": [
            {
                "conditionId": "achv_bat_hard_4_plating_cond_1",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_bat_hard_4_plating_cond_2",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_bat_hard_4_plating_cond_3",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_bat_hard_4_plating_cond_4",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_bat_hard_4_plating_cond_5",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_bat_hard_4_plating_cond_6",
                "progressToCompare": 1
            }
        ]
    },
    "achv_bat_hard_5": {
        "id": "achv_bat_hard_5",
        "type": "achv_type_battle",
        "groupId": "achv_group_bat_dung",
        "order": 9,
        "initLevel": 2,
        "upgradable": false,
        "plateable": true,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_bat_hard_5_2_cond_1",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_bat_hard_5_2_cond_2",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_bat_hard_5_2_cond_3",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_bat_hard_5_2_cond_4",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_bat_hard_5_2_cond_5",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_bat_hard_5_2_cond_6",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": [
            {
                "conditionId": "achv_bat_hard_5_plating_cond_1",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_bat_hard_5_plating_cond_2",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_bat_hard_5_plating_cond_3",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_bat_hard_5_plating_cond_4",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_bat_hard_5_plating_cond_5",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_bat_hard_5_plating_cond_6",
                "progressToCompare": 1
            }
        ]
    },
    "achv_bat_hard_6": {
        "id": "achv_bat_hard_6",
        "type": "achv_type_battle",
        "groupId": "achv_group_bat_dung",
        "order": 10,
        "initLevel": 2,
        "upgradable": false,
        "plateable": true,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_bat_hard_6_2_cond_1",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_bat_hard_6_2_cond_2",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_bat_hard_6_2_cond_3",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_bat_hard_6_2_cond_4",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": [
            {
                "conditionId": "achv_bat_hard_6_plating_cond_1",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_bat_hard_6_plating_cond_2",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_bat_hard_6_plating_cond_3",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_bat_hard_6_plating_cond_4",
                "progressToCompare": 1
            }
        ]
    },
    "achv_bat_hard_7": {
        "id": "achv_bat_hard_7",
        "type": "achv_type_battle",
        "groupId": "achv_group_bat_dung",
        "order": 11,
        "initLevel": 2,
        "upgradable": false,
        "plateable": true,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_bat_hard_7_2_cond_1",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_bat_hard_7_2_cond_2",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_bat_hard_7_2_cond_3",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_bat_hard_7_2_cond_4",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": [
            {
                "conditionId": "achv_bat_hard_7_plating_cond_1",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_bat_hard_7_plating_cond_2",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_bat_hard_7_plating_cond_3",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_bat_hard_7_plating_cond_4",
                "progressToCompare": 1
            }
        ]
    },
    "achv_bat_magical_AS": {
        "id": "achv_bat_magical_AS",
        "type": "achv_type_battle",
        "groupId": "achv_group_bat_skill",
        "order": 3,
        "initLevel": 1,
        "upgradable": true,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "1": {
                "achieveLevel": 1,
                "conditions": [
                    {
                        "conditionId": "achv_bat_magical_AS_1_cond_1",
                        "progressToCompare": 50
                    }
                ]
            },
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_bat_magical_AS_2_cond_1",
                        "progressToCompare": 300
                    }
                ]
            },
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_bat_magical_AS_3_cond_1",
                        "progressToCompare": 500
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_bat_physical_AS": {
        "id": "achv_bat_physical_AS",
        "type": "achv_type_battle",
        "groupId": "achv_group_bat_skill",
        "order": 2,
        "initLevel": 1,
        "upgradable": true,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "1": {
                "achieveLevel": 1,
                "conditions": [
                    {
                        "conditionId": "achv_bat_physical_AS_1_cond_1",
                        "progressToCompare": 50
                    }
                ]
            },
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_bat_physical_AS_2_cond_1",
                        "progressToCompare": 300
                    }
                ]
            },
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_bat_physical_AS_3_cond_1",
                        "progressToCompare": 500
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_bat_rescue_from_geyunweng": {
        "id": "achv_bat_rescue_from_geyunweng",
        "type": "achv_type_battle",
        "groupId": "achv_group_bat_skill",
        "order": 12,
        "initLevel": 2,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_bat_rescue_from_geyunweng_2_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_bat_smalltree": {
        "id": "achv_bat_smalltree",
        "type": "achv_type_battle",
        "groupId": "achv_group_bat_skill",
        "order": 23,
        "initLevel": 2,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_bat_smalltree_2_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_event_clean": {
        "id": "achv_event_clean",
        "type": "achv_type_event",
        "groupId": "achv_group_event_default",
        "order": 3,
        "initLevel": 2,
        "upgradable": false,
        "plateable": true,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_event_clean_2_cond_1",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_event_clean_2_cond_2",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_event_clean_2_cond_3",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_event_clean_2_cond_4",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_event_clean_2_cond_5",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_event_clean_2_cond_6",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_event_clean_2_cond_7",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": [
            {
                "conditionId": "achv_event_clean_plating_cond_1",
                "progressToCompare": 120
            }
        ]
    },
    "achv_event_contingency_contract_0": {
        "id": "achv_event_contingency_contract_0",
        "type": "achv_type_event",
        "groupId": "achv_group_event_default",
        "order": 6,
        "initLevel": 3,
        "upgradable": false,
        "plateable": false,
        "specialProgress": true,
        "applyRareEffect": false,
        "levelInfos": {
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_event_contingency_contract_0_3_cond_1",
                        "progressToCompare": 20
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_event_dungfight": {
        "id": "achv_event_dungfight",
        "type": "achv_type_event",
        "groupId": "achv_group_event_default",
        "order": 4,
        "initLevel": 2,
        "upgradable": false,
        "plateable": true,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_event_dungfight_2_cond_1",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_event_dungfight_2_cond_2",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_event_dungfight_2_cond_3",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_event_dungfight_2_cond_4",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_event_dungfight_2_cond_5",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_event_dungfight_2_cond_6",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_event_dungfight_2_cond_7",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_event_dungfight_2_cond_8",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": [
            {
                "conditionId": "achv_event_dungfight_plating_cond_1",
                "progressToCompare": 120
            }
        ]
    },
    "achv_event_formula": {
        "id": "achv_event_formula",
        "type": "achv_type_event",
        "groupId": "achv_group_event_default",
        "order": 5,
        "initLevel": 2,
        "upgradable": false,
        "plateable": true,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_event_formula_2_cond_1",
                        "progressToCompare": 800000
                    }
                ]
            }
        },
        "plateConditions": [
            {
                "conditionId": "achv_event_formula_plating_cond_1",
                "progressToCompare": 20000
            }
        ]
    },
    "achv_event_formula2": {
        "id": "achv_event_formula2",
        "type": "achv_type_event",
        "groupId": "achv_group_event_default",
        "order": 11,
        "initLevel": 2,
        "upgradable": false,
        "plateable": true,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_event_formula2_2_cond_1",
                        "progressToCompare": 800000
                    }
                ]
            }
        },
        "plateConditions": [
            {
                "conditionId": "achv_event_formula2_plating_cond_1",
                "progressToCompare": 20000
            }
        ]
    },
    "achv_event_racingdungeon_1": {
        "id": "achv_event_racingdungeon_1",
        "type": "achv_type_event",
        "groupId": "achv_group_event_default",
        "order": 8,
        "initLevel": 2,
        "upgradable": false,
        "plateable": true,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_event_racingdungeon_1_2_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": [
            {
                "conditionId": "achv_event_racingdungeon_1_plating_cond_1",
                "progressToCompare": 14
            }
        ]
    },
    "achv_event_takestwo_1": {
        "id": "achv_event_takestwo_1",
        "type": "achv_type_event",
        "groupId": "achv_group_event_default",
        "order": 7,
        "initLevel": 2,
        "upgradable": false,
        "plateable": true,
        "specialProgress": true,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_event_takestwo_1_2_cond_1",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_event_takestwo_1_2_cond_2",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_event_takestwo_1_2_cond_3",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_event_takestwo_1_2_cond_4",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_event_takestwo_1_2_cond_5",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_event_takestwo_1_2_cond_6",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_event_takestwo_1_2_cond_7",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_event_takestwo_1_2_cond_8",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": [
            {
                "conditionId": "achv_event_takestwo_1_plating_cond_1",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_event_takestwo_1_plating_cond_2",
                "progressToCompare": 0
            },
            {
                "conditionId": "achv_event_takestwo_1_plating_cond_3",
                "progressToCompare": 0
            },
            {
                "conditionId": "achv_event_takestwo_1_plating_cond_4",
                "progressToCompare": 0
            },
            {
                "conditionId": "achv_event_takestwo_1_plating_cond_5",
                "progressToCompare": 0
            },
            {
                "conditionId": "achv_event_takestwo_1_plating_cond_6",
                "progressToCompare": 0
            },
            {
                "conditionId": "achv_event_takestwo_1_plating_cond_7",
                "progressToCompare": 0
            },
            {
                "conditionId": "achv_event_takestwo_1_plating_cond_8",
                "progressToCompare": 0
            },
            {
                "conditionId": "achv_event_takestwo_1_plating_cond_9",
                "progressToCompare": 0
            }
        ]
    },
    "achv_event_tundra_challenge_dung": {
        "id": "achv_event_tundra_challenge_dung",
        "type": "achv_type_event",
        "groupId": "achv_group_event_default",
        "order": 1,
        "initLevel": 2,
        "upgradable": false,
        "plateable": true,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_event_tundra_challenge_dung_2_cond_1",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_event_tundra_challenge_dung_2_cond_2",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_event_tundra_challenge_dung_2_cond_3",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_event_tundra_challenge_dung_2_cond_4",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_event_tundra_challenge_dung_2_cond_5",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_event_tundra_challenge_dung_2_cond_6",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_event_tundra_challenge_dung_2_cond_7",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_event_tundra_challenge_dung_2_cond_8",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_event_tundra_challenge_dung_2_cond_9",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": [
            {
                "conditionId": "achv_event_tundra_challenge_dung_plating_cond_1",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_event_tundra_challenge_dung_plating_cond_2",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_event_tundra_challenge_dung_plating_cond_3",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_event_tundra_challenge_dung_plating_cond_4",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_event_tundra_challenge_dung_plating_cond_5",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_event_tundra_challenge_dung_plating_cond_6",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_event_tundra_challenge_dung_plating_cond_7",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_event_tundra_challenge_dung_plating_cond_8",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_event_tundra_challenge_dung_plating_cond_9",
                "progressToCompare": 1
            }
        ]
    },
    "achv_event_wuling_challenge_dung": {
        "id": "achv_event_wuling_challenge_dung",
        "type": "achv_type_event",
        "groupId": "achv_group_event_default",
        "order": 2,
        "initLevel": 2,
        "upgradable": false,
        "plateable": true,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_event_wuling_challenge_dung_2_cond_1",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_event_wuling_challenge_dung_2_cond_2",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_event_wuling_challenge_dung_2_cond_3",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_event_wuling_challenge_dung_2_cond_4",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_event_wuling_challenge_dung_2_cond_5",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_event_wuling_challenge_dung_2_cond_6",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": [
            {
                "conditionId": "achv_event_wuling_challenge_dung_plating_cond_1",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_event_wuling_challenge_dung_plating_cond_2",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_event_wuling_challenge_dung_plating_cond_3",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_event_wuling_challenge_dung_plating_cond_4",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_event_wuling_challenge_dung_plating_cond_5",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_event_wuling_challenge_dung_plating_cond_6",
                "progressToCompare": 1
            }
        ]
    },
    "achv_event_wuling_challenge_dung_02": {
        "id": "achv_event_wuling_challenge_dung_02",
        "type": "achv_type_event",
        "groupId": "achv_group_event_default",
        "order": 9,
        "initLevel": 2,
        "upgradable": false,
        "plateable": true,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_event_wuling_challenge_dung_02_2_cond_1",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_event_wuling_challenge_dung_02_2_cond_2",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_event_wuling_challenge_dung_02_2_cond_3",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_event_wuling_challenge_dung_02_2_cond_4",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_event_wuling_challenge_dung_02_2_cond_5",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_event_wuling_challenge_dung_02_2_cond_6",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": [
            {
                "conditionId": "achv_event_wuling_challenge_dung_02_plating_cond_1",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_event_wuling_challenge_dung_02_plating_cond_2",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_event_wuling_challenge_dung_02_plating_cond_3",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_event_wuling_challenge_dung_02_plating_cond_4",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_event_wuling_challenge_dung_02_plating_cond_5",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_event_wuling_challenge_dung_02_plating_cond_6",
                "progressToCompare": 1
            }
        ]
    },
    "achv_event_wuling_racing_1": {
        "id": "achv_event_wuling_racing_1",
        "type": "achv_type_event",
        "groupId": "achv_group_event_default",
        "order": 10,
        "initLevel": 2,
        "upgradable": false,
        "plateable": true,
        "specialProgress": true,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_event_wuling_racing_1_2_cond_1",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_event_wuling_racing_1_2_cond_2",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_event_wuling_racing_1_2_cond_3",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_event_wuling_racing_1_2_cond_4",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": [
            {
                "conditionId": "achv_event_wuling_racing_1_plating_cond_1",
                "progressToCompare": 200
            },
            {
                "conditionId": "achv_event_wuling_racing_1_plating_cond_2",
                "progressToCompare": 150
            },
            {
                "conditionId": "achv_event_wuling_racing_1_plating_cond_3",
                "progressToCompare": 240
            },
            {
                "conditionId": "achv_event_wuling_racing_1_plating_cond_4",
                "progressToCompare": 150
            }
        ]
    },
    "achv_fac_blackbox_1": {
        "id": "achv_fac_blackbox_1",
        "type": "achv_type_factory",
        "groupId": "achv_group_fac_factory",
        "order": 10,
        "initLevel": 1,
        "upgradable": true,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "1": {
                "achieveLevel": 1,
                "conditions": [
                    {
                        "conditionId": "achv_fac_blackbox_1_1_cond_1",
                        "progressToCompare": 5
                    }
                ]
            },
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_fac_blackbox_1_2_cond_1",
                        "progressToCompare": 10
                    }
                ]
            },
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_fac_blackbox_1_3_cond_1",
                        "progressToCompare": 20
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_fac_blackbox_2": {
        "id": "achv_fac_blackbox_2",
        "type": "achv_type_factory",
        "groupId": "achv_group_fac_factory",
        "order": 20,
        "initLevel": 3,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_fac_blackbox_2_3_cond_1",
                        "progressToCompare": 30
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_fac_coupon_tundra": {
        "id": "achv_fac_coupon_tundra",
        "type": "achv_type_factory",
        "groupId": "achv_group_fac_factory",
        "order": 3,
        "initLevel": 1,
        "upgradable": true,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "1": {
                "achieveLevel": 1,
                "conditions": [
                    {
                        "conditionId": "achv_fac_coupon_tundra_1_cond_1",
                        "progressToCompare": 20000000
                    }
                ]
            },
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_fac_coupon_tundra_2_cond_1",
                        "progressToCompare": 40000000
                    }
                ]
            },
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_fac_coupon_tundra_3_cond_1",
                        "progressToCompare": 80000000
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_fac_coupon_wuling_1": {
        "id": "achv_fac_coupon_wuling_1",
        "type": "achv_type_factory",
        "groupId": "achv_group_fac_factory",
        "order": 5,
        "initLevel": 1,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "1": {
                "achieveLevel": 1,
                "conditions": [
                    {
                        "conditionId": "achv_fac_coupon_wuling_1_1_cond_1",
                        "progressToCompare": 2000000
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_fac_coupon_wuling_2": {
        "id": "achv_fac_coupon_wuling_2",
        "type": "achv_type_factory",
        "groupId": "achv_group_fac_factory",
        "order": 11,
        "initLevel": 2,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_fac_coupon_wuling_2_2_cond_1",
                        "progressToCompare": 10000000
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_fac_coupon_wuling_3": {
        "id": "achv_fac_coupon_wuling_3",
        "type": "achv_type_factory",
        "groupId": "achv_group_fac_factory",
        "order": 14,
        "initLevel": 3,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_fac_coupon_wuling_3_3_cond_1",
                        "progressToCompare": 25000000
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_fac_coupon_wuling_4": {
        "id": "achv_fac_coupon_wuling_4",
        "type": "achv_type_factory",
        "groupId": "achv_group_fac_factory",
        "order": 16,
        "initLevel": 3,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_fac_coupon_wuling_4_3_cond_1",
                        "progressToCompare": 80000000
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_fac_coupon_wuling_5": {
        "id": "achv_fac_coupon_wuling_5",
        "type": "achv_type_factory",
        "groupId": "achv_group_fac_factory",
        "order": 18,
        "initLevel": 3,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_fac_coupon_wuling_5_3_cond_1",
                        "progressToCompare": 100000000
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_fac_domain_depot": {
        "id": "achv_fac_domain_depot",
        "type": "achv_type_factory",
        "groupId": "achv_group_fac_factory",
        "order": 8,
        "initLevel": 2,
        "upgradable": false,
        "plateable": true,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_fac_domain_depot_2_cond_1",
                        "progressToCompare": 20
                    }
                ]
            }
        },
        "plateConditions": [
            {
                "conditionId": "achv_fac_domain_depot_plating_cond_1",
                "progressToCompare": 20
            }
        ]
    },
    "achv_fac_domain_shop": {
        "id": "achv_fac_domain_shop",
        "type": "achv_type_factory",
        "groupId": "achv_group_fac_factory",
        "order": 7,
        "initLevel": 2,
        "upgradable": false,
        "plateable": true,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_fac_domain_shop_2_cond_1",
                        "progressToCompare": 15
                    }
                ]
            }
        },
        "plateConditions": [
            {
                "conditionId": "achv_fac_domain_shop_plating_cond_1",
                "progressToCompare": 1
            }
        ]
    },
    "achv_fac_kite_station": {
        "id": "achv_fac_kite_station",
        "type": "achv_type_factory",
        "groupId": "achv_group_fac_factory",
        "order": 9,
        "initLevel": 2,
        "upgradable": false,
        "plateable": true,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_fac_kite_station_2_cond_1",
                        "progressToCompare": 5
                    }
                ]
            }
        },
        "plateConditions": [
            {
                "conditionId": "achv_fac_kite_station_plating_cond_1",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_fac_kite_station_plating_cond_2",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_fac_kite_station_plating_cond_3",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_fac_kite_station_plating_cond_4",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_fac_kite_station_plating_cond_5",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_fac_kite_station_plating_cond_6",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_fac_kite_station_plating_cond_7",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_fac_kite_station_plating_cond_8",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_fac_kite_station_plating_cond_9",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_fac_kite_station_plating_cond_10",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_fac_kite_station_plating_cond_11",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_fac_kite_station_plating_cond_12",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_fac_kite_station_plating_cond_13",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_fac_kite_station_plating_cond_14",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_fac_kite_station_plating_cond_15",
                "progressToCompare": 1
            },
            {
                "conditionId": "achv_fac_kite_station_plating_cond_16",
                "progressToCompare": 1
            }
        ]
    },
    "achv_fac_recycle_station": {
        "id": "achv_fac_recycle_station",
        "type": "achv_type_factory",
        "groupId": "achv_group_fac_factory",
        "order": 6,
        "initLevel": 1,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "1": {
                "achieveLevel": 1,
                "conditions": [
                    {
                        "conditionId": "achv_fac_recycle_station_1_cond_1",
                        "progressToCompare": 50
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_fac_settlement_tundra": {
        "id": "achv_fac_settlement_tundra",
        "type": "achv_type_factory",
        "groupId": "achv_group_fac_factory",
        "order": 2,
        "initLevel": 2,
        "upgradable": false,
        "plateable": true,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_fac_settlement_tundra_2_cond_1",
                        "progressToCompare": 3
                    }
                ]
            }
        },
        "plateConditions": [
            {
                "conditionId": "achv_fac_settlement_tundra_plating_cond_1",
                "progressToCompare": 12
            }
        ]
    },
    "achv_fac_settlement_wuling_1": {
        "id": "achv_fac_settlement_wuling_1",
        "type": "achv_type_factory",
        "groupId": "achv_group_fac_factory",
        "order": 12,
        "initLevel": 2,
        "upgradable": false,
        "plateable": true,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_fac_settlement_wuling_1_2_cond_1",
                        "progressToCompare": 2
                    }
                ]
            }
        },
        "plateConditions": [
            {
                "conditionId": "achv_fac_settlement_wuling_1_plating_cond_1",
                "progressToCompare": 2
            }
        ]
    },
    "achv_fac_settlement_wuling_2": {
        "id": "achv_fac_settlement_wuling_2",
        "type": "achv_type_factory",
        "groupId": "achv_group_fac_factory",
        "order": 19,
        "initLevel": 2,
        "upgradable": false,
        "plateable": true,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_fac_settlement_wuling_2_2_cond_1",
                        "progressToCompare": 3
                    }
                ]
            }
        },
        "plateConditions": [
            {
                "conditionId": "achv_fac_settlement_wuling_2_plating_cond_1",
                "progressToCompare": 3
            }
        ]
    },
    "achv_fac_simulation_training": {
        "id": "achv_fac_simulation_training",
        "type": "achv_type_factory",
        "groupId": "achv_group_fac_factory",
        "order": 15,
        "initLevel": 2,
        "upgradable": false,
        "plateable": true,
        "specialProgress": true,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_fac_simulation_training_2_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": [
            {
                "conditionId": "achv_fac_simulation_training_plating_cond_1",
                "progressToCompare": 2
            }
        ]
    },
    "achv_fac_spaceship_fever_point": {
        "id": "achv_fac_spaceship_fever_point",
        "type": "achv_type_factory",
        "groupId": "achv_group_fac_spaceship",
        "order": 3,
        "initLevel": 1,
        "upgradable": true,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": true,
        "levelInfos": {
            "1": {
                "achieveLevel": 1,
                "conditions": [
                    {
                        "conditionId": "achv_fac_spaceship_fever_point_1_cond_1",
                        "progressToCompare": 5
                    }
                ]
            },
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_fac_spaceship_fever_point_2_cond_1",
                        "progressToCompare": 10
                    }
                ]
            },
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_fac_spaceship_fever_point_3_cond_1",
                        "progressToCompare": 20
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_fac_spaceship_gift": {
        "id": "achv_fac_spaceship_gift",
        "type": "achv_type_factory",
        "groupId": "achv_group_fac_spaceship",
        "order": 2,
        "initLevel": 1,
        "upgradable": true,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "1": {
                "achieveLevel": 1,
                "conditions": [
                    {
                        "conditionId": "achv_fac_spaceship_gift_1_cond_1",
                        "progressToCompare": 300
                    }
                ]
            },
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_fac_spaceship_gift_2_cond_1",
                        "progressToCompare": 500
                    }
                ]
            },
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_fac_spaceship_gift_3_cond_1",
                        "progressToCompare": 1000
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_fac_spaceship_level_1": {
        "id": "achv_fac_spaceship_level_1",
        "type": "achv_type_factory",
        "groupId": "achv_group_fac_spaceship",
        "order": 1,
        "initLevel": 3,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_fac_spaceship_level_1_3_cond_1",
                        "progressToCompare": 5
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_fac_techtree_jinlong_1": {
        "id": "achv_fac_techtree_jinlong_1",
        "type": "achv_type_factory",
        "groupId": "achv_group_fac_factory",
        "order": 4,
        "initLevel": 1,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "1": {
                "achieveLevel": 1,
                "conditions": [
                    {
                        "conditionId": "achv_fac_techtree_jinlong_1_1_cond_1",
                        "progressToCompare": 18
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_fac_techtree_jinlong_2": {
        "id": "achv_fac_techtree_jinlong_2",
        "type": "achv_type_factory",
        "groupId": "achv_group_fac_factory",
        "order": 10,
        "initLevel": 1,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "1": {
                "achieveLevel": 1,
                "conditions": [
                    {
                        "conditionId": "achv_fac_techtree_jinlong_2_1_cond_1",
                        "progressToCompare": 25
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_fac_techtree_jinlong_3": {
        "id": "achv_fac_techtree_jinlong_3",
        "type": "achv_type_factory",
        "groupId": "achv_group_fac_factory",
        "order": 13,
        "initLevel": 1,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "1": {
                "achieveLevel": 1,
                "conditions": [
                    {
                        "conditionId": "achv_fac_techtree_jinlong_3_1_cond_1",
                        "progressToCompare": 34
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_fac_techtree_jinlong_4": {
        "id": "achv_fac_techtree_jinlong_4",
        "type": "achv_type_factory",
        "groupId": "achv_group_fac_factory",
        "order": 17,
        "initLevel": 1,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "1": {
                "achieveLevel": 1,
                "conditions": [
                    {
                        "conditionId": "achv_fac_techtree_jinlong_4_1_cond_1",
                        "progressToCompare": 47
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_fac_techtree_tundra": {
        "id": "achv_fac_techtree_tundra",
        "type": "achv_type_factory",
        "groupId": "achv_group_fac_factory",
        "order": 1,
        "initLevel": 3,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_fac_techtree_tundra_3_cond_1",
                        "progressToCompare": 37
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_fac_typhoea_archery": {
        "id": "achv_fac_typhoea_archery",
        "type": "achv_type_factory",
        "groupId": "achv_group_fac_factory",
        "order": 21,
        "initLevel": 2,
        "upgradable": false,
        "plateable": true,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_fac_typhoea_archery_2_cond_1",
                        "progressToCompare": 5
                    },
                    {
                        "conditionId": "achv_fac_typhoea_archery_2_cond_2",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": [
            {
                "conditionId": "achv_fac_typhoea_archery_plating_cond_1",
                "progressToCompare": 4
            },
            {
                "conditionId": "achv_fac_typhoea_archery_plating_cond_2",
                "progressToCompare": 1
            }
        ]
    },
    "achv_growth_adventure_level": {
        "id": "achv_growth_adventure_level",
        "type": "achv_type_growth",
        "groupId": "achv_group_growth_default",
        "order": 8,
        "initLevel": 1,
        "upgradable": true,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "1": {
                "achieveLevel": 1,
                "conditions": [
                    {
                        "conditionId": "achv_growth_adventure_level_1_cond_1",
                        "progressToCompare": 20
                    }
                ]
            },
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_growth_adventure_level_2_cond_1",
                        "progressToCompare": 40
                    }
                ]
            },
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_growth_adventure_level_3_cond_1",
                        "progressToCompare": 60
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_growth_char_count_1": {
        "id": "achv_growth_char_count_1",
        "type": "achv_type_growth",
        "groupId": "achv_group_growth_default",
        "order": 1,
        "initLevel": 1,
        "upgradable": true,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": true,
        "levelInfos": {
            "1": {
                "achieveLevel": 1,
                "conditions": [
                    {
                        "conditionId": "achv_growth_char_count_1_1_cond_1",
                        "progressToCompare": 5
                    }
                ]
            },
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_growth_char_count_1_2_cond_1",
                        "progressToCompare": 10
                    }
                ]
            },
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_growth_char_count_1_3_cond_1",
                        "progressToCompare": 20
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_growth_char_potential_1": {
        "id": "achv_growth_char_potential_1",
        "type": "achv_type_growth",
        "groupId": "achv_group_growth_default",
        "order": 3,
        "initLevel": 1,
        "upgradable": true,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": true,
        "levelInfos": {
            "1": {
                "achieveLevel": 1,
                "conditions": [
                    {
                        "conditionId": "achv_growth_char_potential_1_1_cond_1",
                        "progressToCompare": 1
                    }
                ]
            },
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_growth_char_potential_1_2_cond_1",
                        "progressToCompare": 10
                    }
                ]
            },
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_growth_char_potential_1_3_cond_1",
                        "progressToCompare": 15
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_growth_char_skill_level_1": {
        "id": "achv_growth_char_skill_level_1",
        "type": "achv_type_growth",
        "groupId": "achv_group_growth_default",
        "order": 2,
        "initLevel": 1,
        "upgradable": true,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": true,
        "levelInfos": {
            "1": {
                "achieveLevel": 1,
                "conditions": [
                    {
                        "conditionId": "achv_growth_char_skill_level_1_1_cond_1",
                        "progressToCompare": 5
                    }
                ]
            },
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_growth_char_skill_level_1_2_cond_1",
                        "progressToCompare": 10
                    }
                ]
            },
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_growth_char_skill_level_1_3_cond_1",
                        "progressToCompare": 20
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_growth_equip_enhance": {
        "id": "achv_growth_equip_enhance",
        "type": "achv_type_growth",
        "groupId": "achv_group_growth_default",
        "order": 6,
        "initLevel": 3,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_growth_equip_enhance_3_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_growth_world_level": {
        "id": "achv_growth_world_level",
        "type": "achv_type_growth",
        "groupId": "achv_group_growth_default",
        "order": 7,
        "initLevel": 1,
        "upgradable": true,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "1": {
                "achieveLevel": 1,
                "conditions": [
                    {
                        "conditionId": "achv_growth_world_level_1_cond_1",
                        "progressToCompare": 2
                    }
                ]
            },
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_growth_world_level_2_cond_1",
                        "progressToCompare": 4
                    }
                ]
            },
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_growth_world_level_3_cond_1",
                        "progressToCompare": 7
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_growth_wpn_count_1": {
        "id": "achv_growth_wpn_count_1",
        "type": "achv_type_growth",
        "groupId": "achv_group_growth_default",
        "order": 4,
        "initLevel": 1,
        "upgradable": true,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": true,
        "levelInfos": {
            "1": {
                "achieveLevel": 1,
                "conditions": [
                    {
                        "conditionId": "achv_growth_wpn_count_1_1_cond_1",
                        "progressToCompare": 10
                    }
                ]
            },
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_growth_wpn_count_1_2_cond_1",
                        "progressToCompare": 20
                    }
                ]
            },
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_growth_wpn_count_1_3_cond_1",
                        "progressToCompare": 40
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_growth_wpn_skill_level": {
        "id": "achv_growth_wpn_skill_level",
        "type": "achv_type_growth",
        "groupId": "achv_group_growth_default",
        "order": 5,
        "initLevel": 3,
        "upgradable": false,
        "plateable": true,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_growth_wpn_skill_level_3_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": [
            {
                "conditionId": "achv_growth_wpn_skill_level_plating_cond_1",
                "progressToCompare": 1
            }
        ]
    },
    "achv_hide_aether_lock_clean": {
        "id": "achv_hide_aether_lock_clean",
        "type": "achv_type_hide",
        "groupId": "achv_group_hide_default",
        "order": 13,
        "initLevel": 2,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_hide_aether_lock_clean_2_cond_1",
                        "progressToCompare": 5
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_hide_banana": {
        "id": "achv_hide_banana",
        "type": "achv_type_hide",
        "groupId": "achv_group_hide_default",
        "order": 11,
        "initLevel": 1,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "1": {
                "achieveLevel": 1,
                "conditions": [
                    {
                        "conditionId": "achv_hide_banana_1_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_hide_cave": {
        "id": "achv_hide_cave",
        "type": "achv_type_hide",
        "groupId": "achv_group_hide_default",
        "order": 1,
        "initLevel": 2,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_hide_cave_2_cond_1",
                        "progressToCompare": 2
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_hide_cave_v1d5": {
        "id": "achv_hide_cave_v1d5",
        "type": "achv_type_hide",
        "groupId": "achv_group_hide_default",
        "order": 14,
        "initLevel": 1,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "1": {
                "achieveLevel": 1,
                "conditions": [
                    {
                        "conditionId": "achv_hide_cave_v1d5_1_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_hide_fly": {
        "id": "achv_hide_fly",
        "type": "achv_type_hide",
        "groupId": "achv_group_hide_default",
        "order": 2,
        "initLevel": 3,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_hide_fly_3_cond_1",
                        "progressToCompare": 10000000
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_hide_jump_hit": {
        "id": "achv_hide_jump_hit",
        "type": "achv_type_hide",
        "groupId": "achv_group_hide_default",
        "order": 5,
        "initLevel": 2,
        "upgradable": false,
        "plateable": false,
        "specialProgress": true,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_hide_jump_hit_2_cond_1",
                        "progressToCompare": 20
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_hide_no_parry": {
        "id": "achv_hide_no_parry",
        "type": "achv_type_hide",
        "groupId": "achv_group_hide_default",
        "order": 12,
        "initLevel": 3,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_hide_no_parry_3_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_hide_open_treasure": {
        "id": "achv_hide_open_treasure",
        "type": "achv_type_hide",
        "groupId": "achv_group_hide_default",
        "order": 10,
        "initLevel": 2,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_hide_open_treasure_2_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_hide_paralyze": {
        "id": "achv_hide_paralyze",
        "type": "achv_type_hide",
        "groupId": "achv_group_hide_default",
        "order": 9,
        "initLevel": 2,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_hide_paralyze_2_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_hide_rebellious": {
        "id": "achv_hide_rebellious",
        "type": "achv_type_hide",
        "groupId": "achv_group_hide_default",
        "order": 4,
        "initLevel": 2,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_hide_rebellious_2_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_hide_root": {
        "id": "achv_hide_root",
        "type": "achv_type_hide",
        "groupId": "achv_group_hide_default",
        "order": 8,
        "initLevel": 1,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "1": {
                "achieveLevel": 1,
                "conditions": [
                    {
                        "conditionId": "achv_hide_root_1_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_hide_ruanyi": {
        "id": "achv_hide_ruanyi",
        "type": "achv_type_hide",
        "groupId": "achv_group_hide_default",
        "order": 7,
        "initLevel": 2,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_hide_ruanyi_2_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_hide_slime": {
        "id": "achv_hide_slime",
        "type": "achv_type_hide",
        "groupId": "achv_group_hide_default",
        "order": 3,
        "initLevel": 2,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_hide_slime_2_cond_1",
                        "progressToCompare": 4
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_hide_waterwheel_top": {
        "id": "achv_hide_waterwheel_top",
        "type": "achv_type_hide",
        "groupId": "achv_group_hide_default",
        "order": 6,
        "initLevel": 2,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_hide_waterwheel_top_2_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_quest_aglina": {
        "id": "achv_quest_aglina",
        "type": "achv_type_quest",
        "groupId": "achv_group_quest_side",
        "order": 3,
        "initLevel": 2,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_quest_aglina_2_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_quest_camille": {
        "id": "achv_quest_camille",
        "type": "achv_type_quest",
        "groupId": "achv_group_quest_side",
        "order": 8,
        "initLevel": 2,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_quest_camille_2_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_quest_e0m2": {
        "id": "achv_quest_e0m2",
        "type": "achv_type_quest",
        "groupId": "achv_group_quest_main",
        "order": 1,
        "initLevel": 3,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_quest_e0m2_3_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_quest_e10m3": {
        "id": "achv_quest_e10m3",
        "type": "achv_type_quest",
        "groupId": "achv_group_quest_main",
        "order": 12,
        "initLevel": 3,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_quest_e10m3_3_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_quest_e11m1": {
        "id": "achv_quest_e11m1",
        "type": "achv_type_quest",
        "groupId": "achv_group_quest_main",
        "order": 13,
        "initLevel": 3,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_quest_e11m1_3_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_quest_e11m3": {
        "id": "achv_quest_e11m3",
        "type": "achv_type_quest",
        "groupId": "achv_group_quest_main",
        "order": 14,
        "initLevel": 3,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_quest_e11m3_3_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_quest_e11m4": {
        "id": "achv_quest_e11m4",
        "type": "achv_type_quest",
        "groupId": "achv_group_quest_main",
        "order": 15,
        "initLevel": 3,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_quest_e11m4_3_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_quest_e11m5": {
        "id": "achv_quest_e11m5",
        "type": "achv_type_quest",
        "groupId": "achv_group_quest_main",
        "order": 16,
        "initLevel": 3,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_quest_e11m5_3_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_quest_e11m7": {
        "id": "achv_quest_e11m7",
        "type": "achv_type_quest",
        "groupId": "achv_group_quest_main",
        "order": 17,
        "initLevel": 3,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_quest_e11m7_3_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_quest_e1m2": {
        "id": "achv_quest_e1m2",
        "type": "achv_type_quest",
        "groupId": "achv_group_quest_main",
        "order": 2,
        "initLevel": 3,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_quest_e1m2_3_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_quest_e1m8": {
        "id": "achv_quest_e1m8",
        "type": "achv_type_quest",
        "groupId": "achv_group_quest_main",
        "order": 3,
        "initLevel": 3,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_quest_e1m8_3_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_quest_e2m1": {
        "id": "achv_quest_e2m1",
        "type": "achv_type_quest",
        "groupId": "achv_group_quest_main",
        "order": 4,
        "initLevel": 3,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_quest_e2m1_3_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_quest_e2m8": {
        "id": "achv_quest_e2m8",
        "type": "achv_type_quest",
        "groupId": "achv_group_quest_main",
        "order": 5,
        "initLevel": 3,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_quest_e2m8_3_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_quest_e3m5": {
        "id": "achv_quest_e3m5",
        "type": "achv_type_quest",
        "groupId": "achv_group_quest_main",
        "order": 6,
        "initLevel": 3,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_quest_e3m5_3_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_quest_e4m1": {
        "id": "achv_quest_e4m1",
        "type": "achv_type_quest",
        "groupId": "achv_group_quest_main",
        "order": 7,
        "initLevel": 3,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_quest_e4m1_3_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_quest_e6m1": {
        "id": "achv_quest_e6m1",
        "type": "achv_type_quest",
        "groupId": "achv_group_quest_main",
        "order": 8,
        "initLevel": 3,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_quest_e6m1_3_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_quest_e7m4": {
        "id": "achv_quest_e7m4",
        "type": "achv_type_quest",
        "groupId": "achv_group_quest_main",
        "order": 9,
        "initLevel": 3,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_quest_e7m4_3_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_quest_e8m4": {
        "id": "achv_quest_e8m4",
        "type": "achv_type_quest",
        "groupId": "achv_group_quest_main",
        "order": 10,
        "initLevel": 3,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_quest_e8m4_3_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_quest_e9m3": {
        "id": "achv_quest_e9m3",
        "type": "achv_type_quest",
        "groupId": "achv_group_quest_main",
        "order": 11,
        "initLevel": 3,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_quest_e9m3_3_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_quest_gm02m22": {
        "id": "achv_quest_gm02m22",
        "type": "achv_type_quest",
        "groupId": "achv_group_quest_side",
        "order": 11,
        "initLevel": 1,
        "upgradable": false,
        "plateable": false,
        "specialProgress": true,
        "applyRareEffect": false,
        "levelInfos": {
            "1": {
                "achieveLevel": 1,
                "conditions": [
                    {
                        "conditionId": "achv_quest_gm02m22_1_cond_1",
                        "progressToCompare": 1
                    },
                    {
                        "conditionId": "achv_quest_gm02m22_1_cond_2",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_quest_gm02m27": {
        "id": "achv_quest_gm02m27",
        "type": "achv_type_quest",
        "groupId": "achv_group_quest_side",
        "order": 12,
        "initLevel": 2,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_quest_gm02m27_2_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_quest_laevat": {
        "id": "achv_quest_laevat",
        "type": "achv_type_quest",
        "groupId": "achv_group_quest_side",
        "order": 5,
        "initLevel": 2,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_quest_laevat_2_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_quest_liino": {
        "id": "achv_quest_liino",
        "type": "achv_type_quest",
        "groupId": "achv_group_quest_side",
        "order": 9,
        "initLevel": 2,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_quest_liino_2_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_quest_mifu": {
        "id": "achv_quest_mifu",
        "type": "achv_type_quest",
        "groupId": "achv_group_quest_side",
        "order": 7,
        "initLevel": 2,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_quest_mifu_2_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_quest_typhoea": {
        "id": "achv_quest_typhoea",
        "type": "achv_type_quest",
        "groupId": "achv_group_quest_side",
        "order": 10,
        "initLevel": 2,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_quest_typhoea_2_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_quest_wolfgd": {
        "id": "achv_quest_wolfgd",
        "type": "achv_type_quest",
        "groupId": "achv_group_quest_side",
        "order": 2,
        "initLevel": 2,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_quest_wolfgd_2_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_quest_wulfa": {
        "id": "achv_quest_wulfa",
        "type": "achv_type_quest",
        "groupId": "achv_group_quest_side",
        "order": 6,
        "initLevel": 2,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_quest_wulfa_2_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_quest_yvonne": {
        "id": "achv_quest_yvonne",
        "type": "achv_type_quest",
        "groupId": "achv_group_quest_side",
        "order": 4,
        "initLevel": 2,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_quest_yvonne_2_cond_1",
                        "progressToCompare": 1
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_side_mission_count": {
        "id": "achv_side_mission_count",
        "type": "achv_type_quest",
        "groupId": "achv_group_quest_side",
        "order": 1,
        "initLevel": 1,
        "upgradable": true,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "1": {
                "achieveLevel": 1,
                "conditions": [
                    {
                        "conditionId": "achv_side_mission_count_1_cond_1",
                        "progressToCompare": 30
                    }
                ]
            },
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_side_mission_count_2_cond_1",
                        "progressToCompare": 40
                    }
                ]
            },
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_side_mission_count_3_cond_1",
                        "progressToCompare": 50
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_social_building": {
        "id": "achv_social_building",
        "type": "achv_type_social",
        "groupId": "achv_group_social_default",
        "order": 1,
        "initLevel": 1,
        "upgradable": true,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "1": {
                "achieveLevel": 1,
                "conditions": [
                    {
                        "conditionId": "achv_social_building_1_cond_1",
                        "progressToCompare": 50
                    }
                ]
            },
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_social_building_2_cond_1",
                        "progressToCompare": 200
                    }
                ]
            },
            "3": {
                "achieveLevel": 3,
                "conditions": [
                    {
                        "conditionId": "achv_social_building_3_cond_1",
                        "progressToCompare": 500
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_social_spaceship_be_helped": {
        "id": "achv_social_spaceship_be_helped",
        "type": "achv_type_social",
        "groupId": "achv_group_social_default",
        "order": 2,
        "initLevel": 2,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "2": {
                "achieveLevel": 2,
                "conditions": [
                    {
                        "conditionId": "achv_social_spaceship_be_helped_2_cond_1",
                        "progressToCompare": 100
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_social_spaceship_help": {
        "id": "achv_social_spaceship_help",
        "type": "achv_type_social",
        "groupId": "achv_group_social_default",
        "order": 1,
        "initLevel": 1,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "1": {
                "achieveLevel": 1,
                "conditions": [
                    {
                        "conditionId": "achv_social_spaceship_help_1_cond_1",
                        "progressToCompare": 50
                    }
                ]
            }
        },
        "plateConditions": []
    },
    "achv_social_spaceship_info_exchange": {
        "id": "achv_social_spaceship_info_exchange",
        "type": "achv_type_social",
        "groupId": "achv_group_social_default",
        "order": 3,
        "initLevel": 1,
        "upgradable": false,
        "plateable": false,
        "specialProgress": false,
        "applyRareEffect": false,
        "levelInfos": {
            "1": {
                "achieveLevel": 1,
                "conditions": [
                    {
                        "conditionId": "achv_social_spaceship_info_exchange_1_cond_1",
                        "progressToCompare": 50
                    }
                ]
            }
        },
        "plateConditions": []
    }
};
