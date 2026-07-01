const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const detail = await prisma.userAccountDetails.findFirst();
    if (!detail) return;
    const info = JSON.parse(detail.account_info);
    if (info.contract && info.contract.chars && info.contract.chars.length > 0) {
        for (const char of info.contract.chars) {
            if (char.weapon) {
                console.log(`Char ${char.id} weapon:`, char.weapon);
                break;
            }
        }
    }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
