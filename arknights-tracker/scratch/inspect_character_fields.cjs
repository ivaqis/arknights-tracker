const fs = require('fs');
const data = JSON.parse(fs.readFileSync('c:/Users/makiv/Desktop/ArknightProject/accountData.json', 'utf8'));
const { characters } = require('../src/lib/data/characters.js');

const charactersById = Object.values(characters || {}).reduce((acc, char) => {
    if (char && char.id) acc[char.id] = char;
    return acc;
}, {});

const charactersByApiId = Object.values(characters || {}).reduce((acc, char) => {
    if (char && char.apiId) acc[char.apiId] = char;
    return acc;
}, {});

function getSvelteCharId(char) {
    if (!char) return "";
    const charId = char.charData?.id || char.id || char.charId || "";
    if (charId && charactersByApiId[charId]) {
        return charactersByApiId[charId].id;
    }
    const rawName = char.charData?.name || char.name || "";
    const nameLower = rawName.toLowerCase().trim();
    const ruMapping = {
        "эндминистратор": "endministrator1",
        "перлика": "perlica",
        "арделия": "ardelia"
    };
    if (ruMapping[nameLower]) return ruMapping[nameLower];
    return charId;
}

function getOperatorData(char) {
    const svelteId = getSvelteCharId(char);
    const staticData = charactersById[svelteId];
    if (staticData) return staticData;
    return { id: svelteId, element: null };
}

const chars = data.data.detail.chars;
for (const char of chars) {
    const svelteId = getSvelteCharId(char);
    const opData = getOperatorData(char);
    const targetCharData = char.charData;
    const propKey = targetCharData?.property?.key;
    const replacedPropKey = propKey ? propKey.replace("char_property_", "") : null;
    console.log(`Char: ${targetCharData?.name} (${svelteId}) -> propKey: ${propKey} -> replaced: ${replacedPropKey} -> opData.element: ${opData?.element}`);
}
