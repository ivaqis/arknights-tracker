const { equipment } = require('../arknights-tracker/src/lib/data/items/equipment.js');
const fs = require('fs');

const ruEquipment = JSON.parse(fs.readFileSync('../arknights-tracker/src/lib/locales/ru/equipment.json', 'utf8'));
const enEquipment = JSON.parse(fs.readFileSync('../arknights-tracker/src/lib/locales/en/equipment.json', 'utf8'));

// We want to find matches for "Легкая броня «Спад прилива»" or "Спад прилива"
const targetNameRu = "Легкая броня «Спад прилива»";
const targetSuitNameRu = "Натиск прилива";

console.log("Looking for name matches in Russian translation file...");
let matchedStaticIds = [];
for (const [staticId, trans] of Object.entries(ruEquipment)) {
    if (trans.name && trans.name.includes("Спад прилива")) {
        console.log(`Found name match in translation: Static ID: ${staticId} -> Name: ${trans.name}`);
        matchedStaticIds.push(staticId);
    }
}

for (const staticId of matchedStaticIds) {
    const staticData = equipment[staticId];
    console.log(`Static Data for ${staticId}:`, JSON.stringify(staticData, null, 2));
}
