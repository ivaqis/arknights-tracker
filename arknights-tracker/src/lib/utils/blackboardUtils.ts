const BLACKBOARD_FALLBACKS: Record<string, string[]> = {
    PhysicalAndSpellInflictionEnhance: ["OriginiumArts"],
    NormalSkillDamageIncrease: ["NormalSkillEfficiency"],
};

export function interpolateBlackboard(
    text: string,
    bb?: Record<string, any> | null,
    options?: { wrapSpan?: boolean }
): string {
    if (!text) return "";
    if (!bb || Object.keys(bb).length === 0) return text;
    const wrapSpan = options?.wrapSpan ?? true;

    return text.replace(/\{([^{}]+)\}/g, (match, content) => {
        const [expr, format] = content.split(":");
        const localBb: Record<string, any> = { ...bb };

        for (const [key, fallbacks] of Object.entries(BLACKBOARD_FALLBACKS)) {
            if (localBb[key] === undefined) {
                for (const fallbackKey of fallbacks) {
                    if (localBb[fallbackKey] !== undefined) {
                        localBb[key] = localBb[fallbackKey];
                        break;
                    }
                }
            }
        }

        let mathStr = expr.replace(/\b(\d+),(\d+)\b/g, (m: string, f: string) => Object.keys(bb)[Number(f)] || m);

        for (const key in localBb) {
            const regex = new RegExp(`\\b${key}\\b`, "gi");
            mathStr = mathStr.replace(regex, `(${localBb[key]})`);
        }

        if (/[^0-9+\-*/().\s]/.test(mathStr)) return match;

        let result: any = 0;
        try {
            result = new Function("return " + mathStr)();
        } catch {
            return match;
        }

        if (format) {
            if (format.includes("%")) {
                result = Number.parseFloat((result * 100).toFixed(4)) + "%";
            } else if (format === "0") {
                result = Math.round(result);
            } else {
                result = Number.parseFloat(Number(result).toFixed(4));
            }
        }
        return wrapSpan
            ? `<span class="text-[#38BDF8] font-bold drop-shadow-sm">${result}</span>`
            : `${result}`;
    });
}
