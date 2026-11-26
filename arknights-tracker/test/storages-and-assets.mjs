import fs from "node:fs";
import assert from "node:assert/strict";

const EXTS = [".png", ".webp", ".jpg", ".jpeg", ".gif"];

function existsImageUrl(url) {
    if (!url) return false;
    const dot = url.lastIndexOf(".");
    const base = "static" + (dot === -1 ? url : url.slice(0, dot));
    return EXTS.some((ext) => fs.existsSync(base + ext));
}

export async function verifyStoragesAndAssets(vite) {
    const { characters } = await vite.ssrLoadModule("/src/lib/data/characters.js");
    const { weapons } = await vite.ssrLoadModule("/src/lib/data/weapons.js");
    const { characterStickers } = await vite.ssrLoadModule("/src/lib/data/characterStickers.ts");
    const { enemies } = await vite.ssrLoadModule("/src/lib/data/enemies.js");
    const { buildings } = await vite.ssrLoadModule("/src/lib/data/buildings/buildings.ts");
    const { rawEvents } = await vite.ssrLoadModule("/src/lib/data/timeline.ts");
    const { getImagePath } = await vite.ssrLoadModule("/src/lib/utils/imageUtils.ts");

    const { itemStorage } = await vite.ssrLoadModule("/src/lib/dataStorages/items/itemStorage.ts");
    const { fullBottleDataStorage } = await vite.ssrLoadModule("/src/lib/dataStorages/items/fullBottleDataStorage.ts");
    const { fullJarDataStorage } = await vite.ssrLoadModule("/src/lib/dataStorages/items/fullJarDataStorage.ts");
    const { minerStorage } = await vite.ssrLoadModule("/src/lib/dataStorages/buildings/minerStorage.ts");
    const { gasMinerStorage } = await vite.ssrLoadModule("/src/lib/dataStorages/buildings/gasMinerStorage.ts");
    const { pumpStorage } = await vite.ssrLoadModule("/src/lib/dataStorages/buildings/pumpStorage.ts");
    const { gasEnvStorage } = await vite.ssrLoadModule("/src/lib/dataStorages/gasEnv/gasEnvStorage.ts");
    const { RecipeDataStorage } = await vite.ssrLoadModule("/src/lib/classes/storages/recipes/RecipeDataStorage.ts");
    const { machineCraftDataStorage } = await vite.ssrLoadModule("/src/lib/dataStorages/crafts/machineCraftDataStorage.ts");
    const { manualCraftDataStorage } = await vite.ssrLoadModule("/src/lib/dataStorages/crafts/manualCraftDataStorage.ts");
    const { hubCraftDataStorage } = await vite.ssrLoadModule("/src/lib/dataStorages/crafts/hubCraftDataStorage.ts");

    const ruLocale = JSON.parse(fs.readFileSync("src/lib/locales/ru.json", "utf8"));
    const enLocale = JSON.parse(fs.readFileSync("src/lib/locales/en.json", "utf8"));

    assert.ok(itemStorage.list.length > 0, "itemStorage must not be empty");
    assert.ok(gasEnvStorage.list.length >= 0);

    for (const bottle of fullBottleDataStorage.list) {
        assert.ok(itemStorage.byId.get(bottle.liquidId), `Missing bottle liquidId: ${bottle.liquidId}`);
        assert.ok(itemStorage.byId.get(bottle.emptyBottleId), `Missing emptyBottleId: ${bottle.emptyBottleId}`);
    }
    for (const jar of fullJarDataStorage.list) {
        assert.ok(itemStorage.byId.get(jar.gasId), `Missing jar gasId: ${jar.gasId}`);
        assert.ok(itemStorage.byId.get(jar.emptyJarId), `Missing emptyJarId: ${jar.emptyJarId}`);
    }

    const rawRecipeLists = [
        machineCraftDataStorage.list,
        manualCraftDataStorage.list,
        hubCraftDataStorage.list
    ];

    let recipeCount = 0;
    for (const list of rawRecipeLists) {
        const rs = new RecipeDataStorage(list);
        for (const recipe of list) {
            recipeCount++;
            if (recipe.buildingId) {
                assert.ok(buildings[recipe.buildingId], `Recipe ${recipe.id} references unknown building: ${recipe.buildingId}`);
            }
            for (const ing of recipe.ingredients || []) {
                assert.ok(itemStorage.byId.get(ing.itemId), `Recipe ${recipe.id} unknown ingredient: ${ing.itemId}`);
                assert.ok(rs.asIncome.get(ing.itemId)?.length, `Missing asIncome index for ${ing.itemId}`);
            }
            for (const out of recipe.outcomes || []) {
                assert.ok(itemStorage.byId.get(out.itemId), `Recipe ${recipe.id} unknown outcome: ${out.itemId}`);
                assert.ok(rs.asOutcome.get(out.itemId)?.length, `Missing asOutcome index for ${out.itemId}`);
            }
        }
    }

    assert.ok(minerStorage.list.length > 0, "minerStorage must not be empty");
    assert.ok(gasMinerStorage.list.length > 0, "gasMinerStorage must not be empty");
    assert.ok(pumpStorage.list.length > 0, "pumpStorage must not be empty");

    for (const char of Object.values(characters)) {
        assert.ok(existsImageUrl(getImagePath(char.id, "operator-icon")), `Missing operator-icon for ${char.id}`);
        if (char.gameId) {
            assert.ok(existsImageUrl(getImagePath(char.gameId, "operator-preview")), `Missing operator-preview for ${char.id}`);
        }
    }

    for (const w of Object.values(weapons)) {
        assert.ok(existsImageUrl(getImagePath(w.id, "weapon-icon")), `Missing weapon-icon for ${w.id}`);
    }

    for (const [charId, files] of Object.entries(characterStickers)) {
        for (const file of files) {
            assert.ok(fs.existsSync(`static/images/stickers/${file}`), `Missing sticker ${file} for ${charId}`);
        }
    }

    for (const b of Object.values(buildings)) {
        assert.ok(existsImageUrl(getImagePath(b.iconId || b.id, "building-icon")), `Missing building-icon for ${b.id}`);
    }

    for (const e of Object.values(enemies)) {
        if (enLocale.enemies?.[e.id] || ruLocale.enemies?.[e.id]) {
            assert.ok(existsImageUrl(getImagePath(e.id, "enemy-icon")), `Missing enemy-icon for ${e.id}`);
        }
    }

    for (const ev of rawEvents) {
        if (ev.icon) {
            assert.ok(existsImageUrl(getImagePath(ev.icon, "event-icon")), `Missing event-icon ${ev.icon} for ${ev.id}`);
        }
    }

    return {
        recipes: recipeCount,
        stickers: Object.values(characterStickers).flat().length
    };
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, "/")}`) {
    const { createServer } = await import("vite");
    const vite = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
    try {
        console.log("PASS storages-and-assets", await verifyStoragesAndAssets(vite));
    } finally {
        await vite.close();
    }
}

