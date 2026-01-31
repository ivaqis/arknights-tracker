// banners.js

// Точная копия твоего конфига с фронта
const rawBanners = [
  {
    id: "standard_01",
    name: "Basic Headhunting",
    type: "standard",
    startTime: "2026-01-22 03:00:00",
    endTime: null,
    featured6: ["ardelia", "pogranichnik", "lastRite", "ember", "lifeng"],
  },
  {
    id: "new_player_01",
    name: "New Horizons Headhunting",
    type: "new-player",
    startTime: "2026-01-22 03:00:00",
    endTime: null,
    featured6: ["ardelia", "pogranichnik", "lastRite", "ember", "lifeng"],
  },
  {
    id: "special_banner_01", 
    name: "Scars Of The Forge",
    type: "special",
    startTime: "2026-01-22 03:00:00",
    endTime: "2026-02-07 11:59:59",
    featured6: ["laevatain"], 
  },
  {
    id: "special_banner_02",
    name: "The Floaty Messenger",
    type: "special",
    startTime: "2026-02-07 12:00:00",
    endTime: "2026-02-24 11:59:59",
    featured6: ["gilberta"],
  },
  {
    id: "special_banner_03",
    name: "Hues Of Passion",
    type: "special",
    startTime: "2026-02-24 12:00:00",
    endTime: "2026-03-16 11:59:59",
    featured6: ["yvonne"],
  },
  {
    id: "weponbox_1_0_1",
    name: "Smelting Forge Issue",
    type: "weapon",
    startTime: "2026-01-22 03:00:00",
    endTime: "2026-03-16 11:59:59",
    featured6: ["forgebornScathe"],
  },
  {
    id: "weaponbox_constant_1",
    name: "Solid Ice Issue",
    type: "weapon",
    startTime: "2026-01-22 03:00:00",
    endTime: null,
    featured6: ["khravengger"],
  },
  {
    id: "weaponbox_constant_2",
    name: "Cosmic Voice Issue",
    type: "weapon",
    startTime: "2026-01-22 03:00:00",
    endTime: null,
    featured6: ["dreamsOfTheStarryBeach"],
  },
  {
    id: "weaponbox_constant_3",
    name: "Far Expedition Issue",
    type: "weapon",
    startTime: "2026-01-22 03:00:00",
    endTime: null,
    featured6: ["neverRest"],
  },
  {
    id: "weaponbox_constant_4",
    name: "Rising Mount Issue",
    type: "weapon",
    startTime: "2026-01-22 03:00:00",
    endTime: null,
    featured6: ["mountainBearer"],
  },
  {
    id: "weaponbox_constant_5",
    name: "Thunderous Peal Issue",
    type: "weapon",
    startTime: "2026-01-22 03:00:00",
    endTime: null,
    featured6: ["thunderberge"],
  },
  {
    id: "weponbox_1_0_2",
    name: "Express Delivery Issue",
    type: "weapon",
    startTime: "2026-02-07 12:00:00",
    endTime: "2026-03-16 11:59:59",
    featured6: ["deliveryGuaranteed"],
  },
  {
    id: "weponbox_1_0_3",
    name: "Graffiti Issue",
    type: "weapon",
    startTime: "2026-02-24 12:00:00",
    endTime: "2026-03-16 11:59:59",
    featured6: ["artzyTyrannical"],
  }
];

// --- ПРЕВРАЩАЕМ ДАТЫ В ЧИСЛА ДЛЯ NODE.JS ---
const BANNERS = rawBanners.map(b => ({
    ...b,
    // Добавляем UTC, чтобы серверное время не сдвигало даты
    startTime: new Date(b.startTime.endsWith("Z") ? b.startTime : b.startTime + " UTC").getTime(),
    endTime: b.endTime ? new Date(b.endTime.endsWith("Z") ? b.endTime : b.endTime + " UTC").getTime() : null
}));

module.exports = { BANNERS };