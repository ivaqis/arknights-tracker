const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const profiles = await prisma.userAccount.findMany({
        include: { details: true }
    });
    console.log(`Found ${profiles.length} profiles.`);
    for (const p of profiles) {
        if (!p.details || p.details.length === 0) continue;
        console.log(`User name: ${p.name}`);
        for (const detail of p.details) {
            const info = JSON.parse(detail.account_info);
            console.log(`Account game_uid: ${detail.game_uid}`);
            if (info && info.detail && info.detail.chars) {
                console.log(`First char in detail.chars:`, JSON.stringify(info.detail.chars[0], null, 2).substring(0, 1500));
            }
            break;
        }
        break;
    }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
