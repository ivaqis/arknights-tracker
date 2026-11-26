import fs from "node:fs";
import assert from "node:assert/strict";

const ENEMY_SCALAR_KEYS = [
    "PhysicalDamageTakenScalar",
    "FireDamageTakenScalar",
    "PulseDamageTakenScalar",
    "CrystDamageTakenScalar",
    "NaturalDamageTakenScalar",
    "EtherDamageTakenScalar"
];

export async function verifyDataIntegrity(vite) {
    const { items } = await vite.ssrLoadModule("/src/lib/data/items/items.ts");
    const { itemObtainIcons } = await vite.ssrLoadModule("/src/lib/data/items/itemObtainIcons.ts");
    const { enemies, enemyVariantMap } = await vite.ssrLoadModule("/src/lib/data/enemies.js");
    const { tags } = await vite.ssrLoadModule("/src/lib/data/contractTags.js");
    const { banners } = await vite.ssrLoadModule("/src/lib/data/banners.js");
    const { characters } = await vite.ssrLoadModule("/src/lib/data/characters.js");
    const { weapons } = await vite.ssrLoadModule("/src/lib/data/weapons.js");
    const { weaponRotations } = await vite.ssrLoadModule("/src/lib/data/weaponRotations.js");
    const { changelogData } = await vite.ssrLoadModule("/src/lib/data/versions.js");
    const { chests } = await vite.ssrLoadModule("/src/lib/data/items/chests.ts");
    const { achievements } = await vite.ssrLoadModule("/src/lib/data/achievements.ts");
    const { rawEvents } = await vite.ssrLoadModule("/src/lib/data/timeline.ts");
    const { formatContractDescription } = await vite.ssrLoadModule("/src/lib/utils/richText.js");

    const enLocale = JSON.parse(fs.readFileSync("src/lib/locales/en.json", "utf8"));
    const ruLocale = JSON.parse(fs.readFileSync("src/lib/locales/ru.json", "utf8"));
    const enItems = JSON.parse(fs.readFileSync("src/lib/locales/en/items.json", "utf8"));
    const ruItems = JSON.parse(fs.readFileSync("src/lib/locales/ru/items.json", "utf8"));
    const enWeapons = JSON.parse(fs.readFileSync("src/lib/locales/en/weapons.json", "utf8"));
    const ruWeapons = JSON.parse(fs.readFileSync("src/lib/locales/ru/weapons.json", "utf8"));

    const tipFiles = new Set(
        fs.readdirSync("static/images/itemTips").map((f) => f.replace(/\.[^.]+$/, ""))
    );

    const missingObtainIcons = [];
    for (const itemId of Object.keys(items)) {
        const hasWays = Boolean(ruItems[itemId]?.obtainWays?.length || enItems[itemId]?.obtainWays?.length);
        if (!hasWays) continue;
        const icons = itemObtainIcons[itemId];
        if (!icons || !icons.some(Boolean)) {
            missingObtainIcons.push(itemId);
            continue;
        }
        for (const iconId of icons) {
            if (iconId) {
                assert.ok(tipFiles.has(iconId), `Missing itemTip image: ${iconId} for ${itemId}`);
            }
        }
    }
    assert.equal(missingObtainIcons.length, 0, `Items missing obtain icons: ${missingObtainIcons.join(", ")}`);

    const enemyList = Object.values(enemies);
    assert.ok(enemyList.length > 0, "enemies must not be empty");
    for (const enemy of enemyList) {
        assert.ok(enemy.id, "Enemy missing id");
        for (const key of ENEMY_SCALAR_KEYS) {
            assert.equal(typeof enemy[key], "number", `Enemy ${enemy.id} missing numeric ${key}`);
        }
    }

    const tagList = Object.values(tags);
    assert.ok(tagList.length > 0, "contractTags must not be empty");
    for (const tag of tagList) {
        assert.ok(Array.isArray(tag.blackboard), `Contract tag ${tag.tagId} blackboard must be array`);
        for (const entry of tag.blackboard) {
            assert.ok(entry.key, `Contract tag ${tag.tagId} has blackboard entry without key`);
            assert.equal(typeof entry.value, "number", `Contract tag ${tag.tagId}.${entry.key} must be number`);
            assert.ok(Number.isFinite(entry.value), `Contract tag ${tag.tagId}.${entry.key} must be finite`);
        }
    }

    for (const b of banners) {
        assert.ok(b.id && b.type && b.startTime, `Invalid banner entry: ${JSON.stringify(b)}`);
        const isWeapon = b.type.includes("weap") || b.id.includes("weap") || b.id.includes("wepon");
        const pool = isWeapon ? weapons : characters;
        for (const fid of [...(b.featured6 || []), ...(b.featured5 || [])]) {
            assert.ok(pool[fid], `Banner ${b.id} references unknown id: ${fid}`);
        }
    }

    for (const w of weaponRotations.weeklyRotations) {
        assert.ok(weapons[w.weekly6], `Week ${w.week} unknown weekly6: ${w.weekly6}`);
        assert.ok(weapons[w.weekly5], `Week ${w.week} unknown weekly5: ${w.weekly5}`);
        const tpl = weaponRotations.dailyTemplates[w.dailyTemplate];
        assert.ok(tpl, `Week ${w.week} unknown dailyTemplate: ${w.dailyTemplate}`);
        for (const dayList of Object.values(tpl)) {
            for (const wid of dayList) {
                assert.ok(weapons[wid], `Template ${w.dailyTemplate} unknown weapon: ${wid}`);
            }
        }
    }

    for (const ver of changelogData) {
        for (const cid of ver.characters || []) {
            assert.ok(characters[cid], `Version ${ver.version} unknown character: ${cid}`);
        }
        for (const wid of ver.weapons || []) {
            assert.ok(weapons[wid], `Version ${ver.version} unknown weapon: ${wid}`);
        }
        for (const iid of ver.items || []) {
            assert.ok(items[iid], `Version ${ver.version} unknown item: ${iid}`);
        }
        for (const aid of ver.achievements || []) {
            assert.ok(achievements[aid], `Version ${ver.version} unknown achievement: ${aid}`);
        }
        for (const eid of ver.enemies || []) {
            assert.ok(enemies[eid], `Version ${ver.version} unknown enemy: ${eid}`);
        }
    }

    for (const [varId, info] of Object.entries(enemyVariantMap || {})) {
        assert.ok(enemies[info.baseId], `Enemy variant ${varId} unknown baseId: ${info.baseId}`);
    }

    for (const chest of Object.values(chests)) {
        for (const group of chest.options || []) {
            for (const opt of group) {
                if (opt.type === "weapon") assert.ok(weapons[opt.id], `Chest ${chest.id} unknown weapon: ${opt.id}`);
                else if (opt.type === "character") assert.ok(characters[opt.id], `Chest ${chest.id} unknown char: ${opt.id}`);
                else assert.ok(items[opt.id], `Chest ${chest.id} unknown item: ${opt.id}`);
            }
        }
    }

    for (const ev of rawEvents) {
        assert.ok(ev.id && ev.startTime, `Timeline event missing id or startTime: ${JSON.stringify(ev)}`);
        assert.ok(!Number.isNaN(new Date(ev.startTime.replace(" ", "T")).getTime()), `Invalid startTime in ${ev.id}`);
        if (ev.endTime) {
            assert.ok(!Number.isNaN(new Date(ev.endTime.replace(" ", "T")).getTime()), `Invalid endTime in ${ev.id}`);
        }
    }

    for (const localeObj of [enLocale, ruLocale]) {
        for (const [tagId, desc] of Object.entries(localeObj.contractTagDesc || {})) {
            if (typeof desc !== "string") continue;
            const rendered = formatContractDescription(tagId, desc);
            assert.ok(!rendered.includes("NaN") && !rendered.includes("undefined"), `Bad contract desc for ${tagId}: ${rendered}`);
        }
    }

    for (const file of fs.readdirSync("src/lib/locales")) {
        if (!file.endsWith(".json")) continue;
        JSON.parse(fs.readFileSync(`src/lib/locales/${file}`, "utf8"));
    }

    for (const cid of Object.keys(characters)) {
        assert.ok(enLocale.characters?.[cid], `Missing EN locale for character: ${cid}`);
        assert.ok(ruLocale.characters?.[cid], `Missing RU locale for character: ${cid}`);
    }
    for (const wid of Object.keys(weapons)) {
        assert.ok(enLocale.weapons?.[wid] || enWeapons[wid]?.name, `Missing EN locale for weapon: ${wid}`);
        assert.ok(ruLocale.weapons?.[wid] || ruWeapons[wid]?.name, `Missing RU locale for weapon: ${wid}`);
    }

    return {
        items: Object.keys(items).length,
        enemies: enemyList.length,
        contractTags: tagList.length,
        banners: banners.length
    };
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, "/")}`) {
    const { createServer } = await import("vite");
    const vite = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
    try {
        console.log("PASS data-integrity", await verifyDataIntegrity(vite));
    } finally {
        await vite.close();
    }
}

