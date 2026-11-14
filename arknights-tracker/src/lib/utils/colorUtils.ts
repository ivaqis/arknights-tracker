export function getRarityColor(rarity: number): string {
    switch (rarity) {
        case 6: return "#F4700C";
        case 5: return "#F9B90C";
        case 4: return "#9253F1";
        case 3: return "#25B9F9";
        case 2: return "#A5B100";
        default: return "#8F8F8F";
    }
}

export function getWeaponBg(rarity: number): string {
    if (rarity === 6) return "bg-gradient-to-t from-[#591C00] to-[#BD896E]";
    if (rarity === 5) return "bg-gradient-to-t from-[#261E00] to-[#E3BC55]";
    if (rarity === 4) return "bg-gradient-to-t from-[#1A002E] to-[#9C62F6]";
    return "bg-gradient-to-t from-[#1a1a1a] to-[#666666]";
}

const attrId2TextColor: Record<string, string> = {
    attr_firedam: "text-[#FE633D]",
    attr_icedam: "text-[#22C6D0]",
    attr_naturaldam: "text-[#AFCD47] dark:text-[#C3E354]",
    attr_pulsedam: "text-[#FEC001]",
    attr_phydam: "text-slate-500 dark:text-slate-300",
};

export function getTextColorByAttr(attr: string): string {
    return attrId2TextColor[attr] ?? "";
}

const element2TextColor: Record<string, string> = {
    heat: "text-[#FE633D]",
    cryo: "text-[#22C6D0]",
    nature: "text-[#AFCD47] dark:text-[#C3E354]",
    electric: "text-[#FEC001]",
    physical: "text-slate-500 dark:text-slate-300"
};

export function getTextColorByElement(element: string): string {
    return element2TextColor[element] ?? "";
}

const element2HexColor: Record<string, string> = {
    fire: "#FF613D",
    heat: "#FF613D",
    cryst: "#21C4CE",
    cryo: "#21C4CE",
    natural: "#AABD00",
    nature: "#AABD00",
    pulse: "#FFBF00",
    electric: "#FFBF00",
    physical: "#5E5D5D"
};

export function getHexColorByElement(element: string): string {
    return element2HexColor[element] ?? "#5E5D5D";
}

const element2GradientColor: Record<string, string> = {
    physical: "from-gray-500/30 to-transparent",
    cryo: "from-[#21C4CE]/30 to-transparent",
    nature: "from-[#76C104]/30 to-transparent",
    electric: "from-[#FFBF00]/30 to-transparent",
    heat: "from-[#FF613D]/30 to-transparent",
};

export function getGradientColorByElement(element: string): string {
    return element2GradientColor[element] ?? "";
}

export function getRankTagStyle(rank: number | null | undefined, hasBorder: boolean = true): string {
    if (rank === 1) return "bg-[#FFE145] text-gray-900";
    if (rank === 2) return "bg-[#C0C0C0] text-gray-900";
    if (rank === 3) return "bg-[#CD7F32] text-white";
    if (!hasBorder) return "bg-white/10 text-gray-300 border border-white/15";
    return "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/15";
}

export function getRankColor(rank: number | null | undefined): string {
    if (rank === 1) return "#FFE145";
    if (rank === 2) return "#C0C0C0";
    if (rank === 3) return "#CD7F32";
    return "";
}

