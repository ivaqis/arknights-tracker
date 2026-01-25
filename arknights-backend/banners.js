// backend/banners.js

// Хелпер: Превращает строку в UTC Timestamp (миллисекунды)
// Мы заменяем пробел на 'T' и добавляем 'Z' в конец, чтобы сервер понял, что это UTC+0
const toTimestamp = (dateStr) => {
    if (!dateStr) return null;
    // Если формат "2026-01-22 03:00:00", делаем "2026-01-22T03:00:00Z"
    const isoStr = dateStr.replace(' ', 'T') + 'Z'; 
    return new Date(isoStr).getTime();
};

const RAW_BANNERS = [
  {
    id: "standard_01",
    name: "Basic Headhunting",
    type: "standard",
    startTime: "2026-01-22 03:00:00",
    endTime: null,
    gameVersion: "0.1.0",
    featured6: ["ardelia", "pogranichnik", "lastRite", "ember", "lifeng"],
    featured5: [],
    isServerTime: false,
    timezone: "UTC+0",
    // Changed: Use filename (utility handles .png default)
    icon: "basic-headhunting.png",
    miniIcon: "basic-headhunting.png",
    url: "https://x.com/AKEndfield/status/2012150342780121133?s=20",
    layer: null,
    color: "#CCCCCC",
    iconPosition: 50
  },
  {
    id: "new_player_01",
    name: "New Horizons Headhunting",
    type: "Beginner",
    startTime: "2026-01-22 03:00:00",
    endTime: null,
    gameVersion: "0.1.0",
    featured6: ["ardelia", "pogranichnik", "lastRite", "ember", "lifeng"],
    featured5: [],
    isServerTime: false,
    timezone: "UTC+0",
    icon: "new-horizons-headhunting.png",
    miniIcon: "new-horizons-headhunting.png",
    url: "https://x.com/AKEndfield/status/2012150342780121133?s=20",
    layer: null,
    color: "#00CC99",
    iconPosition: 50
  },
  {
    id: "special_banner_01", 
    name: "Scars Of The Forge",
    type: "special",
    startTime: "2026-01-22 03:00:00",
    endTime: "2026-02-07 11:59:59",
    gameVersion: "0.1.0",
    featured6: ["laevatain"], 
    featured5: [],
    isServerTime: true, 
    timezone: "UTC+0",
    icon: "laevatain-banner.jpg",
    miniIcon: "laevatain-banner.png",
    url: "https://x.com/AKEndfield/status/2012151008873582825?s=20",
    layer: 4,
    color: "#FF6600",
    iconPosition: 25
  },
  {
    id: "special_banner_02",
    name: "The Floaty Messenger",
    type: "special",
    startTime: "2026-02-07 12:00:00",
    endTime: "2026-02-24 11:59:59",
    gameVersion: "0.2.0",
    featured6: ["gilberta"],
    featured5: [],
    isServerTime: true, 
    timezone: "UTC+0",
    icon: "gilberta-banner.png",
    miniIcon: "gilberta-banner.png",
    url: "https://x.com/AKEndfield/status/2012151008873582825?s=20",
    layer: 4,
    color: "#c2cc3cff",
    iconPosition: 20
  },
  {
    id: "special_banner_03",
    name: "Hues Of Passion",
    type: "special",
    startTime: "2026-02-24 12:00:00",
    endTime: "2026-03-16 11:59:59",
    gameVersion: "0.2.0",
    featured6: ["yvonne"],
    featured5: [],
    isServerTime: true, 
    timezone: "UTC+0",
    icon: "yvonne-banner.png",
    miniIcon: "yvonne-banner.png",
    url: "https://x.com/AKEndfield/status/2012151008873582825?s=20",
    layer: 4,
    color: "#FF33CC",
    iconPosition: 25
  },
  {
    id: "weapon_banner_01",
    name: "Smelting Forge Issue",
    type: "weapon",
    startTime: "2026-01-22 03:00:00",
    endTime: "2026-03-16 11:59:59",
    gameVersion: "0.2.0",
    featured6: [],
    featured5: [],
    isServerTime: true, 
    timezone: "UTC+0",
    icon: "weapon_banner_01.jpg",
    miniIcon: "weapon_banner_01.jpg",
    url: "https://x.com/AKEndfield/status/2013838974239023147",
    layer: 5,
    color: "#e44e25",
    iconPosition: 50
  }
];

// Экспортируем уже обработанные данные с числами вместо строк
const BANNERS = RAW_BANNERS.map(b => ({
    id: b.id,
    type: b.type,
    startTime: toTimestamp(b.startTime),
    endTime: b.endTime ? toTimestamp(b.endTime) : 4102444800000, // Если null, ставим далекое будущее
}));

module.exports = { BANNERS };