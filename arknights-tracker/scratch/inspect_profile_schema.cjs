const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const profiles = await prisma.userProfile.findMany();
    console.log(`Found ${profiles.length} profiles.`);
    for (const p of profiles) {
        if (!p.details) continue;
        const details = JSON.parse(p.details);
        if (details && details.length > 0) {
            const acc = details[0];
            console.log("Account keys:", Object.keys(acc));
            if (acc.info) {
                console.log("acc.info keys:", Object.keys(acc.info));
            }
            if (acc.account_info) {
                console.log("acc.account_info keys:", Object.keys(acc.account_info));
            }
        }
        break;
    }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
