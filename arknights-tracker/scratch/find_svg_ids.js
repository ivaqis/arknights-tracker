const fs = require('fs');
const svg = fs.readFileSync('c:/Users/makiv/Desktop/ArknightProject/arknights-tracker/static/images/icons.svg', 'utf8');

// Find all id="..." attributes
const matches = [];
const regex = /id="([^"]+)"/g;
let match;
while ((match = regex.exec(svg)) !== null) {
    matches.push(match[1]);
}

console.log("Total IDs:", matches.length);
console.log("Matching sp/gain/ult/scalar/usp:", matches.filter(id => {
    const lid = id.toLowerCase();
    return lid.includes("sp") || lid.includes("gain") || lid.includes("ult") || lid.includes("scalar") || lid.includes("usp") || lid.includes("attr");
}));
