const fs = require('fs');
const data = JSON.parse(fs.readFileSync('c:/Users/makiv/Desktop/ArknightProject/accountData.json', 'utf8'));

function search(obj, path = '') {
    if (!obj || typeof obj !== 'object') return;
    if (Array.isArray(obj)) {
        obj.forEach((item, index) => search(item, `${path}[${index}]`));
    } else {
        for (const [key, value] of Object.entries(obj)) {
            if (key === 'weaponTerms') {
                console.log(`Found weaponTerms at: data.${path}.${key} ->`, value);
            } else {
                search(value, path ? `${path}.${key}` : key);
            }
        }
    }
}

search(data.data);
