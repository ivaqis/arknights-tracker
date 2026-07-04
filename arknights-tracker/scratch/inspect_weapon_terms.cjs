const fs = require('fs');
const data = JSON.parse(fs.readFileSync('c:/Users/makiv/Desktop/ArknightProject/accountData.json', 'utf8'));

const chars = data.data.detail.chars;
for (const char of chars) {
    if (char.weapon && char.weapon.weaponTerms) {
        console.log(`Char: ${char.id || char.charData?.name} has weaponTerms:`, char.weapon.weaponTerms);
    }
}
