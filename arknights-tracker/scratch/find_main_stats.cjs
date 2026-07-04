const { equipment } = require('c:/Users/makiv/Desktop/ArknightProject/arknights-tracker/src/lib/data/items/equipment.js');

const types = {};
for (const [id, eq] of Object.entries(equipment)) {
    const type = eq.partType;
    if (types[type] === undefined) {
        types[type] = eq.displayAttr.map(a => a.attrType);
        console.log(`partType ${type} example (${id}):`, types[type]);
    }
}
