const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const detail = await prisma.userAccountDetails.findFirst();
    if (!detail) return;
    const info = JSON.parse(detail.account_info);
    if (!info.detail || !info.detail.chars || info.detail.chars.length === 0) return;
    const char = info.detail.chars[0];
    console.log("bodyEquip.equipData keys:", Object.keys(char.bodyEquip.equipData));
    console.log("bodyEquip.equipData fields:", JSON.stringify(char.bodyEquip.equipData, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
