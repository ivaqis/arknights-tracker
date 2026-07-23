// src/lib/data/weaponRotations.js

/*
 * How to use:
 * 1. Add new 6* and 5* weapons to the "weeklyRotations" array
 * 2. Reuse "dailyTemplate" (A, B, C) if the daily pattern remains the same
 * 3. If the daily pattern changes, add a new template to "dailyTemplates"
 */

export const weaponRotations = {
  "dailyTemplates": {
    "A": {
      "thu": [
        "seekerOfDarkLung",
        "rationalFarewell"
      ],
      "fri": [
        "fortmaker",
        "opusTheLiving"
      ],
      "sat": [
        "ancientCanal",
        "twelveQuestions"
      ],
      "sun": [
        "objArtsIdentifier",
        "cohesiveTraction"
      ],
      "mon": [
        "wildWanderer",
        "finchaser30"
      ],
      "tue": [
        "chimericJustice",
        "twelveQuestions"
      ],
      "wed": [
        "stanzaOfMemorials",
        "objVelocitous"
      ]
    },
    "B": {
      "thu": [
        "sunderingSteel",
        "objHeavyBurden"
      ],
      "fri": [
        "objVelocitous",
        "finchaser30"
      ],
      "sat": [
        "stanzaOfMemorials",
        "finishingCall"
      ],
      "sun": [
        "fortmaker",
        "objRazorhorn"
      ],
      "mon": [
        "seekerOfDarkLung",
        "cohesiveTraction"
      ],
      "tue": [
        "freedomToProselytize",
        "monaihe"
      ],
      "wed": [
        "ancientCanal",
        "objArtsIdentifier"
      ]
    },
    "C": {
      "thu": [
        "monaihe",
        "aspirant"
      ],
      "fri": [
        "chimericJustice",
        "aspirant"
      ],
      "sat": [
        "rationalFarewell",
        "finishingCall"
      ],
      "sun": [
        "wildWanderer",
        "objEdgeOfLightness"
      ],
      "mon": [
        "objArtsIdentifier",
        "objHeavyBurden"
      ],
      "tue": [
        "opusTheLiving",
        "objRazorhorn"
      ],
      "wed": [
        "freedomToProselytize",
        "objEdgeOfLightness"
      ]
    }
  },
  "weeklyRotations": [
    {
      "week": 1,
      "startDate": "2026/01/22",
      "endDate": "2026/01/29",
      "weekly6": "grandVision",
      "weekly5": "wildWanderer",
      "dailyTemplate": "A"
    },
    {
      "week": 2,
      "startDate": "2026/01/29",
      "endDate": "2026/02/05",
      "weekly6": "oblivion",
      "weekly5": "objEdgeOfLightness",
      "dailyTemplate": "B"
    },
    {
      "week": 3,
      "startDate": "2026/02/05",
      "endDate": "2026/02/12",
      "weekly6": "valiant",
      "weekly5": "objVelocitous",
      "dailyTemplate": "C"
    },
    {
      "week": 4,
      "startDate": "2026/02/12",
      "endDate": "2026/02/19",
      "weekly6": "clannibal",
      "weekly5": "objArtsIdentifier",
      "dailyTemplate": "A"
    },
    {
      "week": 5,
      "startDate": "2026/02/19",
      "endDate": "2026/02/26",
      "weekly6": "detonationUnit",
      "weekly5": "twelveQuestions",
      "dailyTemplate": "B"
    },
    {
      "week": 6,
      "startDate": "2026/02/26",
      "endDate": "2026/03/05",
      "weekly6": "formerFinery",
      "weekly5": "finchaser30",
      "dailyTemplate": "C"
    },
    {
      "week": 7,
      "startDate": "2026/03/05",
      "endDate": "2026/03/12",
      "weekly6": "eminentRepute",
      "weekly5": "objRazorhorn",
      "dailyTemplate": "A"
    },
    {
      "week": 8,
      "startDate": "2026/03/12",
      "endDate": "2026/03/19",
      "weekly6": "oblivion",
      "weekly5": "opusTheLiving",
      "dailyTemplate": "B"
    },
    {
      "week": 9,
      "startDate": "2026/03/19",
      "endDate": "2026/03/26",
      "weekly6": "rapidAscent",
      "weekly5": "freedomToProselytize",
      "dailyTemplate": "C"
    },
    {
      "week": 10,
      "startDate": "2026/03/26",
      "endDate": "2026/04/02",
      "weekly6": "clannibal",
      "weekly5": "stanzaOfMemorials",
      "dailyTemplate": "A"
    },
    {
      "week": 11,
      "startDate": "2026/04/02",
      "endDate": "2026/04/09",
      "weekly6": "valiant",
      "weekly5": "sunderingSteel",
      "dailyTemplate": "B"
    },
    {
      "week": 12,
      "startDate": "2026/04/09",
      "endDate": "2026/04/16",
      "weekly6": "exemplar",
      "weekly5": "chimericJustice",
      "dailyTemplate": "C"
    },
    {
      "week": 13,
      "startDate": "2026/04/16",
      "endDate": "2026/04/23",
      "weekly6": "sunderedPrince",
      "weekly5": "wildWanderer",
      "dailyTemplate": "A"
    },
    {
      "week": 14,
      "startDate": "2026/04/23",
      "endDate": "2026/04/30",
      "weekly6": "oblivion",
      "weekly5": "seekerOfDarkLung",
      "dailyTemplate": "B"
    },
    {
      "week": 15,
      "startDate": "2026/04/30",
      "endDate": "2026/05/07",
      "weekly6": "jet",
      "weekly5": "monaihe",
      "dailyTemplate": "C"
    },
    {
      "week": 16,
      "startDate": "2026/05/07",
      "endDate": "2026/05/14",
      "weekly6": "clannibal",
      "weekly5": "twelveQuestions",
      "dailyTemplate": "A"
    },
    {
      "week": 17,
      "startDate": "2026/05/14",
      "endDate": "2026/05/21",
      "weekly6": "chivalricVirtues",
      "weekly5": "rationalFarewell",
      "dailyTemplate": "B"
    },
    {
      "week": 18,
      "startDate": "2026/05/21",
      "endDate": "2026/05/28",
      "weekly6": "valiant",
      "weekly5": "fortmaker",
      "dailyTemplate": "C"
    },
    {
      "week": 19,
      "startDate": "2026/05/28",
      "endDate": "2026/06/04",
      "weekly6": "whiteNightNova",
      "weekly5": "cohesiveTraction",
      "dailyTemplate": "A"
    },
    {
      "week": 20,
      "startDate": "2026/06/04",
      "endDate": "2026/06/11",
      "weekly6": "detonationUnit",
      "weekly5": "finishingCall",
      "dailyTemplate": "B"
    },
    {
      "week": 21,
      "startDate": "2026/06/11",
      "endDate": "2026/06/18",
      "weekly6": "wedge",
      "weekly5": "objEdgeOfLightness",
      "dailyTemplate": "C"
    },
    {
      "week": 22,
      "startDate": "2026/06/18",
      "endDate": "2026/06/25",
      "weekly6": "jet",
      "weekly5": "objHeavyBurden",
      "dailyTemplate": "A"
    },
    {
      "week": 23,
      "startDate": "2026/06/25",
      "endDate": "2026/07/02",
      "weekly6": "eminentRepute",
      "weekly5": "objRazorhorn",
      "dailyTemplate": "B"
    },
    {
      "week": 24,
      "startDate": "2026/07/02",
      "endDate": "2026/07/09",
      "weekly6": "formerFinery",
      "weekly5": "freedomToProselytize",
      "dailyTemplate": "C"
    },
    {
      "week": 25,
      "startDate": "2026/07/09",
      "endDate": "2026/07/16",
      "weekly6": "oblivion",
      "weekly5": "chimericJustice",
      "dailyTemplate": "A"
    },
    {
      "week": 26,
      "startDate": "2026/07/16",
      "endDate": "2026/07/23",
      "weekly6": "detonationUnit",
      "weekly5": "sunderingSteel",
      "dailyTemplate": "B"
    },
    {
      "week": 27,
      "startDate": "2026/07/23",
      "endDate": "2026/07/30",
      "weekly6": "jet",
      "weekly5": "opusTheLiving",
      "dailyTemplate": "C"
    },
    {
      "week": 28,
      "startDate": "2026/07/30",
      "endDate": "2026/08/06",
      "weekly6": "sunderedPrince",
      "weekly5": "wildWanderer",
      "dailyTemplate": "A"
    },
    {
      "week": 29,
      "startDate": "2026/08/06",
      "endDate": "2026/08/13",
      "weekly6": "thermiteCutter",
      "weekly5": "ancientCanal",
      "dailyTemplate": "B"
    },
    {
      "week": 30,
      "startDate": "2026/08/13",
      "endDate": "2026/08/20",
      "weekly6": "valiant",
      "weekly5": "monaihe",
      "dailyTemplate": "C"
    },
    {
      "week": 31,
      "startDate": "2026/08/20",
      "endDate": "2026/08/27",
      "weekly6": "clannibal",
      "weekly5": "cohesiveTraction",
      "dailyTemplate": "A"
    },
    {
      "week": 32,
      "startDate": "2026/08/27",
      "endDate": "2026/09/03",
      "weekly6": "rapidAscent",
      "weekly5": "objRazorhorn",
      "dailyTemplate": "B"
    }
  ]
};