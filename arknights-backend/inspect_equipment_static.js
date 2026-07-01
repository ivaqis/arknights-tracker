const fs = require('fs');
const equipmentPath = 'c:/Users/makiv/Desktop/ArknightProject/arknights-tracker/src/lib/data/items/equipment.js';

try {
    const file = fs.readFileSync(equipmentPath, 'utf8');
    // Find Light Armor Tidal Fall key 5bbe157c88162db461fa97a606148d4f
    const index = file.indexOf('5bbe157c88162db461fa97a606148d4f');
    if (index !== -1) {
        console.log(file.substring(index, index + 800));
    } else {
        console.log("Key not found in equipment.js");
        // Print first 500 characters of file
        console.log(file.substring(0, 500));
    }
} catch (e) {
    console.error(e);
}
