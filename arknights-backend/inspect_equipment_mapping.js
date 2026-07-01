const { equipment } = require('../arknights-tracker/src/lib/data/items/equipment.js');
console.log("Total keys in equipment:", Object.keys(equipment).length);
console.log("Is 5bbe157c88162db461fa97a606148d4f in equipment keys?", '5bbe157c88162db461fa97a606148d4f' in equipment);
const matches = Object.keys(equipment).filter(k => k.includes('5bbe157c88162db461fa97a606148d4f') || k.includes('Tidal') || k.includes('tidal'));
console.log("Matches:", matches);
const values = Object.values(equipment);
console.log("Sample equipment item:", JSON.stringify(values[0], null, 2));
