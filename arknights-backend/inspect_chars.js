const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const detail = await prisma.userAccountDetails.findFirst();
    if (!detail) {
        console.log("No synced accounts found in userAccountDetails");
        return;
    }
    console.log("Found synced account:", detail.game_uid);
    const info = JSON.parse(detail.account_info);
    console.log("Top-level keys in account_info:", Object.keys(info));
    console.log("Top-level keys in info.base:", Object.keys(info.base || {}));
    if (info.chars && info.chars.length > 0) {
        console.log("First character object:", JSON.stringify(info.chars[0], null, 2));
    } else {
        console.log("No chars found in account_info");
    }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
