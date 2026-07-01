const fs = require('fs');
const data = JSON.parse(fs.readFileSync('c:/Users/makiv/Desktop/ArknightProject/accountData.json', 'utf8'));
const chars = data.data.detail.chars;
let count = 0;
for (const char of chars) {
    if (char.weapon) {
        console.log(`Char: ${char.charData?.name || char.id}`);
        console.log(`Weapon keys:`, Object.keys(char.weapon));
        if (char.weapon.weaponTerms) {
            console.log(`FOUND weaponTerms:`, char.weapon.weaponTerms);
        }
        if (char.weapon.weaponData) {
            console.log(`WeaponData keys:`, Object.keys(char.weapon.weaponData));
        }
        count++;
        if (count > 5) break;
    }
}
