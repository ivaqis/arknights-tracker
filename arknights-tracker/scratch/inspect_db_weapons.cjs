const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const profiles = await prisma.userProfile.findMany();
    console.log(`Found ${profiles.length} profiles in DB.`);
    for (const p of profiles) {
        if (!p.details) continue;
        const details = JSON.parse(p.details);
        for (const account of details) {
            const info = account.account_info;
            if (!info) continue;
            
            // Search inside info
            function search(obj, path = '') {
                if (!obj || typeof obj !== 'object') return;
                if (Array.isArray(obj)) {
                    obj.forEach((item, index) => search(item, `${path}[${index}]`));
                } else {
                    for (const [key, value] of Object.entries(obj)) {
                        if (key === 'weaponTerms') {
                            console.log(`FOUND weaponTerms in profile ${p.name} at ${path}.${key} ->`, value);
                        } else {
                            search(value, path ? `${path}.${key}` : key);
                        }
                    }
                }
            }
            search(info);
        }
    }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
