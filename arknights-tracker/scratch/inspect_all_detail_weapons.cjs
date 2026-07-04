const fs = require('fs');
const data = JSON.parse(fs.readFileSync('c:/Users/makiv/Desktop/ArknightProject/accountData.json', 'utf8'));

const chars = data.data.detail.chars;
for (const char of chars) {
    if (char.weapon) {
        console.log(`Char: ${char.charData?.name || char.id}`);
        console.log(`Weapon ID: ${char.weapon.id}`);
        console.log(`Level: ${char.weapon.level}`);
        console.log(`RefineLevel: ${char.weapon.refineLevel}`);
        console.log(`Skills:`, JSON.stringify(char.weapon.weaponData?.skills, null, 2));
        console.log(`Gem:`, JSON.stringify(char.weapon.gem, null, 2));
        console.log("==============================");
    }
}
