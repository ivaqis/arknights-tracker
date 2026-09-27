import type { PageLoad } from "./$types";

const aliases: Record<string, string> = {
    "wisd": "int",
    "criticalrate": "crirate",
    "crit": "crirate",
    "crit_up": "crirate",
    "ultimatespgainscalar": "usp",
    "usgs": "usp",
    "sp_gain": "usp",
    "crystandpulsedamageincrease": "alldamagetakenscalar",
    "spelldamageincrease": "alldamagetakenscalar",
    "allskilldamageincrease": "alldamagetakenscalar",
    "sub": "alldamagetakenscalar",
    "main": "alldamagetakenscalar",
    "circle": "alldamagetakenscalar",
    "fireandnaturaldamageincrease": "alldamagetakenscalar",
    "healoutputincrease": "heal",
    "originiumarts": "magicdam",
    "physical_damage": "physicaldamageincrease",
    "phy_dmg_up": "physicaldamageincrease",
    "cryst_dmg_up": "cryo",
    "fire_dmg_up": "heat",
    "pulse_dmg_up": "electric",
    "ice_dmg_up": "cryo",
    "spell_dmg_up": "magicdam"
};

export const load: PageLoad = async ({ fetch }) => {
    const res = await fetch("/images/icons.svg");
    if (!res.ok) {
        return {
            icons: [],
            svgMap: {}
        };
    }

    const svgText = await res.text();

    const defElementRegex =
        /<(clipPath|mask|linearGradient|radialGradient|filter|pattern)\s+[^>]*id=["']([^"']+)["'][^>]*>([\s\S]*?)<\/\1>/gi;
    const defsMap: Record<string, string> = {};
    let dm: RegExpExecArray | null;
    while ((dm = defElementRegex.exec(svgText)) !== null) {
        defsMap[dm[2]] = dm[0];
    }

    const symbolRegex = /<symbol\s+([^>]*?)>([\s\S]*?)<\/symbol>/gi;
    const svgMap: Record<string, string> = {};
    const icons: string[] = [];
    let sm: RegExpExecArray | null;

    while ((sm = symbolRegex.exec(svgText)) !== null) {
        const attrs = sm[1];
        const inner = sm[2].trim();
        const idMatch = attrs.match(/id=["']([^"']+)["']/);
        const vbMatch = attrs.match(/viewBox=["']([^"']+)["']/);

        if (idMatch) {
            const id = idMatch[1];
            icons.push(id);
            const viewBox = vbMatch ? vbMatch[1] : "0 0 24 24";
            const vbParts = viewBox.split(" ").map(Number);
            const w =
                vbParts.length === 4 && !isNaN(vbParts[2]) ? vbParts[2] : 24;
            const h =
                vbParts.length === 4 && !isNaN(vbParts[3]) ? vbParts[3] : 24;

            const refMatches = [...inner.matchAll(/url\(#([^)]+)\)/g)].map(
                (m) => m[1]
            );
            let defsString = "";
            if (refMatches.length > 0) {
                const neededDefs = refMatches
                    .map((ref) => defsMap[ref])
                    .filter(Boolean);
                if (neededDefs.length > 0) {
                    defsString = `<defs>\n${neededDefs.join("\n")}\n</defs>\n`;
                }
            }

            const standaloneSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${viewBox}" fill="none">\n${defsString}${inner}\n</svg>`;
            svgMap[id] = standaloneSvg;
        }
    }

    for (const [alias, target] of Object.entries(aliases)) {
        if (svgMap[target]) {
            svgMap[alias] = svgMap[target];
            icons.push(alias);
        }
    }

    const uniqueIcons = Array.from(new Set(icons)).sort((a, b) =>
        a.localeCompare(b)
    );

    return {
        icons: uniqueIcons,
        svgMap
    };
};
