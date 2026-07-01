const fs = require('fs');
const data = JSON.parse(fs.readFileSync('c:/Users/makiv/Desktop/ArknightProject/accountData.json', 'utf8'));

if (data.data && data.data.detail) {
    const chars = data.data.detail.chars;
    if (chars && chars.length > 0) {
        console.log("data.detail.chars[0] keys:", Object.keys(chars[0]));
        if (chars[0].charData) {
            console.log("data.detail.chars[0].charData keys:", Object.keys(chars[0].charData));
        }
    }
}
