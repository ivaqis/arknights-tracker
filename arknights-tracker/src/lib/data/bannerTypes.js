// src/lib/data/bannerTypes.js

export const bannerTypes = [
    {
        id: "standard",
        gameType: "standard",
        name: "Стандартный наем",
        i18nKey: 'bannerTypes.standard',
        order: 2,
        showOnHome: true,
        showInRating: true,
        color: "blue"
    },
    {
        id: "special",
        gameType: "special",
        name: "Специальный наем",
        i18nKey: 'bannerTypes.special',
        order: 1,
        showOnHome: true,
        showInRating: true,
        color: "yellow"
    },
    {
        id: "new-player",
        gameType: "new-player",
        name: "Наем «Новые горизонты»",
        i18nKey: 'bannerTypes.new-player',
        order: 3,
        showOnHome: true,
        showInRating: true,
        color: "green"
    },
    {
        id: "weap-special",
        gameType: "weapon",
        i18nKey: "bannerTypes.weapSpecial",
        order: 4,
        showOnHome: true,
        showInRating: true
    },
    {
        id: "weap-standard",
        gameType: "weapon",
        i18nKey: "bannerTypes.weapStandard",
        order: 5,
        showOnHome: true,
        showInRating: true
    },
    {
        id: "joint",
        gameType: "joint",
        i18nKey: "bannerTypes.joint",
        name: "Joint Operation",
        order: 6,
        showOnHome: true,
        showInRating: true
    }
];