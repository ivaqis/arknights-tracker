import fs from 'fs';
import path from 'path';

const localesDir = 'src/lib/locales';

const translations = {
  de: {
    systemNames: { blueprintLocation: 'Ausrüstungsvorlagen-Standort' },
    stats: {
      goToEssences: 'Zu den Essenzen',
      essenceLocations: 'Essenzen-Standorte',
      recommendedOperators: 'Empfohlene Operatoren'
    }
  },
  es: {
    systemNames: { blueprintLocation: 'Ubicación de plantilla de equipamiento' },
    stats: {
      goToEssences: 'Ir a Esencias',
      essenceLocations: 'Ubicaciones de esencias',
      recommendedOperators: 'Operadores recomendados'
    }
  },
  fr: {
    systemNames: { blueprintLocation: 'Emplacement du schéma d\'équipement' },
    stats: {
      goToEssences: 'Aller aux Essences',
      essenceLocations: 'Emplacements des essences',
      recommendedOperators: 'Opérateurs recommandés'
    }
  },
  id: {
    systemNames: { blueprintLocation: 'Lokasi Templat Perlengkapan' },
    stats: {
      goToEssences: 'Buka Esensi',
      essenceLocations: 'Lokasi Esensi',
      recommendedOperators: 'Operator yang Direkomendasikan'
    }
  },
  it: {
    systemNames: { blueprintLocation: 'Posizione modello equipaggiamento' },
    stats: {
      goToEssences: 'Vai alle Essenze',
      essenceLocations: 'Posizioni delle essenze',
      recommendedOperators: 'Operatori consigliati'
    }
  },
  ja: {
    systemNames: { blueprintLocation: '装備設計図の場所' },
    stats: {
      goToEssences: 'エッセンスへ移動',
      essenceLocations: 'エッセンスの場所',
      recommendedOperators: 'おすすめオペレーター'
    }
  },
  ko: {
    systemNames: { blueprintLocation: '장비 도안 위치' },
    stats: {
      goToEssences: '에센스로 이동',
      essenceLocations: '에센스 위치',
      recommendedOperators: '추천 오퍼레이터'
    }
  },
  pt: {
    systemNames: { blueprintLocation: 'Localização do modelo de equipamento' },
    stats: {
      goToEssences: 'Ir para Essências',
      essenceLocations: 'Localizações das essências',
      recommendedOperators: 'Operadores recomendados'
    }
  },
  th: {
    systemNames: { blueprintLocation: 'ตำแหน่งพิมพ์เขียวอุปกรณ์' },
    stats: {
      goToEssences: 'ไปยังเอสเซนส์',
      essenceLocations: 'ตำแหน่งเอสเซนส์',
      recommendedOperators: 'โอเปอเรเตอร์ที่แนะนำ'
    }
  },
  vi: {
    systemNames: { blueprintLocation: 'Vị trí bản thiết kế trang bị' },
    stats: {
      goToEssences: 'Đi đến Tinh hoa',
      essenceLocations: 'Vị trí Tinh hoa',
      recommendedOperators: 'Toán thủ đề xuất'
    }
  },
  zhcn: {
    systemNames: { blueprintLocation: '装备图纸位置' },
    stats: {
      goToEssences: '前往基质',
      essenceLocations: '基质位置',
      recommendedOperators: '推荐干员'
    }
  },
  zhtw: {
    systemNames: { blueprintLocation: '裝備圖紙位置' },
    stats: {
      goToEssences: '前往基質',
      essenceLocations: '基質位置',
      recommendedOperators: '推薦幹員'
    }
  }
};

for (const [lang, data] of Object.entries(translations)) {
  const filePath = path.join(localesDir, `${lang}.json`);
  if (!fs.existsSync(filePath)) continue;
  const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  json.systemNames = json.systemNames || {};
  json.systemNames.blueprintLocation = data.systemNames.blueprintLocation;

  json.stats = json.stats || {};
  json.stats.goToEssences = data.stats.goToEssences;
  json.stats.essenceLocations = data.stats.essenceLocations;
  json.stats.recommendedOperators = data.stats.recommendedOperators;

  fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n', 'utf8');
  console.log(`Updated ${lang}.json`);
}
