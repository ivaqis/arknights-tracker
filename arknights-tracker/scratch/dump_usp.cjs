const fs = require('fs');
const svg = fs.readFileSync('c:/Users/makiv/Desktop/ArknightProject/arknights-tracker/static/images/icons.svg', 'utf8');

const regexInt = /<symbol[^>]*id="int"[\s\S]*?<\/symbol>/;
console.log("INT SYMBOL:", svg.match(regexInt)?.[0]);

const regexAtk = /<symbol[^>]*id="atk"[\s\S]*?<\/symbol>/;
console.log("ATK SYMBOL:", svg.match(regexAtk)?.[0]);
