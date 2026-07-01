const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const profiles = await prisma.userProfile.findMany();
    console.log(`Found ${profiles.length} profiles.`);
    for (const p of profiles) {
        if (!p.details) continue;
        const details = JSON.parse(p.details);
        for (const account of details) {
            const info = account.account_info;
            if (!info || !info.detail || !info.detail.chars) continue;
            for (const char of info.detail.chars) {
                if (char.weapon) {
                    console.log(`Char: ${char.charData?.name || char.id}`);
                    console.log(`Weapon:`, JSON.stringify(char.weapon, null, 2));
                }
            }
        }
    }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
