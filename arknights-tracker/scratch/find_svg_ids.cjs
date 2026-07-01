const fs = require('fs');
const svg = fs.readFileSync('c:/Users/makiv/Desktop/ArknightProject/arknights-tracker/static/images/icons.svg', 'utf8');

const matches = [];
const regex = /id="([^"]+)"/g;
let match;
while ((match = regex.exec(svg)) !== null) {
    matches.push(match[1]);
}

console.log(JSON.stringify(matches));
