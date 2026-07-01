const fs = require('fs');
const data = JSON.parse(fs.readFileSync('c:/Users/makiv/Desktop/ArknightProject/accountData.json', 'utf8'));

console.log("Root keys:", Object.keys(data));
if (data.data) {
    console.log("data keys:", Object.keys(data.data));
    if (data.data.detail) {
        console.log("data.detail keys:", Object.keys(data.data.detail));
        if (data.data.detail.base) {
            console.log("data.detail.base:", data.data.detail.base);
        }
    }
}
