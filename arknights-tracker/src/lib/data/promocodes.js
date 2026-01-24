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
        startTime: "2024-01-22T00:00:00Z",
        condition: null,
        endTime: "2026-01-29T23:59:59Z",
        timezone: "UTC+0",
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
        startTime: "2024-01-22T00:00:00Z",
        condition: null,
        endTime: "2026-01-29T23:59:59Z",
        timezone: "UTC+0",
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
        startTime: "2024-01-22T00:00:00Z",
        condition: null,
        endTime: "2026-03-16T11:59:59Z",
        timezone: "UTC+0",
        url: null
    },
    {
        code: "ENDFIELD4PC",
        rewards: [
            { id: "tCreds", count: 13000 },
            { id: "advancedCombatRecord", count: 2 },
            { id: "armsInspKit", count: 2 }
        ],
        startTime: "2024-01-22T00:00:00Z",
        condition: "home.conditions.onlyPc",
        endTime: "2026-03-16T11:59:59Z",
        timezone: "UTC+0",
        url: null
    }
];