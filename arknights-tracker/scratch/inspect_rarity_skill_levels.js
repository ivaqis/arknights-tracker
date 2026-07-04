const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/makiv/Desktop/ArknightProject/arknights-tracker/src/lib/data/weaponsData';
const files = fs.readdirSync(dir);
const map = {};

for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const content = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    const wpnId = file.replace('.json', '');
    // Let's find rarity from content or other source.
    // Wait, the content doesn't have rarity, but we can look it up or guess.
    // Let's print skillLevels of the weapon.
    map[wpnId] = content.skillLevels;
}

console.log(JSON.stringify(map, null, 2));
