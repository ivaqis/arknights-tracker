export function getRarityColor(rarity) {
    switch (rarity) {
        case 6: return "#F4700C";
        case 5: return "#F9B90C";
        case 4: return "#9253F1";
        case 3: return "#25B9F9";
        case 2: return "#A5B100";
        default: return "#8F8F8F";
    }
}

export function getTextColorByAttr(attr) {
    return attrId2TextColor[attr] ?? "";
}

const attrId2TextColor = {
    attr_firedam: "text-[#FE633D]",
    attr_icedam: "text-[#22C6D0]",
    attr_naturaldam: "text-[#AFCD47] dark:text-[#C3E354]",
    attr_pulsedam: "text-[#FEC001]",
    attr_phydam: "text-slate-500 dark:text-slate-300",
};

export function getTextColorByElement(element) {
    return element2TextColor[element] ?? "";
}

const element2TextColor = {
    "heat": "text-[#FE633D]",
    "cryo": "text-[#22C6D0]",
    "nature": "text-[#AFCD47] dark:text-[#C3E354]",
    "electric": "text-[#FEC001]",
    "physical": "text-slate-500 dark:text-slate-300"
};

export function getHexColorByElement(element) {
    return element2HexColor[element] ?? "#5E5D5D";
}

const element2HexColor = {
    fire: "#FF613D",
    cryst: "#21C4CE",
    natural: "#AABD00",
    pulse: "#FFBF00",
    physical: "#5E5D5D"
};

export function getGradientColorByElement(element) {
    return element2GradientColor[element] ?? "";
}

const element2GradientColor = {
    physical: "from-gray-500/30 to-transparent",
    cryo: "from-[#21C4CE]/30 to-transparent",
    nature: "from-[#76C104]/30 to-transparent",
    electric: "from-[#FFBF00]/30 to-transparent",
    heat: "from-[#FF613D]/30 to-transparent",
};