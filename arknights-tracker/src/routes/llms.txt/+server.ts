import type { RequestHandler } from "@sveltejs/kit";
import { characters } from "$lib/data/characters.js";
import { weapons } from "$lib/data/weapons.js";
import { equipment } from "$lib/data/items/equipment.js";
import { enemies } from "$lib/data/enemies.js";
import enEquip from "$lib/locales/en/equipment.json";
import enEnemies from "$lib/locales/en/enemies.json";
import enLocale from "$lib/locales/en.json";

function getOperatorDisplayName(op: { id: string; name: string }): string {
    if (op.id === "endministrator1") return "Endministrator (Female)";
    if (op.id === "endministrator2") return "Endministrator (Male)";
    return op.name;
}

export const GET: RequestHandler = ({ url }) => {
    const origin = url.origin;

    const opList = Object.values(characters || {})
        .filter((op) => op?.id && op?.name)
        .sort((a, b) => (b.rarity || 0) - (a.rarity || 0) || a.name.localeCompare(b.name))
        .map((op) => {
            const name = getOperatorDisplayName(op);
            const meta = [
                op.rarity ? `${op.rarity}★` : "",
                op.element || "",
                op.class || "",
                op.weapon ? `weapon: ${op.weapon}` : ""
            ].filter(Boolean).join(" ");

            return `- [${name} (${op.rarity}★)](${origin}/operators/${op.id}): ${meta}.`;
        })
        .join("\n");

    const wpnList = Object.values(weapons || {})
        .filter((w) => w?.id && w?.name)
        .sort((a, b) => (b.rarity || 0) - (a.rarity || 0) || a.name.localeCompare(b.name))
        .map((w) => {
            const meta = [
                w.rarity ? `${w.rarity}★` : "",
                w.weapon ? `type: ${w.weapon}` : ""
            ].filter(Boolean).join(" ");

            return `- [${w.name} (${w.rarity}★)](${origin}/weapons/${w.id}): ${meta}.`;
        })
        .join("\n");

    const partNames = ["Body", "Hand", "Accessory"];
    const equipDict = enEquip as Record<string, { name?: string }>;
    const equipList = Object.entries(equipment || {})
        .map(([id, eq]) => {
            const item = equipDict[id];
            const name = item?.name || id;
            const part = partNames[eq.partType] || "Accessory";
            const meta = [
                eq.rarity ? `${eq.rarity}★` : "",
                eq.tier || "",
                part
            ].filter(Boolean).join(" ");

            return {
                rarity: eq.rarity || 0,
                name,
                line: `- [${name} (${eq.rarity}★)](${origin}/equipment/${id}): ${meta}.`
            };
        })
        .sort((a, b) => (b.rarity - a.rarity) || a.name.localeCompare(b.name))
        .map((x) => x.line)
        .join("\n");

    const enemyNameDict = (enLocale.enemies || {}) as Record<string, string>;
    const enemyDetailsDict = enEnemies as Record<string, { name?: string; description?: string }>;
    const enemyList = Object.keys(enemies || {})
        .map((id) => {
            const details = enemyDetailsDict[id];
            const name = details?.name || enemyNameDict[id];
            if (!name) return null;
            const desc = details?.description ? `: ${details.description}` : "";
            return {
                name,
                line: `- [${name}](${origin}/enemies/${id})${desc}`
            };
        })
        .filter((x): x is { name: string; line: string } => Boolean(x))
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((x) => x.line)
        .join("\n");

    const content = `# Goyfield — Arknights: Endfield Database & Pull Tracker

> A comprehensive database and pull tracker for Arknights: Endfield. Provides detailed information on operators, weapons, equipment, crafting recipes, enemies, and gacha pull history.

## Database Hubs

- [Operators](${origin}/operators): Playable character database with stats, skills, talents, potentials, arts, audio, and upgrade materials.
- [Weapons](${origin}/weapons): Weapon catalog featuring skills, base stats, and ascension materials.
- [Equipment](${origin}/equipment): Gear sets, set bonuses, attribute modifiers, and equipment crafting.
- [Enemies](${origin}/enemies): Enemy archive detailing enemy stats, resistances, and encounter mechanics.
- [Recipes & Crafting](${origin}/recipes): Production recipes, material trees, and factory crafting chains.
- [Essences](${origin}/essences): Weapon essences, skill combinations, stat enhancements, and drop locations.

## Tools & Features

- [Pull Tracker](${origin}/records): Summoning history tracker with pity counters, banner statistics, and pull analytics.
- [Import Records](${origin}/records/import): Import gacha logs from official game files, Endmin, Protorig, and other tools.
- [Leaderboard](${origin}/leaderboard): Global summoning statistics and luck rankings.

## Operators

${opList}

## Weapons

${wpnList}

## Equipment

${equipList}

## Enemies

${enemyList}
`;

    return new Response(content, {
        headers: {
            "Content-Type": "text/markdown; charset=utf-8",
            "Cache-Control": "public, max-age=3600"
        }
    });
};
