const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../src/lib/locales');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json') && !f.endsWith('.bak'));

const ruTranslations = {
  dragMode: "Включить режим изменения расположения карточек баннеров",
  resetLayout: "Сбросить расположение",
  historySettings: "Настройки истории",
  maxCols: "Максимум колонок",
  bannerTypeExclusions: "Исключение типов баннеров",
  bannerExclusions: "Исключение баннеров",
  noneSelected: "Не выбрано",
  noWeaponBanners: "Нет доступных оружейных баннеров",
  showMonthlyChart: "Отображать график \"Круток в месяц\"",
  showRating: "Отображать \"Ваш рейтинг\"",
  showTotalCost: "Отображать \"Стоимость всех наймов\""
};

const enTranslations = {
  dragMode: "Enable card rearrangement mode",
  resetLayout: "Reset layout",
  historySettings: "History Settings",
  maxCols: "Max columns",
  bannerTypeExclusions: "Banner type exclusions",
  bannerExclusions: "Banner exclusions",
  noneSelected: "None selected",
  noWeaponBanners: "No weapon banners available",
  showMonthlyChart: "Show pulls per month chart",
  showRating: "Show your rating",
  showTotalCost: "Show total headhunting cost"
};

files.forEach(file => {
  const filePath = path.join(localesDir, file);
  try {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (content.page && content.page.recordsSettings) {
      const isRu = file === 'ru.json';
      const trans = isRu ? ruTranslations : enTranslations;
      
      Object.entries(trans).forEach(([key, val]) => {
        content.page.recordsSettings[key] = val;
      });
      
      // Write back with 2 spaces formatting and preserve trailing newline
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n', 'utf8');
      console.log(`Updated ${file}`);
    } else {
      console.log(`Skipped ${file} - no recordsSettings structure`);
    }
  } catch (err) {
    console.error(`Error processing ${file}:`, err);
  }
});
