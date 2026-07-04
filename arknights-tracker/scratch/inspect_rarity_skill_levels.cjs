const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/makiv/Desktop/ArknightProject/arknights-tracker/src/lib/data/weaponsData';
const files = fs.readdirSync(dir);
const map = {};

for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const content = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    const wpnId = file.replace('.json', '');
    map[wpnId] = content.skillLevels;
}

// Let's summarize the unique skillLevels structures
const unique = {};
for (const [wpn, sl] of Object.entries(map)) {
    const str = JSON.stringify(sl);
    if (!unique[str]) unique[str] = [];
    unique[str].push(wpn);
}

for (const [str, wpns] of Object.entries(unique)) {
    console.log(`Weapons (${wpns.length}): ${wpns.slice(0, 5).join(', ')}${wpns.length > 5 ? '...' : ''}`);
    console.log(JSON.parse(str));
    console.log("-----------------------------------------");
}
