// src/lib/data/banners.js

// Обернуть переводом на все языки

// Featured используют characterId из characters.js

export const banners = [
  {
    id: "standard_01",
    name: "Basic Headhunting",
    type: "standard",
    startTime: "2026-01-22 03:00:00",
    endTime: null,
    gameVersion: "0.1.0",
    featured6: ["ardelia", "pogranichnik", "lastRite", "ember", "lifeng"],
    featured5: ["wulfgard", "snowshine", "fluorite"],
    isServerTime: false,
    timezone: "UTC+0",
    icon: "https://i.ibb.co/m5czHM8m/basic-headhunting.png",
    miniIcon: "https://i.ibb.co/V0j4hGty/basic-headhunting.png",
    url: "https://x.com/AKEndfield/status/2012150342780121133?s=20",
    layer: 3,
    color: "#CCCCCC",
    iconPosition: 50
  },
  {
    id: "new_player_01",
    name: "New Horizons Headhunting",
    type: "new-player",
    startTime: "2026-01-22 03:00:00",
    endTime: null,
    gameVersion: "0.1.0",
    featured6: ["ardelia", "pogranichnik", "lastRite", "ember", "lifeng"],
    featured5: ["wulfgard", "snowshine", "fluorite"],
    isServerTime: false,
    timezone: "UTC+0",
    icon: "https://i.ibb.co/VRwSyrj/new-horizons-headhunting.png",
    miniIcon: "https://i.ibb.co/5Xfw1MLT/new-horizons-headhunting.png",
    url: "https://x.com/AKEndfield/status/2012150342780121133?s=20",
    layer: 4,
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
    icon: "https://i.ibb.co/4RdDGD8S/laevatain-banner.png",
    miniIcon: "https://i.ibb.co/zVkLVk4P/laevatain-banner.png",
    url: "https://x.com/AKEndfield/status/2012151008873582825?s=20",
    layer: 2,
    color: "#FF6600",
    iconPosition: 20
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
    icon: "https://i.ibb.co/nskgx1NR/gilberta-banner.png",
    miniIcon: "https://i.ibb.co/kgSZ6THW/gilberta-banner.png",
    url: "https://x.com/AKEndfield/status/2012151008873582825?s=20",
    layer: 2,
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
    icon: "https://i.ibb.co/qTcLkhj/yvonne-banner.png",
    miniIcon: "https://i.ibb.co/VcWqJhtQ/yvonne-banner.png",
    url: "https://x.com/AKEndfield/status/2012151008873582825?s=20",
    layer: 2,
    color: "#FF33CC",
    iconPosition: 25
  }
];

