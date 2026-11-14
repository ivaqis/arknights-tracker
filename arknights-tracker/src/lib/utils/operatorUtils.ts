import { characters } from "$lib/data/characters.js";
import { weapons } from "$lib/data/weapons.js";

export const charOrderMap: Record<string, number> = Object.keys(characters || {}).reduce((acc: Record<string, number>, key, idx) => {
    acc[key] = idx;
    return acc;
}, {});

export function getSvelteCharId(char: any): string {
    if (!char) return "";
    const raw = typeof char === "string" ? char : (char.id || char.charId || char.charData?.id || "");
    const found = (characters as Record<string, any>)[raw] || Object.values(characters as Record<string, any>).find((c: any) => c.gameId === raw || c.apiId === raw || c.id === raw);
    return found ? found.id : raw;
}

export function mapProfessionToClass(key?: string | null): string {
    if (!key) return "guard";
    return key.replace("profession_", "");
}

export function mapPropertyToElement(key?: string | null): string | null {
    if (!key) return null;
    return key.replace("char_property_", "");
}

export function getOperatorData(char: any): any {
    const svelteId = getSvelteCharId(char);
    const staticData = (characters as Record<string, any>)[svelteId] || Object.values(characters as Record<string, any>).find((c: any) => c.gameId === svelteId || c.apiId === svelteId || c.id === svelteId);
    if (staticData) {
        return staticData;
    }

    return {
        id: char?.charData?.avatarSqUrl || svelteId || char?.id,
        name: char?.charData?.name || char?.name || "Operator",
        rarity: Number(char?.charData?.rarity?.value || char?.rarity || 4),
        class: mapProfessionToClass(char?.charData?.profession?.key) || "guard",
        element: mapPropertyToElement(char?.charData?.property?.key) || null
    };
}

export function getWeaponData(weapon: any): any {
    if (!weapon) return null;
    const skillKey = weapon.weaponData?.skills?.find((s: any) => s.key?.startsWith("sk_wpn_"))?.key;
    const gameId = skillKey ? skillKey.replace("sk_", "") : (weapon.id || weapon.weaponData?.id);
    const staticData = Object.values(weapons as Record<string, any> || {}).find((w: any) => w.id === gameId || w.gameId === gameId);
    if (staticData) {
        return staticData;
    }
    return {
        id: gameId,
        name: weapon.weaponData?.name || weapon.name || gameId,
        rarity: Number(weapon.weaponData?.rarity?.value || weapon.rarity?.value || weapon.rarity || 4),
        type: weapon.weaponData?.type?.value || weapon.type || "sword"
    };
}

