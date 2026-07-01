const fs = require('fs');
const data = JSON.parse(fs.readFileSync('c:/Users/makiv/Desktop/ArknightProject/accountData.json', 'utf8'));

if (data.data && data.data.detail && data.data.detail.crisisContract) {
    console.log("Found crisisContract:", JSON.stringify(data.data.detail.crisisContract, null, 2).substring(0, 1500));
}
