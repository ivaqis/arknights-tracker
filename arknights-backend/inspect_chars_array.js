const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const profiles = await prisma.userAccount.findMany({
        include: { details: true }
    });
    for (const p of profiles) {
        if (!p.details || p.details.length === 0) continue;
        for (const detail of p.details) {
            const info = JSON.parse(detail.account_info);
            if (info && info.chars && info.chars.length > 0) {
                console.log("info.chars[0]:", JSON.stringify(info.chars[0], null, 2));
            }
            break;
        }
        break;
    }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
