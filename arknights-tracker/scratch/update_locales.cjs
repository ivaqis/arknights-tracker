const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../src/lib/locales');
const translations = {
  ru: "Все баннеры",
  en: "All Banners",
  zhcn: "所有卡池",
  zhtw: "所有卡池",
  ja: "すべてのガチャ",
  ko: "모든 배너",
  pt: "Todos os Banners",
  es: "Todos los Banners",
  fr: "Tous les Banners",
  de: "Alle Banner",
  it: "Tutti i Banner",
  id: "Semua Banner",
  th: "แบนเนอร์ทั้งหมด",
  vi: "Tất cả Banner"
};

Object.entries(translations).forEach(([locale, text]) => {
  const filePath = path.join(localesDir, `${locale}.json`);
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);
      
      if (data.banners && data.banners.allBanners !== undefined) {
        delete data.banners.allBanners;
      }
      
      if (data.systemNames) {
        data.systemNames.allBanners = text;
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`Updated ${locale}.json`);
      } else {
        console.log(`No systemNames key in ${locale}.json`);
      }
    } catch (e) {
      console.error(`Error reading/parsing ${locale}.json:`, e);
    }
  } else {
    console.log(`File ${locale}.json not found`);
  }
});
