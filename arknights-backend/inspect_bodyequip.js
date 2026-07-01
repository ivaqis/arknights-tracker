const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const detail = await prisma.userAccountDetails.findFirst();
    if (!detail) return;
    const info = JSON.parse(detail.account_info);
    if (info.detail && info.detail.chars && info.detail.chars.length > 0) {
        const char = info.detail.chars[0];
        console.log("bodyEquip keys:", Object.keys(char.bodyEquip || {}));
        if (char.bodyEquip) {
            console.log("bodyEquip content:", JSON.stringify(char.bodyEquip, null, 2));
        }
    }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
