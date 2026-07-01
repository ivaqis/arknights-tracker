const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const detail = await prisma.userAccountDetails.findFirst();
    if (!detail) return;
    const info = JSON.parse(detail.account_info);
    if (info.chars && info.chars.length > 0) {
        const char = info.chars[0];
        console.log("Character fields:", Object.keys(char));
        console.log("level:", char.level);
        console.log("potential:", char.potential);
        console.log("skills keys:", char.skills ? char.skills.map(s => ({ id: s.id, name: s.name, level: s.level })) : "No skills field");
        console.log("combatTalents:", char.combatTalents ? char.combatTalents.map(t => ({ id: t.id, name: t.name })) : "No combatTalents");
        console.log("cultivationTalents:", char.cultivationTalents ? char.cultivationTalents.map(t => ({ id: t.id, name: t.name })) : "No cultivationTalents");
        console.log("weapon:", char.weapon);
        console.log("equips keys:", Object.keys(char.equips || {}));
        if (char.equips) {
            console.log("first equip keys:", Object.keys(Object.values(char.equips)[0] || {}));
            console.log("first equip value:", Object.values(char.equips)[0]);
        }
    }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
