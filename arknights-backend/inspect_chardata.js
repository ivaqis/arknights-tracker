const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const detail = await prisma.userAccountDetails.findFirst();
    if (!detail) return;
    const info = JSON.parse(detail.account_info);
    if (info.chars && info.chars.length > 0) {
        const char = info.chars[0];
        console.log("charData keys:", Object.keys(char.charData || {}));
        if (char.charData.skills) {
            console.log("charData.skills:", char.charData.skills.map(s => ({ id: s.id, name: s.name, level: s.level })));
        }
        if (char.charData.weapon) {
            console.log("charData.weapon:", char.charData.weapon);
        }
        if (char.charData.equips) {
            console.log("charData.equips:", char.charData.equips);
        }
    }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
