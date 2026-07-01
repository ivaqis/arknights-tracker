const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const details = await prisma.userAccountDetails.findMany();
    for (const d of details) {
        const info = JSON.parse(d.account_info);
        if (info.detail && info.detail.chars) {
            for (const c of info.detail.chars) {
                if (c.bodyEquip && c.bodyEquip.equipData && (c.bodyEquip.equipData.level.value === '28' || c.bodyEquip.equipData.level.value === '50')) {
                    console.log('CHAR:', c.id);
                    console.log('bodyEquip:', JSON.stringify(c.bodyEquip, null, 2));
                    await prisma.$disconnect();
                    return;
                }
            }
        }
    }
    await prisma.$disconnect();
}
main();
