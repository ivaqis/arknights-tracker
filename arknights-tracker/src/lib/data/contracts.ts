export interface ContingencyContractStage {
    id: string;
    activityId?: string;
    name: string;
    picPath: string;
    startTime?: string;
    endTime?: string;
    startTimeAsia?: string;
    endTimeAsia?: string;
    enemyIds: string[];
    enemyLevels: number[];
}

export const contingencyContracts: ContingencyContractStage[] = [
    {
        "id": "indie_contract002",
        "activityId": "activity_contingency_contract_1",
        "name": "Contingency Contract #2",
        "picPath": "dung_ss_01",
        "startTime": "2026-11-05 12:00:00",
        "startTimeAsia": "2026-11-05 12:00:00",
        "endTime": "2026-12-03 04:00:00",
        "endTimeAsia": "2026-12-03 04:00:00",
        "enemyIds": [],
        "enemyLevels": []
    },
    {
        "id": "indie_contract001",
        "activityId": "activity_contingency_contract_0",
        "name": "Re-Ignition Experimental Operation",
        "picPath": "dung_ss_01",
        "startTime": "2026-06-19 12:00:00",
        "startTimeAsia": "2026-06-19 12:00:00",
        "endTime": "2026-07-23 04:00:00",
        "endTimeAsia": "2026-07-23 04:00:00",
        "enemyIds": [
            "eny_0025_agrange",
            "eny_0076_agfly",
            "eny_0087_wgslime",
            "eny_0088_wgthorns",
            "eny_0089_wgreflec",
            "eny_0091_wgshoal",
            "eny_0023_aghornb",
            "eny_0027_agscorp",
            "eny_0058_agdisk",
            "eny_0069_aghornb2",
            "eny_0070_agscorp2",
            "eny_0090_wgabyss"
        ],
        "enemyLevels": [
            60,
            60,
            60,
            60,
            60,
            60,
            60,
            60,
            60,
            60,
            60,
            60,
            60
        ]
    }
];
