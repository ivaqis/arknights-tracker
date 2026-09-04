import { characters } from "$lib/data/characters";
import { weapons } from "$lib/data/weapons";

export class PullNameCanonicalizer {
    private static readonly _nameMap: Record<string, string> = PullNameCanonicalizer.initMap();

    private static initMap(): Record<string, string> {
        const map: Record<string, string> = {
            "contingent measure": "Prominent Edge",
            "prominent edge": "Prominent Edge"
        };

        for (const c of Object.values(characters)) {
            if (c.name) {
                map[c.name.toLowerCase()] = c.name;
            }
            if (c.id) {
                map[c.id.toLowerCase()] = c.name;
            }
        }

        for (const w of Object.values(weapons)) {
            if (w.name) {
                map[w.name.toLowerCase()] = w.name;
            }
            if (w.id) {
                map[w.id.toLowerCase()] = w.name;
            }
        }

        return map;
    }

    public static normalize(str: string | null | undefined): string {
        return str?.toLowerCase().replace(/[^a-z0-9]/g, "") || "";
    }

    public static canonicalize(rawName: string | null | undefined): string {
        if (!rawName) {
            return "";
        }

        const trimmed = String(rawName).trim();
        const lower = trimmed.toLowerCase();

        if (this._nameMap[lower]) {
            return this._nameMap[lower];
        }

        return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    }
}
