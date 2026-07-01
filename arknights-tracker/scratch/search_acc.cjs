const fs = require('fs');
const data = JSON.parse(fs.readFileSync('c:/Users/makiv/Desktop/ArknightProject/accountData.json', 'utf8'));

const chars = data.data.detail.chars;
console.log("Total chars:", chars.length);
for (const c of chars) {
    const equipKeys = Object.keys(c).filter(k => k.includes('Equip') || k.includes('Accessory'));
    if (equipKeys.length > 0) {
        console.log(c.charData.name, 'has equip keys:', equipKeys);
    }
}
