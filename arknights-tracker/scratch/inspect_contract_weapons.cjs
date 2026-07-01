const fs = require('fs');
const data = JSON.parse(fs.readFileSync('c:/Users/makiv/Desktop/ArknightProject/accountData.json', 'utf8'));

if (data.data && data.data.detail && data.data.detail.crisisContract) {
    // Let's find contract chars
    const chars = data.data.detail.chars;
    for (const char of chars) {
        if (char.weapon) {
            console.log(`char: ${char.id || char.charData?.name}`);
            console.log(`weapon keys:`, Object.keys(char.weapon));
            if (char.weapon.weaponData) {
                console.log(`weaponData keys:`, Object.keys(char.weapon.weaponData));
            }
        }
    }
}
