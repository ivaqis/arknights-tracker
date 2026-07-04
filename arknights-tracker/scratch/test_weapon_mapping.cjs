const fs = require('fs');
const data = JSON.parse(fs.readFileSync('c:/Users/makiv/Desktop/ArknightProject/accountData.json', 'utf8'));
const { weapons } = require('../src/lib/data/weapons.js');

const weaponIdMap = {
    "wpn_sword_0012": "thermiteCutter",
    "wpn_greatsword_0010": "industry01",
    "wpn_greatsword_0006": "exemplar",
    "wpn_greatsword_0007": "formerFinery",
    "wpn_greatsword_0008": "thunderberge",
    "wpn_greatsword_0009": "sunderedPrince",
    "wpn_greatsword_0011": "quencher"
};

function getWeaponData(weapon) {
    if (!weapon) return null;
    
    // Extract gameId from skill keys if possible
    const skillKey = weapon.weaponData?.skills?.find(s => s.key?.startsWith("sk_wpn_"))?.key;
    const gameId = skillKey ? skillKey.replace("sk_", "") : (weapon.id || weapon.weaponData?.id);
    
    const mappedId = weaponIdMap[gameId];
    const staticData = (mappedId && weapons[mappedId]) || Object.values(weapons || {}).find(w => w.id === gameId || w.gameId === gameId);
    
    if (staticData) {
        return staticData;
    }
    return {
        id: gameId,
        name: weapon.weaponData?.name || weapon.name || gameId,
        rarity: Number(weapon.weaponData?.rarity?.value || weapon.rarity?.value || weapon.rarity || 4),
        type: weapon.weaponData?.type?.value || weapon.type || "sword"
    };
}

const chars = data.data.detail.chars;
for (const char of chars) {
    if (char.weapon) {
        const mapped = getWeaponData(char.weapon);
        console.log(`Char: ${char.id || char.charData?.name} -> Weapon Name: ${char.weapon.weaponData?.name} -> Mapped ID: ${mapped?.id}`);
    }
}
