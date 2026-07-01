const fs = require('fs');
const data = JSON.parse(fs.readFileSync('c:/Users/makiv/Desktop/ArknightProject/accountData.json', 'utf8'));
const chars = data.data.detail.chars;
for (const char of chars) {
    if (char.weapon) {
        console.log(`Char: ${char.charData?.name || char.id}`);
        console.log(`Weapon:`, JSON.stringify(char.weapon, null, 2));
        break;
    }
}
