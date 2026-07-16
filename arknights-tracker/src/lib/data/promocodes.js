// src/lib/data/promocodes.js

export const promocodes = [
    {
        code: "RETURNOFALL",
        rewards: [
            { id: "oroberyl", count: 500 },
            { id: "tCreds", count: 6000 },
            { id: "elementaryCombatRecord", count: 30 },
            { id: "protodisk", count: 5 },
            { id: "protoprism", count: 5 },
            { id: "tCreds", count: 30 }
        ],
        startTime: "2024-01-22 00:00:00",
        condition: null,
        endTime: "2026-01-29 23:59:59",
        url: null,
    },
    {
        code: "ALLFIELD",
        rewards: [
            { id: "oroberyl", count: 1500 },
            { id: "tCreds", count: 6000 },
            { id: "elementaryCombatRecord", count: 30 },
            { id: "protodisk", count: 5 },
            { id: "markOfPerseverance", count: 1 },
            { id: "protoprism", count: 5 },
            { id: "tCreds", count: 30 }
        ],
        startTime: "2026-01-22 00:00:00",
        condition: null,
        endTime: "2026-01-29 23:59:59",
        url: null
    },
    {
        code: "ENDFIELDGIFT",
        rewards: [
            { id: "oroberyl", count: 150 },
            { id: "tCreds", count: 10000 },
            { id: "intermediateCombatRecord", count: 20 },
            { id: "armsInspKit", count: 20 }
        ],
        startTime: "2026-01-22 00:00:00",
        condition: null,
        endTime: null,
        url: null
    },
    {
        code: "ENDFIELD4PC",
        rewards: [
            { id: "tCreds", count: 13000 },
            { id: "advancedCombatRecord", count: 2 },
            { id: "armsInspKit", count: 2 }
        ],
        startTime: "2026-01-22 00:00:00",
        condition: "home.conditions.onlyPc",
        endTime: null,
        url: null
    },
    {
        code: "ZAU2SYXHWX5L4ZH",
        rewards: [
            { id: "tCreds", count: 5000 },
            { id: "armsInspKit", count: 10 }
        ],
        startTime: "2026-04-18 00:00:00",
        condition: null,
        endTime: "N/A",
        url: null
    },
    {
        code: "ENDFIELDRENEW",
        rewards: [
            { id: "tCreds", count: 71600 },
            { id: "stickerSafetyHelmet", count: 1 }
        ],
        startTime: "2026-07-10 00:00:00",
        condition: null,
        endTime: "2026-08-24 17:00:00",
        url: null
    }
];