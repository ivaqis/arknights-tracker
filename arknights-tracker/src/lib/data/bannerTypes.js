// src/lib/data/bannerTypes.js

// Обернуть переводом на все языки
// Разобраться с цветами

export const bannerTypes = [
  {
    id: "standard",
    apiType: "standard",
    name: "Стандартный наем",
    i18nKey: 'bannerTypes.standard',
    order: 2,
    showOnHome: true,
    showInRating: true,
    color: "blue"
  },
  {
    id: "special",
    apiType: "special",
    name: "Специальный наем",
    i18nKey: 'bannerTypes.special',
    order: 1,
    showOnHome: true,
    showInRating: true,
    color: "yellow"
  },
  {
    id: "new-player",
    apiType: "beginner",
    name: "Наем «Новые горизонты»",
    i18nKey: 'bannerTypes.new-player',
    order: 3,
    showOnHome: true,
    showInRating: true,
    color: "green"
  }
];